// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs

const path = require('path')
const hbs = require("hbs");
const partialsDir = path.join(__dirname, 'views', 'partials');

hbs.registerPartials(partialsDir);
hbs.registerPartials(path.join(partialsDir, 'currentUserPage'));

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);


app.set('view options', { layout: 'layouts/main-layout' });


const capitalize = require("./utils/capitalize");
const projectName = "We Cook";

app.locals.appTitle = `${capitalize(projectName)}`;


// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

const currentUserProfileRoutes = require("./routes/currentUserProfile.routes");
app.use("/", currentUserProfileRoutes);

const videoRoutes = require("./routes/video.routes");
app.use("/", videoRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
