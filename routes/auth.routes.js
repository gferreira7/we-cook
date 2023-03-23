const express = require('express')
const router = express.Router()

const passport = require('passport')
const querystring = require('querystring')
require('dotenv').config()

// ℹ️ Handles password encryption
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10

// Require the User model in order to interact with the database
const User = require('../models/User.model')

// Require necessary middleware in order to control access to specific routes
const secured = require('../middleware/route-guard')

router.get(
  '/login',
  passport.authenticate('auth0', {
    scope: 'openid email profile',
    prompt: 'login'
  }),
  (req, res) => {
    res.redirect('/')
  }
)

router.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', async (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, async (err) => {

      console.log(user)
      if (err) {
        return next(err)
      }
      
      const returnTo = req.session.returnTo
      delete req.session.returnTo

      let dbUser = await User.findOne({ authId: user.id })

      if (!dbUser) {
        // If the user doesn't exist, create a new user document
        dbUser =  await User.create({
          authId: user.id,
          username: user.displayName,
          firstName: user.name.givenName,
          channelName: user.nickname,
          email: user.emails[0].value,
        })
      } else {
        // If the user already exists, update the user document
        dbUser.username = user.displayName
        dbUser.email = user.emails[0].value
        channelName = user.nickname,

        await dbUser.save()
      }

      res.redirect(returnTo || '/home')
    })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logOut( (err) =>{
    if (err) {
      return next(err)
    }
    
    req.session.destroy()
    let returnTo = req.protocol + '://' + req.hostname
    const port = req.connection.localPort

    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo =
        process.env.NODE_ENV === 'production'
          ? `${returnTo}/`
          : `${returnTo}:${port}/`
    }

    const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`)

    const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo,
    })
    logoutURL.search = searchString

    res.redirect(logoutURL)                                             
    // res.redirect('https://wecook.cyclic.app')
  })
})  

module.exports = router
