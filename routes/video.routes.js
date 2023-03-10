const { Router } = require('express')
const router = new Router()

const mongoose = require('mongoose')

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')
const User = require('../models/User.model.js')

const { timePassedSince, toHoursAndMinutes } = require('../controllers/helpers')
router.get('/watch/:id', secured, async (req, res, next) => {
  let Id = req.params.id

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  Video.findById(Id)
    .populate('author')
    .then((video) => {
      const timeSinceUpload = timePassedSince(video.createdAt.getTime())

      console.log('time passed since upload: ', timeSinceUpload)
      res.render('videos/single-video', {
        title: video.title,
        userProfile,
        video,
        timeSinceUpload,
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
      res.render('videos/video-search', {
        title: search,
        userProfile: currentUserProfile,
        videos: videos,
        // show results page with count
        count: videos.length 
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
