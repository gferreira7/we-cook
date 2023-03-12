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
    .then((video) => {
      const timeSinceUpload = timePassedSince(video.createdAt.getTime())

      const isUploader = (req.user.id === video.author.authId)


      res.render('videos/single-video', {
        title: video.title,
        userProfile,
        video,
        timeSinceUpload,
        isUploader
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



router.post('/video/:videoId/delete', secured, (req, res, next) => {
  const { videoId } = req.params
})

module.exports = router
