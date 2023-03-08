const { Router } = require('express')
const router = new Router()

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')

// import models here later

const mongoose = require('mongoose') // <== has to be added

router.get('/home', (req, res, next) => {
  let currentUserInfo = { name: { givenName: '' } }
  if (req.user === undefined) {
    currentUserInfo.name.givenName = 'Guest'
  } else {
    const { _raw, _json, ...userProfile } = req.user
    currentUserInfo = userProfile
  }

  Video.find()
    .then((video) => {
      // console.log('Retrieved video from DB:', video);
      res.render('videos/videos-list', {
        title: 'Home',
        userProfile: currentUserInfo,
        video: video,
      })
    })
    .catch((error) => {
      console.log('Error while getting the videos from the DB: ', error)

      // Call the error-middleware to display the error page to the user
      next(error)
    })
})

// router.get("/layout", secured, (req, res, next) => {
//   res.render("videos/wecook", {
//     layout: 'wecook-layout',

//   });
// })

router.get('/watch/:id', (req, res, next) => {
  let Id = req.params.id

  let currentUserInfo = { name: { givenName: '' } }
  if (req.user === undefined) {
    currentUserInfo.name.givenName = 'Guest'
  } else {
    const { _raw, _json, ...userProfile } = req.user
    currentUserInfo = userProfile
  }

  Video.findById(Id)
    .then((videoInfo) => {
      console.log(videoInfo)
      res.render('videos/video-info', {
        title: videoInfo.title,
        userProfile: currentUserInfo,
        video: videoInfo,
      })
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

router.post('/search', secured, (req, res, next) => {
  let { search } = req.body
  console.log(search)
  const { _raw, _json, ...userProfile } = req.user

  Video.find({ title: { $regex: search, $options: 'i' } })
    .then((videos) => {
      console.log(videos)
      res.render('videos/video-search', {
        title: search,
        userProfile: userProfile,
        videos: videos,
      })
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

module.exports = router
