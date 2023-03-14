const { Router } = require('express')
const router = new Router()

const mongoose = require('mongoose')

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')
const User = require('../models/User.model.js')

const { timePassedSince, toHoursAndMinutes } = require('../controllers/helpers')

router.get('/watch/:videoId', secured, async (req, res, next) => {
  let { videoId } = req.params

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  Video.findById(videoId)
    .populate('author')
    .populate('recipe')
    .then((video) => {
      const timeSinceUpload = timePassedSince(video.createdAt.getTime())

      const isUploader = req.user.id === video.author.authId      
      console.log(video)
      res.render('single-video', {
        title: video.title,
        userProfile,
        video,
        timeSinceUpload,
        isUploader,
      })
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

router.post('/search', secured, async (req, res, next) => {
  let { search } = req.body

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  Video.find({ title: { $regex: search, $options: 'i' } })
    .populate('author')
    .then((videos) => {
      res.render('videos/video-search', {
        title: search,
        userProfile,
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

router.post('/video/:videoId/update', async (req, res, next) => {
  const { videoId } = req.params
  const { toUpdate } = req.body
  const currentUser = await User.findOne({ authId: req.user.id })
  const videoFromDB = await Video.findById(videoId)
  const { likes, dislikes } = videoFromDB

  if (toUpdate === 'views') {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    )
    res.status(200).json(`views: ${updatedVideo.views}`)
  }

  if (toUpdate === 'like') {
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

  if (toUpdate === 'dislike') {
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
      console.log('Dislikes', updatedVideo.dislikes)
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { dislikes: currentUser._id } },
        { new: true }
      )
      console.log('Dislikes', updatedVideo.dislikes)
    }
    res.status(200).json(updatedVideo)
  }
})

module.exports = router
