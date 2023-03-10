const { Router } = require('express')
const router = new Router()

const mongoose = require('mongoose')

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
  console.log(currentUserInfo)
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
    const { _raw, _json, ...currentUserProfile } = req.user
    currentUserInfo = currentUserProfile
  }

  Video.findById(Id)
  .populate('author')
    .then((videoInfo) => {
      res.render('videos/single-video', {
        title: videoInfo.title,
        currentUserProfile: currentUserInfo,
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
  const { _raw, _json, ...currentUserProfile } = req.user

  Video.find({ title: { $regex: search, $options: 'i' } })
  .populate('author')
    .then((videos) => {
      console.log(videos)
      res.render('videos/video-search', {
        title: search,
        currentUserProfile: currentUserProfile,
        videos: videos,
      })
    })
    .catch((err) => {
      console.log(err)
      next(err)
    })
})

router.post('/video/:videoId/update', (req, res, next) => {
  const { videoId } = req.params

  const { views } = req.body

  if (views) {
    Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).then((updatedVideo) => {
      res.status(200).json(`views: ${updatedVideo.views}`)
    })
  }
})

router.get('/video/:videoId/edit', secured, async (req, res, next) => {
  
  const { videoId } = req.params

  Video.findById(videoId)
    .populate('author')
    .then((video) => {
      res.render('videos/edit-video-page', { video })
    })
    .catch((err) => res.status(500).json(err))
})

router.post('/video/:videoId/delete', secured, (req, res, next) => {
  
  const { videoId } = req.params
  
})

module.exports = router
