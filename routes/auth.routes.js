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

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require('../middleware/isLoggedOut')
const isLoggedIn = require('../middleware/route-guard')

// GET /auth/signup
router.get('/signup', isLoggedOut, (req, res) => {
  res.render('auth/signup')
})

// POST /auth/signup
router.post('/signup', isLoggedOut, (req, res) => {
  const { username, email, password } = req.body

  // Check that username, email, and password are provided
  if (username === '' || email === '' || password === '') {
    res.status(400).render('auth/signup', {
      errorMessage:
        'All fields are mandatory. Please provide your username, email and password.',
    })

    return
  }

  if (password.length < 6) {
    res.status(400).render('auth/signup', {
      errorMessage: 'Your password needs to be at least 6 characters long.',
    })

    return
  }

  //   ! This regular expression checks password for special characters and minimum length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(400)
      .render("auth/signup", {
        errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }
  */

  // Create a new user - start by hashing the password
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      // Create a user and save it in the database
      return User.create({ username, email, password: hashedPassword })
    })
    .then((user) => {
      res.redirect('/auth/login')
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: error.message })
      } else if (error.code === 11000) {
        res.status(500).render('auth/signup', {
          errorMessage:
            'Username and email need to be unique. Provide a valid username or email.',
        })
      } else {
        next(error)
      }
    })
})

// GET /auth/login - turned off to test passpor
// router.get('/login', isLoggedOut, (req, res) => {
//   res.render('auth/login')
// })

router.get(
  '/login',
  passport.authenticate('auth0', {
    scope: 'openid email profile',
  }),
  (req, res) => {
    res.redirect('/')
  }
)

router.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      const returnTo = req.session.returnTo
      delete req.session.returnTo
      res.redirect(returnTo || '/')
    })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logOut( (err) =>{
    if (err) {
      return next(err)
    }
    
    console.log('user is in: ', req.user, req.session.currentUser)
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
  })
})
// // POST /auth/login - temp turned off to test passport JS
// router.post('/login', isLoggedOut, (req, res, next) => {
//   const { username, email, password } = req.body

//   // Check that username, email, and password are provided
//   if (username === '' || email === '' || password === '') {
//     res.status(400).render('auth/login', {
//       errorMessage:
//         'All fields are mandatory. Please provide username, email and password.',
//     })

//     return
//   }

//   // Here we use the same logic as above
//   // - either length based parameters or we check the strength of a password
//   if (password.length < 6) {
//     return res.status(400).render('auth/login', {
//       errorMessage: 'Your password needs to be at least 6 characters long.',
//     })
//   }

//   // Search the database for a user with the email submitted in the form
//   User.findOne({ email })
//     .then((user) => {
//       // If the user isn't found, send an error message that user provided wrong credentials
//       if (!user) {
//         res
//           .status(400)
//           .render('auth/login', { errorMessage: 'Wrong credentials.' })
//         return
//       }

//       // If user is found based on the username, check if the in putted password matches the one saved in the database
//       bcrypt
//         .compare(password, user.password)
//         .then((isSamePassword) => {
//           if (!isSamePassword) {
//             res
//               .status(400)
//               .render('auth/login', { errorMessage: 'Wrong credentials.' })
//             return
//           }

//           // Add the user object to the session object
//           req.session.currentUser = user.toObject()
//           // Remove the password field
//           delete req.session.currentUser.password

//           res.redirect('/')
//         })
//         .catch((err) => next(err)) // In this case, we send error handling to the error handling middleware.
//     })
//     .catch((err) => next(err))
// })

// // GET /auth/logout - temp turned off to test passport JS
// router.get('/logout', isLoggedIn, (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       res.status(500).render('auth/logout', { errorMessage: err.message })
//       return
//     }

//     res.redirect('/')
//   })
// })

module.exports = router
