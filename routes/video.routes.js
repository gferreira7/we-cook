const { Router } = require('express')

const router = new Router()
require('dotenv').config()
const mongoose = require('mongoose')

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')
const User = require('../models/User.model.js')
const Recipe = require('../models/Recipe.model.js')
const Review = require('../models/Review.model.js')

const {
  timePassedSince,
  toHoursAndMinutes,
  getRating,
} = require('../controllers/helpers')
const { getFoodDetails } = require('../config/fatSecret.config')

router.get('/watch/:videoId', secured, async (req, res, next) => {
  let { videoId } = req.params

  try {
    let currentUser = await User.findOne({ authId: req.user.id }).exec()
    const video = await Video.findById(videoId)
      .populate('author')
      .populate('recipe')
      .populate({ path: 'reviews', populate: 'author', select: 'channelName' })
    const timeSinceUpload = timePassedSince(video.createdAt.getTime())

    let nutritionInfo
    if (video.recipe) {
      nutritionInfo = await Promise.all(
        video.recipe.ingredients.map(async (ingredient) => {
          console.log(ingredient)
          const response = await getFoodDetails(ingredient)
          return response
        })
      )
    }

    const isUploader = req.user.id === video.author.authId

    let relatedVideos
    try {
      relatedVideos = await Video.find({
        category: { $regex: `${video.category}`, $options: 'i' },
      })
        .populate('author')
        .sort({ views: -1 })
    } catch (error) {
      console.log(error)
    }

    const reviews = await Review.find({ video: videoId }).populate('author')
    console.log(reviews)

    if (isUploader) {
      res.render('watch-page-uploader', {
        title: video.title,
        currentUser,
        video,
        reviews,
        timeSinceUpload,
        relatedVideos,
      })
    } else{
         
    res.render('watch-page-viewer', {
      title: video.title,
      currentUser,
      video,
      reviews,
      timeSinceUpload,
      relatedVideos,
    })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/search', secured, async (req, res, next) => {
  let {
    search,
    categoryFilter,
    authorFilter,
    titleFilter,
    tagsFilter,
    allFilter,
  } = req.body

  let currentUser = await User.findOne({ authId: req.user.id }).exec()

  let searchParams = {}

  const regex = new RegExp(search, 'i')

  if (categoryFilter == 'on') {
    searchParams = { category: { $regex: regex } }
  } else if (titleFilter == 'on') {
    searchParams = { title: { $regex: regex } }
  } else if (tagsFilter == 'on') {
    searchParams = { tags: { $regex: regex } }
  } else {
    searchParams = { title: { $regex: regex } }
  }

  if (allFilter == 'on') {
    searchParams = {
      $or: [
        { title: { $regex: regex } },
        { tags: { $in: [regex] } },
        { category: { $regex: regex } },
      ],
    }
  }

  if (authorFilter == 'on') {
    let videosArray = []
    let usersFromDB = await User.find({ channelName: { $regex: regex } })

    usersFromDB.forEach((element) => {
      Video.find({ author: element._id })
        .populate('author')
        .then((videos) => {
          videosArray.push(videos)

          res.render('video-search', {
            title: search,
            currentUser,
            videos: videos,
            // show results page with count
            count: videos.length,
          })
        })
        .catch((err) => {
          console.log(err)
          next(err)
        })
    })
  } else {
    Video.find(searchParams)
      .populate('author')
      .then((videos) => {
        res.render('video-search', {
          title: search,
          currentUser,
          videos: videos,
          // show results page with count
          count: videos.length,
        })
      })
      .catch((err) => {
        console.log(err)
        next(err)
      })
  }
})

router.post('/video/:videoId/update', async (req, res, next) => {
  const { videoId } = req.params
  const { updateCriteria } = req.body
  const currentUser = await User.findOne({ authId: req.user.id })
  const videoFromDB = await Video.findById(videoId)
  const { likes, dislikes } = videoFromDB

  if (updateCriteria === 'views') {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    )
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $addToSet: { watchHistory: videoId } },
      { new: true }
    ) 
    res.status(200).json(`views: ${updatedVideo.views}`)
  }

  if (updateCriteria === 'like') {
    let updatedVideo
    //check if user already disliked
    if (dislikes && dislikes.includes(currentUser._id)) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { likes: currentUser._id },
          $pull: { dislikes: currentUser._id },
        },
        { new: true }
      )
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { likes: currentUser._id } },
        { new: true }
      )
    }
    res.status(200).json(updatedVideo)
  }

  if (updateCriteria === 'dislike') {
    let updatedVideo
    //check if user liked
    if (likes !== undefined && likes.includes(currentUser._id)) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { dislikes: currentUser._id },
          $pull: { likes: currentUser._id },
        },
        { new: true }
      )
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { dislikes: currentUser._id } },
        { new: true }
      )
    }
    res.status(200).json(updatedVideo)
  }
})

router.post('/video/:videoId/submitReview', async (req, res, next) => {
  const { reviewData } = req.body
  const { videoId } = req.params
  const loggedInUser = await User.findOne({ authId: req.user.id })

  let reviewToDB = {
    comment: reviewData.comment,
    rating: parseInt(reviewData.rating),
    video: videoId,
    author: loggedInUser._id,
  }

  try {
    let newReview = await Review.create(reviewToDB)

    if (newReview) {
      const averageRating = await getRating(videoId)
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { averageRating },
        { new: true }
      )
      res.status(200).json(updatedVideo)
    } else {
      res.status(500)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send('Error creating review')
  }
})


module.exports = router
