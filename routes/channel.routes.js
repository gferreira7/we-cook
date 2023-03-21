const { Router } = require('express')
const router = new Router()
require('dotenv').config()

const stream = require('stream')
const fs = require('fs')
const { promisify } = require('util')

const secured = require('../middleware/route-guard')
const { getFoodDetails } = require('../config/fatSecret.config')
const {
  uploadVideo,
  getVideo,
  uploadImg,
} = require('../config/cloudinary.config')

const { toHoursAndMinutes } = require('../controllers/helpers')

const mongoose = require('mongoose') // <== has to be added

const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const os = require('os')
const path = require('path')
// const tmpFolder = path.join(os.tmpdir(), 'uploads')
const upload = multer({ dest: os.tmpdir() })

// import models here
const Video = require('../models/Video.model')
const User = require('../models/User.model')
const Recipe = require('../models/Recipe.model')

router.get('/profile', secured, async (req, res, next) => {
  let loggedInUser = await User.findOne({ authId: req.user.id })
  const allVideos = await Video.find().populate('author').populate('recipe')

  // My Uploads
  const uploadedVideos = allVideos.filter((video) => {
    return video.author._id.equals(loggedInUser._id)
  })
  // My liked Videos
  const likedVideos = allVideos.filter((video) =>
    video.likes.includes(loggedInUser._id)
  )
  console.log(uploadedVideos)
  res.render('profile/currentUser-profile', {
    title: 'Profile',
    uploadedVideos,
    likedVideos,
    userProfile: loggedInUser,
    currentUser: loggedInUser,
  })
})

router.get('/profile/:channelName', secured, async (req, res, next) => {
  try {
    const { channelName } = req.params

    let profileOwner = await User.findOne({ channelName: channelName })
    let loggedInUser = await User.findOne({ authId: req.user.id })

    if (profileOwner._id.equals(loggedInUser._id)) {
      res.redirect('/profile')
    }
    
    const videos = await Video.find({ author: profileOwner._id }).populate(
      'author'
      )
      console.log(profileOwner._id.equals(loggedInUser._id))
      
      // Profile's Uploads
      
      const uploadedVideos = videos.filter((video) => {
        return video.author._id.equals(profileOwner._id)
      })

    // Profile's liked Videos
    const likedVideos = videos.filter((video) =>
      video.likes.includes(profileOwner._id)
    )
    res.render('profile/otherUser-profile', {
      title: 'Profile',
      videos,
      uploadedVideos,
      likedVideos,
      userProfile: profileOwner,
      currentUser: loggedInUser,
    })
  } catch (error) {
    res.status(500).json({'message': error})
  }
})

router.get(
  '/profile/:idFromDB/accountSettings',
  secured,
  async (req, res, next) => {
    const { idFromDB } = req.params

    let userFromDB = await User.findById(idFromDB).exec()

    Video.find({ author: userFromDB._id })
      .populate('author')
      .then((videos) => {
        res.render('profile/account-settings', {
          title: 'Account Settings',
          videos,
          currentUser: userFromDB,
        })
      })
      .catch((error) => {
        console.log('Error while getting the videos from the DB: ', error)

        // Call the error-middleware to display the error page to the user
        next(error)
      })
  }
)

router.post(
  '/profile/:idFromDB/accountSettings',
  secured,
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 },
  ]),
  async (req, res, next) => {
    console.log(req.files)
    const { idFromDB } = req.params
    const {
      channelName,
      description,
      instagram,
      twitter,
      facebook,
      discord,
      youtube,
    } = req.body
    const socialLinks = { instagram, twitter, facebook, discord, youtube }

    const newAccountSettings = {}
    newAccountSettings.socialLinks = socialLinks
    // Check if banner image is provided
    if (req.files.bannerImage !== undefined) {
      const bannerImage = req.files.bannerImage[0]
      const uploadedBannerImage = await uploadImg(bannerImage.path)
      newAccountSettings.bannerImage = uploadedBannerImage
      fs.unlinkSync(bannerImage.path.toString())
    }

    // Check if profile pic is provided
    if (req.files.profilePic !== undefined) {
      const profilePic = req.files.profilePic[0]
      const uploadedProfilePic = await uploadImg(profilePic.path)
      newAccountSettings.profilePic = uploadedProfilePic
      fs.unlinkSync(profilePic.path.toString())
    }

    if (channelName) {
      newAccountSettings.channelName = channelName
    }
    if (description) {
      newAccountSettings.description = description
    }

    let updatedUser = await User.findByIdAndUpdate(
      idFromDB,
      newAccountSettings,
      { new: true }
    ).exec()

    res.redirect('/profile')
  }
)

