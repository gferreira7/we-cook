const express = require('express');
const router = express.Router();
const Video = require('../models/Video.model.js')
const mongoose = require('mongoose'); // <== has to be added
const User = require('../models/User.model.js');

router.get('/', (req, res, next) => {

  res.redirect('/home')
})

/* GET home page */
router.get('/home', async (req, res, next) => {
  let currentUser = { name: { givenName: '' } }

  if (req.user === undefined) {
    currentUser.name.givenName = 'Guest'
  } else {

    let userProfile = await User.findOne({ authId: req.user.id }).exec()    
    currentUser = userProfile
  }

  Video.find()
    .populate('author')
    .then((videos) => {

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




module.exports = router;
