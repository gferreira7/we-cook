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

  let currentUser
  let videos = await Video.find().populate('author')
  
  try {
    currentUser = await User.findOne({ authId: req.user.id })

    res.render('home', {
      title: 'Home',
      currentUser,
      videos,
    })
  } catch (error) {
    res.render('home', {
      title: 'Home',
      videos,
    })
    
  }
})

router.get('/trending', secured, async (req, res, next) => {
  let currentUser = await User.findOne({ authId: req.user.id })
  const trendingVideos = await Video.find({
    averageRating: { $gte: 4 },
    views: { $gte: 10 },
  })
    .populate('author')
    .sort({
      averageRating: 'desc',
      views: 'desc',
    })
  res.render('trending', {
    title: 'Trending',
    videos: trendingVideos,
    currentUser,
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
