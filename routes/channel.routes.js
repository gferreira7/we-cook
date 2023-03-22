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

const { toHoursAndMinutes, cookTimeConvert } = require('../controllers/helpers')

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
  const allUploads = allVideos.filter((video) => {
    return video.author._id.equals(loggedInUser._id)
  })
  // My liked Videos
  const allLikedVideos = allVideos.filter((video) =>
    video.likes.includes(loggedInUser._id)
  )
  const uploadedVideos = allUploads.slice(0, 3)
  const likedVideos = allLikedVideos.slice(0, 3)

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

    // Profile's Uploads

    const allUploads = videos.filter((video) => {
      return video.author._id.equals(profileOwner._id)
    })

    // Profile's liked Videos
    const allLikedVideos = videos.filter((video) =>
      video.likes.includes(profileOwner._id)
    )
    const uploadedVideos = allUploads.slice(0, 3)
    const likedVideos = allLikedVideos.slice(0, 3)

    //subscribe

    let action = false
    const subscribe = profileOwner.subscribers.find((sub) =>
      sub._id.equals(loggedInUser._id)
    )

    if (subscribe) {
      action = true
    }

    profileOwner.follower = action

    res.render('profile/otherUser-profile', {
      title: 'Profile',
      videos,
      uploadedVideos,
      likedVideos,
      userProfile: profileOwner,
      currentUser: loggedInUser,
    })
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

router.get(
  '/profile/:profileId/accountSettings',
  secured,
  async (req, res, next) => {
    const { profileId } = req.params

    let currentUser = await User.findById(profileId)

    res.render('profile/account-settings', {
      title: 'Account Settings',
      currentUser,
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

    try {
      if (profileUser._id.equals(loggedInUser._id)) {
        try {
          const videos = await Video.find({ author: profileId })
            .populate('author')
            .populate({
              path: 'recipe',
              populate: {
                path: 'ingredients',
                select: 'quantity',
              },
            })

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
    } catch (error) {
      console.log(error)
    }
  }
)

router.get(
  '/profile/:profileId/edit/:videoId',
  secured,
  async (req, res, next) => {
    const { profileId, videoId } = req.params

    const profileUser = await User.findById(profileId)
    const loggedInUser = await User.findOne({ authId: req.user.id })

    //logged in user is accessing own profile
    if (profileUser._id.equals(loggedInUser._id)) {
      try {
        const video = await Video.findById(videoId)
          .populate('author')
          .populate('recipe')

        if (video) {
          res.render('profile/edit-video', {
            title: 'Edit Video',
            video,
            currentUser: loggedInUser,
          })
        }
      } catch (error) {
        res.status.json(error)
      }
    }
  }
)

router.post(
  '/profile/:profileId/edit/:videoId',
  secured,
  upload.single('thumbnail'),
  async (req, res, next) => {
    const { profileId, videoId } = req.params
    const {
      title,
      description,
      category,
      tags,
      cookTime,
      portions,
      mealType,
      ingredients,
      steps,
    } = req.body
    const newVideoInfo = {}
    const newRecipeInfo = {}

    try {
      if (title) {
        newVideoInfo.title = title
      }
      if (description) {
        newVideoInfo.description = description
      }
      if (category) {
        newVideoInfo.category = category
      }
      if (tags) {
        newVideoInfo.tags = JSON.parse(tags)
      }
      // Check if thumbnail image is provided
      if (req.file !== undefined) {
        const thumbnail = req.file
        const uploadedThumbnail = await uploadImg(thumbnail.path)
        newVideoInfo.thumbnail = uploadedThumbnail
        fs.unlinkSync(thumbnail.path.toString())
      }

      if (cookTime) {
        newRecipeInfo.cookTime = cookTimeConvert(cookTime)
      }
      if (portions) {
        newRecipeInfo.portions = portions
      }
      if (mealType) {
        newRecipeInfo.mealType = mealType
      }
      if (steps) {
        newRecipeInfo.steps = JSON.parse(steps)
      }
      let nutritionInfo
      if (ingredients) {
        
        nutritionInfo = await Promise.all(
          JSON.parse(ingredients).map(async (ingredient) => {
            const response = await getFoodDetails(ingredient)
            return response
          })
        )
        newRecipeInfo.ingredients = nutritionInfo
       console.log(newRecipeInfo.ingredients)
      
      }

      //MISSING CALORIE UPDATES FOR THE NEW ING
 

      let updatedVideo = await Video.findByIdAndUpdate(videoId, newVideoInfo, {
        new: true,
      })
      let updatedRecipe = await Recipe.findByIdAndUpdate(
        updatedVideo.recipe,
        newRecipeInfo,
        {
          new: true,
        }
      )
      res.status(200).json({ updatedRecipe, updatedVideo })
    } catch (error) {
      res.status(500).json(error)
    }
  }
)
router.post('/profile/:profileId/delete/', secured, async (req, res, next) => {
  const { profileId } = req.params
  const { videoId } = req.body

  try {
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
      throw new Error('Video not found')
    }

    res.status(200).json({ videoId })
  } catch (error) {
    next(error)
  }
})

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
        recipeToDB.cookTime = cookTimeConvert(cookTime)
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

      const recipeId = await Recipe.create(recipeToDB)

      const now = new Date()

      const day = now.getDate()
      const month = now.getMonth() + 1
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

router.post('/channel/:channelName/subscribe', async (req, res, next) => {
  const { channelName } = req.params
  const { updateCriteria } = req.body
  const currentUser = await User.findOne({ authId: req.user.id })

  let channelFromDB = await User.findOne({ channelName: channelName })
  let updatedVideo
  if (updateCriteria === 'sub') {
    updatedVideo = await User.findByIdAndUpdate(channelFromDB._id, {
      $addToSet: { subscribers: currentUser._id },
    })
    res.status(200).json(updatedVideo)
  } else if (updateCriteria === 'unsub') {
    updatedVideo = await User.findByIdAndUpdate(channelFromDB._id, {
      $pull: { subscribers: currentUser._id },
    })
    res.status(200).json(updatedVideo)
  }
})

module.exports = router
