const { Router } = require('express')
const router = new Router()

const mongoose = require('mongoose')

const secured = require('../middleware/route-guard')
const Video = require('../models/Video.model.js')
const User = require('../models/User.model.js')

const { timePassedSince, toHoursAndMinutes } = require('../controllers/helpers')

router.get('/watch/:videoId', secured, async (req, res, next) => {
  let { videoId } = req.params

  let userProfile = await User.findOne({ authId: req.user.id }).exec()

  Video.findById(videoId)
    .populate('author')
    .then((video) => {
      const timeSinceUpload = timePassedSince(video.createdAt.getTime())

      const isUploader = req.user.id === video.author.authId

      res.render('single-video', {
        title: video.title,
        userProfile,
        video,
        timeSinceUpload,
        isUploader,
      })
    })
    .catch((err) => {
      console.log(err)
      next(err)
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
  const { toUpdate } = req.body

  const currentUser = await User.findOne({ authId: req.user.id })

  const videoFromDB = await Video.findById(videoId)

  const { likes, dislikes } = videoFromDB

  if (toUpdate === 'views') {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    )
    console.log(updatedVideo)
    res.status(200).json(`views: ${updatedVideo.views}`)
  }

  if (toUpdate === 'like') {
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
      console.log('Likes', updatedVideo.likes)
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { likes: currentUser._id } },
        { new: true }
      )
      console.log('Likes', updatedVideo.dislikes)
    }
    res.status(200).json(updatedVideo)
  }

  if (toUpdate === 'dislike') {
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
      console.log('Dislikes', updatedVideo.dislikes)
    } else {
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $addToSet: { dislikes: currentUser._id } },
        { new: true }
      )
      console.log('Dislikes', updatedVideo.dislikes)
    }
    res.status(200).json(updatedVideo)
  }
})

module.exports = router
