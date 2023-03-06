
const { Router } = require("express");
const router = new Router();

const secured = require('../middleware/route-guard')

// import models here later

const mongoose = require("mongoose"); // <== has to be added

router.get("/profilePage", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("profile/user-profile", {
    title: "Profile",
    userProfile: userProfile,
    layout: 'loggedIn-layout.hbs'
  });
});

module.exports = router
