const { Router } = require('express')
const axios = require('axios');
const request = require("request");
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const router = new Router()
require('dotenv').config()
const mongoose = require('mongoose')

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')
const User = require('../models/User.model.js')
const Recipe = require('../models/Recipe.model.js')
const { timePassedSince, toHoursAndMinutes } = require('../controllers/helpers')


  const getFoodDetails = async (food) =>
{
  const clientID = 'df668fcaf2094bcc850c96e2f589d6b4';
  const clientSecret = 'aeec0d38440349799e18992a431b556a';
  let token = '';

  // Request access token
  const tokenOptions = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    auth: {
      user: clientID,
      password: clientSecret
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'client_credentials',
      scope: 'basic'
    },
    json: true
  };

  request(tokenOptions, function (error, response, body) {
  let token = '';

  // Request access token
  const tokenOptions = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    auth: {
      user: clientID,
      password: clientSecret
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'client_credentials',
      scope: 'basic'
    },
    json: true
  };

  request(tokenOptions, function (error, response, body) {
    if (error) throw new Error(error);
    token = `Bearer `+ body.access_token;
  
    // Make request to get food categories
    const endpointUrl = `https://platform.fatsecret.com/rest/server.api?POST&method=foods.search&search_expression=${food}&max_results=1&format=json`;
    const consumerKey = clientID;
    const consumerSecret = body.client_secret;
  
    const oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  
    const requestData = {
      url: endpointUrl,
      method: 'POST'
    };
  
    const headers = oauth.toHeader(oauth.authorize(requestData, {
      key: consumerKey,
      secret: consumerSecret
    }));
  
    headers.Authorization = token;
  
    const requestConfig = {
      method: 'post',
      headers: headers,
      url: endpointUrl
    };
  
    axios(requestConfig).then((responseFood) =>{
      return responseFood.data.foods.food
    })
  });

});
}

router.get('/watch/:videoId', secured, async (req, res, next) => {
  let { videoId } = req.params

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  const video = await Video.findById(videoId).populate('author')
  const timeSinceUpload = timePassedSince(video.createdAt.getTime())

      console.log(video.recipe._id)

    const data = await Recipe.findById(video.recipe._id)
      let Macros = [];
      console.log(data.ingredients)
    
        data.ingredients.forEach((element) => {
        getFoodDetails(element)
          Macros.push(food)
        }) 
      })

        console.log(Macros);
        const isUploader = req.user.id === video.author.authId      
        res.render('single-video', {
          title: video.title,
          userProfile,
          video,
          timeSinceUpload,
          isUploader,
      })
   
})

router.post('/search', secured, async (req, res, next) => {

  let { search, f_category, f_author, f_title, f_tags, f_all } = req.body

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  let searchParams = {};

  const regex = new RegExp(search, "i");


  if (f_category == "on") {
    searchParams = { category: { $regex: regex } }
  }

  else if (f_title == "on") {
    searchParams = { title: { $regex: regex } }

  }
  else if (f_tags == "on") {
    searchParams = { tags: { $regex: regex } }

  }
  else {
    searchParams = { title: { $regex: regex } }

  }

  if (f_all == "on") {
    searchParams = {
      $or: [
        { title: { $regex: regex } },
        { tags: { $in: [regex] } },
        { category: { $regex: regex } }
      ]
    };
  }
  console.log(searchParams)

  //falta ver como fazer pra o author pois está com a ref pra outra tabela 
  /* EXEMPLO CHATGPT
  const videoTitle = 'My Video Title';
  const userName = 'John Doe';
  
  Video.find({ title: videoTitle })
    .populate({
      path: 'author',
      match: { name: userName }
    })
    .exec((err, video) => {
      if (err) {
        console.log(err);
      } else if (!video) {
        console.log(`No video found with title: ${videoTitle}`);
      } else {
        console.log(video);
      }
    }); */

    if (f_author == "on") {
      let videosArray = [];
      let usersFromDB = await User.find({channelName:{ $regex: regex } })
      console.log(typeof usersFromDB);
      console.log(usersFromDB);
        
        usersFromDB.forEach((element) => {
        console.log(typeof element);
        console.log(element._id)
        Video.find( { author : element._id})
        .populate('author')
        .then((videos) => {
          console.log("INSIDE FIND");
          console.log(videos)
          videosArray.push(videos)

          res.render('video-search', {
            title: search,
            userProfile,
            videos: videos,
            // show results page with count
            count: videos.length,
          })
    
        })
        .catch((err) => {
          console.log(err)
          next(err)
        })
     
      });
  
    }
    else {
      Video.find(searchParams)
      .populate('author')
      .then((videos) => {
        res.render('video-search', {
          title: search,
          userProfile,
          videos: videos,
          // show results page with count
          count: videos.length,
        })
      })
      .catch((err) => {
        console.log(err)
        next(err)
      })
    }

 
})

