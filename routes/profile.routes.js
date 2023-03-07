
const { Router } = require("express");
const router = new Router();

const secured = require('../middleware/route-guard')

// import models here

const Video = require("../models/Video.model")

const mongoose = require("mongoose"); // <== has to be added

router.get("/profilePage", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("profile/user-profile", {
    title: "Profile",
    userProfile: userProfile,
    layout: 'loggedIn-layout.hbs'
  });
});

router.post("/profilePage", secured, (req, res, next) => {
  
  const {title, description, videoURL} = req.body
   
  Video.create({
    title,
    description,
    videoURL
  }).then(video => res.redirect('/profilePage')
  ).catch(err => next(err))
});

module.exports = router

