const express = require('express')
const router = express.Router()
const Video = require('../models/Video.model.js')
const mongoose = require('mongoose') // <== has to be added
const User = require('../models/User.model.js')
const secured = require('../middleware/route-guard')

router.get('/', (req, res, next) => {
  res.redirect('/home')
})

/* GET home page */
router.get('/home', async (req, res, next) => {
  let currentUser = { name: { givenName: '' } }

  if (req.user === undefined) {
    currentUser.firstName = 'Guest'
    currentUser.profilePic = '/images/icons/account.png'
  } else {
    let userProfile = await User.findOne({ authId: req.user.id }).exec()
    currentUser = userProfile
  }

  Video.find()
    .populate('author')
    .then((videos) => {
      console.log(currentUser)
      res.render('home', {
        title: 'Home',
        userProfile: currentUser,
        videos: videos,
      })
    })
    .catch((error) => {
      console.log('Error while getting the videos from the DB: ', error)

      // Call the error-middleware to display the error page to the user
      next(error)
    })
})

router.get('/trending', secured, async (req, res, next) => {
  let userProfile = await User.findOne({ authId: req.user.id })
  const trendingVideos = await Video.find({
    averageRating: { $gte: 4 },
    views: { $gte: 10 },
  }).sort({
    averageRating: 'desc',
    views: 'desc',
  })
  console.log(trendingVideos)
  res.render('trending', {
    title: 'Trending',
    videos: trendingVideos,
    userProfile,
  })
})

router.get('/groups', async (req, res, next) => {
  res.render('test', {
    title: 'groups',
  })
})

router.get('/subscriptions', async (req, res, next) => {
  res.render('test', {
    title: 'subscriptions',
  })
})
router.get('/nutrition', secured, async (req, res, next) => {
  res.render('nutrition/chatpage', {
    title: 'nutrition',
  })
})

router.get('/messages', async (req, res, next) => {
  res.render('test', {
    title: 'messages',
  })
})

module.exports = router
