// We reuse this import in order to have access to the `body` property in requests
const express = require('express')

// ℹ️ Responsible for the messages you see in the terminal as requests are coming in
// https://www.npmjs.com/package/morgan
const logger = require('morgan')

// ℹ️ Needed when we deal with cookies (we will when dealing with authentication)
// https://www.npmjs.com/package/cookie-parser
const cookieParser = require('cookie-parser')

// ℹ️ Serves a custom favicon on each request
// https://www.npmjs.com/package/serve-favicon
const favicon = require('serve-favicon')

// ℹ️ global package used to `normalize` paths amongst different operating systems
// https://www.npmjs.com/package/path
const path = require('path')

// ℹ️ Session middleware for authentication
// https://www.npmjs.com/package/express-session
const session = require('express-session')

// ℹ️ MongoStore in order to save the user session in the database
// https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')

// Connects the mongo uri to maintain the same naming structure
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/we-cook'

//passport and auth0
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile)
  }
)

// Middleware configuration
module.exports = (app) => {
  // In development environment the app logs
  app.use(logger('dev'))

  // To have access to `body` property in the request
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Normalizes the path to the views folder
  app.set('views', path.join(__dirname, '..', 'views'))
  // Sets the view engine to handlebars
  app.set('view engine', 'hbs')
  // AHandles access to the public folder
  app.use(express.static(path.join(__dirname, '..', 'public')))

  // Handles access to the favicon
  app.use(
    favicon(path.join(__dirname, '..', 'public', 'images', 'favicon.ico'))
  )

  // ℹ️ Middleware that adds a "req.session" information and later to check that you are who you say you are 😅
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'super hyper secret key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: MONGO_URI,
      }),
    })
  )

  passport.use(strategy)
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}
