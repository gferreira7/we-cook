const { Router } = require('express')
const router = new Router()
require('dotenv').config()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const secured = require('../middleware/route-guard')
const stream = require('stream')
const fs = require('fs')
const { promisify } = require('util')

const { uploadVideo, getVideo, uploadImg  } = require('../config/cloudinary.config')

// import models here
const Video = require('../models/Video.model')
const mongoose = require('mongoose') // <== has to be added
const User = require('../models/User.model')

router.get('/profile', secured, async (req, res, next) => {
  const { _raw, _json, ...currentUserProfile } = req.user

  let userIdFromDB = await User.findOne({ authId: req.user.id }).exec()

  Video.find({ author: userIdFromDB })
    .then((videos) => {
      // console.log('Retrieved video from DB:', video);
      res.render('profile/currentUser-profile', {
        title: 'Profile',
        currentUserProfile,
        videos,
      })
    })
    .catch((error) => {
      console.log('Error while getting the videos from the DB: ', error)

      // Call the error-middleware to display the error page to the user
      next(error)
    })

})



router.post('/upload', upload.fields([ {name :'video', maxCount:1 }, {name : 'image',maxCount:1 } ]), async (req, res) => {
  
  try {
    // Get the uploaded video file
    const video = req.files.video[0]
    const image = req.files.image[0]


    const title = req.body.title
    const description = req.body.description

    const buffer = fs.readFileSync(video.path.toString())
    const uploadedVideo = await uploadVideo(buffer)
    fs.unlinkSync(video.path.toString())
  
 
    const uploadedImage = await uploadImg(image.path);
    fs.unlinkSync(image.path.toString())

    let userIdFromDB = await User.findOne({authId: req.user.id}).exec()

    // console.log(req.user.id, userIdFromDB)
    const videoToDB = {
      //assigned by Cloudinary - needed to fetch it later and update
      cloudId: uploadedVideo.public_id,
      url: uploadedVideo.secure_url,
      thumbnail: uploadedImage,
      title,
      description,
      format: uploadedVideo.format,
      // tags,
      duration: uploadedVideo.duration,
      author: userIdFromDB._id,
    }

    await Video.create(videoToDB)

    res.redirect("/profile")
   
    
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to upload video' })
  }
})

module.exports = router