router.get(
  '/profile/:profileId/manageVideos',
  secured,
  async (req, res, next) => {
    const { profileId } = req.params
    const profileUser = await User.findById(profileId)
    const loggedInUser = await User.findOne({ authId: req.user.id })

    if (profileUser._id.equals(loggedInUser._id)) {
      try {
        const videos = await Video.find({ author: profileId })
          .populate('author')
          .populate('recipe')

        res.render('profile/manage-videos', {
          title: 'Manage Videos',
          videos,
          currentUser: loggedInUser,
        })
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
    } else {
      res.redirect('/')
    }
  }
)

router.post(
  '/profile/:profileId/video/edit/',
  secured,
  upload.single('thumbnail'),
  async (req, res, next) => {
    const { profileId } = req.params
    const { title, description, category, videoId } = req.body

    const newVideoInfo = {}

    // Check if thumbnail image is provided
    if (req.file !== undefined) {
      const thumbnail = req.file
      const uploadedThumbnail = await uploadImg(thumbnail.path)
      newVideoInfo.thumbnail = uploadedThumbnail
      fs.unlinkSync(thumbnail.path.toString())
    }

    if (title) {
      newVideoInfo.title = title
    }
    if (description) {
      newVideoInfo.description = description
    }
    if (category) {
      newVideoInfo.category = category
    }

    let updatedVideo = await Video.findByIdAndUpdate(videoId, newVideoInfo, {
      new: true,
    }).exec()

    res.redirect(`/watch/${videoId}`)
  }
)

router.post(
  '/profile/:profileId/video/delete',
  secured,
  async (req, res, next) => {
    const { profileId } = req.params
    try {
      const { videoId } = req.body

      console.log(videoId, 'in the route')

      const deletedVideo = await Video.findByIdAndDelete(videoId)

      if (!deletedVideo) {
        throw new Error('Video not found')
      }

      res.redirect(`/profile/${profileId}/manageVideos`)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/profile/:idFromDB/uploadedVideos', async (req, res, next) => {
  const { idFromDB } = req.params

  let isChannelOwner
  let userFromDB = await User.findById(idFromDB)

  if (userFromDB.authId === req.user.id) {
    isChannelOwner = true
  } else {
    isChannelOwner = false
  }

  Video.find({ author: idFromDB })
    .populate('author')
    .then((videos) => {
      res.render('profile/list-channel-videos', {
        title: 'Profile',
        videos,
        isChannelOwner,
        currentUser: userFromDB,
      })
    })
    .catch((error) => {
      console.log('Error while getting the videos from the DB: ', error)

      // Call the error-middleware to display the error page to the user
      next(error)
    })
})

router.get('/profile/:idFromDB/likedVideos', async (req, res, next) => {
  const { idFromDB } = req.params

  let isChannelOwner
  let userFromDB = await User.findById(idFromDB)

  if (userFromDB.authId === req.user.id) {
    isChannelOwner = true
  } else {
    isChannelOwner = false
  }

  const allVideos = await Video.find().populate('author')

  // liked videos
  const videos = allVideos.filter((video) =>
    video.likes.includes(userFromDB._id)
  )

  res.render('profile/list-channel-videos', {
    title: 'Profile',
    videos,
    isChannelOwner,
    currentUser: userFromDB,
  })
})

router.post(
  '/upload',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let videoToDB = {}
      let recipeToDB = {}

      let video
      let image

      if (req.files.video !== undefined) {
        video = req.files.video[0]
        const buffer = fs.readFileSync(video.path.toString())
        const uploadedVideo = await uploadVideo(buffer)
        fs.unlinkSync(video.path.toString())
        let durationInHMS = toHoursAndMinutes(
          Math.floor(uploadedVideo.duration)
        )

        videoToDB.cloudId = uploadedVideo.public_id
        videoToDB.url = uploadedVideo.secure_url
        videoToDB.format = uploadedVideo.format
        videoToDB.durationInSeconds = uploadedVideo.duration
        videoToDB.durationInHMS = durationInHMS
      }
      if (req.files.image !== undefined) {
        image = req.files.image[0]
        const uploadedImage = await uploadImg(image.path)
        fs.unlinkSync(image.path.toString())
        videoToDB.thumbnail = uploadedImage
      }

      const {
        title,
        description,
        mealType,
        stepsList,
        category,
        cookTime,
        ingredientsList,
        tagsList,
        portions,
      } = req.body

      let userIdFromDB = await User.findOne({ authId: req.user.id }).exec()
      videoToDB.author = userIdFromDB._id
      recipeToDB.author = userIdFromDB._id

      if (title) {
        videoToDB.title = title
      }
      if (description) {
        videoToDB.description = description
      }
      if (mealType) {
        recipeToDB.mealType = mealType
      }
      if (cookTime) {
        recipeToDB.cookTime = parseInt(cookTime)
      }
      if (portions) {
        recipeToDB.portions = parseInt(portions)
      }
      if (tagsList) {
        videoToDB.tagsList = JSON.parse(tagsList)
      }
      if (category) {
        videoToDB.category = category
      }

      //Recipe Info
      if (stepsList) {
        recipeToDB.steps = JSON.parse(stepsList)
      }
      if (ingredientsList) {
        recipeToDB.ingredients = JSON.parse(ingredientsList)
      }
      // save recipe ID to video Document

      //recipe here
      let nutritionInfo
      try {
        if (recipeToDB.ingredients) {
          nutritionInfo = await Promise.all(
            recipeToDB.ingredients.map(async (ingredient) => {
              const response = await getFoodDetails(ingredient)
              return response
            })
          )
        }
      } catch (error) {
        console.error(error)
      }
      recipeToDB.ingredients = nutritionInfo

      console.log(recipeToDB)

      const recipeId = await Recipe.create(recipeToDB)

      console.log('recipeId:' + recipeId)

      const now = new Date()

      const day = now.getDate()
      const month = now.getMonth() + 1 // Adiciona 1 porque os meses começam em zero
      const year = now.getFullYear()
      const hour = now.getHours()
      videoToDB.uploadedDate = {
        day: day,
        month: month,
        year: year,
        hour: hour,
      }

      videoToDB.recipe = recipeId._id

      const createdVideo = await Video.create(videoToDB)

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        recipeId,
        { video: createdVideo._id },
        { new: true }
      )

      res.status(200).json(createdVideo._id)
    } catch (error) {
      console.error(error)
    }
  }
)

router.get('/history', async (req, res, next) => {
  res.render('test', {
    title: 'history',
  })
})

module.exports = router