router.post('/video/:videoId/update', async (req, res, next) => {
  
  const { videoId } = req.params
  const { updateCriteria } = req.body
  const currentUser = await User.findOne({ authId: req.user.id })
  const videoFromDB = await Video.findById(videoId)
  const { likes, dislikes } = videoFromDB
  
  if (updateCriteria === 'views') {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    )
    res.status(200).json(`views: ${updatedVideo.views}`)
  }

  if (updateCriteria === 'like') {
    let updatedVideo
    //check if user already disliked
    if (dislikes && dislikes.includes(currentUser._id)) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { likes: currentUser._id },
          $pull: { dislikes: currentUser._id },
        },
        { new: true }
      )
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { likes: currentUser._id } },
        { new: true }
      )
    }
    res.status(200).json(updatedVideo)
  }

  if (updateCriteria === 'dislike') {
    let updatedVideo
    //check if user liked
    if (likes !== undefined && likes.includes(currentUser._id)) {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { dislikes: currentUser._id },
          $pull: { likes: currentUser._id },
        },
        { new: true }
      )
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { dislikes: currentUser._id } },
        { new: true }
      )
    }
    res.status(200).json(updatedVideo)
  }
})


router.get('/food/:food', async (req, res, next) => {
  const { food } = req.params;
  const clientID = 'df668fcaf2094bcc850c96e2f589d6b4';
  const clientSecret = 'aeec0d38440349799e18992a431b556a';
  let token = '';

  // Request access token
  const tokenOptions = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    auth: {
      user: clientID,
      password: clientSecret
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'client_credentials',
      scope: 'basic'
    },
    json: true
  };

  request(tokenOptions, function (error, response, body) {
  let token = '';

  // Request access token
  const tokenOptions = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    auth: {
      user: clientID,
      password: clientSecret
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      grant_type: 'client_credentials',
      scope: 'basic'
    },
    json: true
  };

  request(tokenOptions, function (error, response, body) {
    if (error) throw new Error(error);
    token = `Bearer `+ body.access_token;
  
    // Make request to get food categories
    const endpointUrl = `https://platform.fatsecret.com/rest/server.api?POST&method=foods.search&search_expression=${food}&max_results=1&format=json`;
    const consumerKey = clientID;
    const consumerSecret = body.client_secret;
  
    const oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  
    const requestData = {
      url: endpointUrl,
      method: 'POST'
    };
  
    const headers = oauth.toHeader(oauth.authorize(requestData, {
      key: consumerKey,
      secret: consumerSecret
    }));
  
    headers.Authorization = token;
  
    const requestConfig = {
      method: 'post',
      headers: headers,
      url: endpointUrl
    };
  
    axios(requestConfig)
      .then(response => {
        console.log(response.data);
        res.send(response.data.foods.food);
      })
      .catch(error => {
        console.error(error);
        res.status(500).send(error);
      });
  });

});
});


module.exports = router
