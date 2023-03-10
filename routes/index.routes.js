const express = require('express');
const router = express.Router();
const Video = require('../models/Video.model.js')
const mongoose = require('mongoose'); // <== has to be added
const User = require('../models/User.model.js');

router.get('/', (req, res, next) => {

  res.redirect('/home')
})

/* GET home page */
router.get('/home', (req, res, next) => {
  let currentUserInfo = { name: { givenName: '' } }

  if (req.user === undefined) {
    currentUserInfo.name.givenName = 'Guest'
  } else {
    const { _raw, _json, ...userProfile } = req.user
    currentUserInfo = userProfile
  }

  Video.find()
    .then((videos) => {
      // console.log('Retrieved video from DB:', video);
      res.render('home', {
        title: 'Home',
        userProfile: currentUserInfo,
        videos: videos,
      })
    })
    .catch((error) => {
      console.log('Error while getting the videos from the DB: ', error)

      // Call the error-middleware to display the error page to the user
      next(error)
    })
})

router.get('/home/:authorId/fetchData', async (req, res, next) => {
  const {authorId} = req.params


  let author = await User.findById(authorId)

  if(author){
    res.status(200).json(author.channelName)
  }
})


module.exports = router;
