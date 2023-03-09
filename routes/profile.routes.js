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

router.get('/profilePage', secured, async (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user

  let userIdFromDB = await User.findOne({ authId: req.user.id }).exec()

  Video.find({ author: userIdFromDB })
    .then((videos) => {
      // console.log('Retrieved video from DB:', video);
      res.render('profile/user-profile', {
        title: 'Profile',
        userProfile,
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


    // Get the other form fields
    const title = req.body.title
    const description = req.body.description
    // const tags = req.body.tags.split(",");
    // Read the uploaded file from disk using fs

    console.log("video:",video)
    const buffer = fs.readFileSync(video.path.toString())
    const uploadedVideo = await uploadVideo(buffer)
    fs.unlinkSync(video.path.toString())
  
    console.log("VIDEO COMPLETED")
  
    // Upload the file to Cloudinary using the uploadVideo function
    console.log("IMAGE:",image)
   // const bufferImg = fs.readFileSync(image.path.toString())
   //  const uploadedImage = await uploadImg(bufferImg)
    
     console.log("image COMPLETED")
     const uploadedImage = await uploadImg(image.path);
     fs.unlinkSync(image.path.toString())




    let userIdFromDB = await User.findOne({authId: req.user.id}).exec()
    console.log(userIdFromDB)

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

    res.redirect("/profilePage")
      // Use the uploaded file's name as the asset's public ID and 
      // allow overwriting the asset with new versions

    // Return the URL of the uploaded video and the other form fields
    // res.status(200).json({ videoUrl, title, description });
    
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to upload video' })
  }
})

module.exports = router
