const { Router } = require('express')
const router = new Router()
require('dotenv').config()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const secured = require('../middleware/route-guard')
const stream = require('stream')
const fs = require('fs')
const { promisify } = require('util')

const { uploadVideo, getVideo  } = require('../config/cloudinary.config')

// import models here
const Video = require('../models/Video.model')
const mongoose = require('mongoose') // <== has to be added
const User = require('../models/User.model')

router.get('/profilePage', secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user

  res.render('profile/user-profile', {
    title: 'Profile',
    userProfile: userProfile,
  })
})

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    // Get the uploaded video file
    const file = req.file
   
    // Get the other form fields
    const title = req.body.title
    const description = req.body.description
    // const tags = req.body.tags.split(",");
    // Read the uploaded file from disk using fs
    const buffer = fs.readFileSync(file.path)
    // Upload the file to Cloudinary using the uploadVideo function
   // const image =  uploadImg()  not working 
    const uploadedVideo = await uploadVideo(buffer)
   

    // Delete the uploaded file from disk using fs
    fs.unlinkSync(file.path)
    
    let userIdFromDB = await User.findOne({authId: req.user.id}).exec()
    console.log(userIdFromDB)

    // console.log(req.user.id, userIdFromDB)
    const videoToDB = {
      //assigned by Cloudinary - needed to fetch it later and update
      cloudId: uploadedVideo.public_id,
      url: uploadedVideo.secure_url,
      //thumbnail: image.secure_url, not working 
      title,
      description,
      format: uploadedVideo.format,
      // tags,
      duration:uploadedVideo.duration,
      author: userIdFromDB._id
    }
    Video.create(videoToDB)


      // Use the uploaded file's name as the asset's public ID and 
      // allow overwriting the asset with new versions

    // Return the URL of the uploaded video and the other form fields
    // res.status(200).json({ videoUrl, title, description });
    res.redirect('/home')
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to upload video' })
  }
})

module.exports = router
