
const { Router } = require("express");
const router = new Router();

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js'); 

// import models here later

const mongoose = require("mongoose"); // <== has to be added

router.get("/home", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;

  Video.find()
  .then(video => {
    // console.log('Retrieved video from DB:', video);
    res.render("videos/videos-list", {
        title: "Home",
        userProfile: userProfile,
        layout: 'loggedIn-layout.hbs',
        video :video
      });
  })
  .catch(error => {
    console.log('Error while getting the videos from the DB: ', error);

    // Call the error-middleware to display the error page to the user
    next(error);
  });
});

module.exports = router
