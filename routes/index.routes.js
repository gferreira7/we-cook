const express = require('express')
const router = express.Router()
const Video = require('../models/Video.model.js')
const mongoose = require('mongoose') // <== has to be added
const User = require('../models/User.model.js')
const Chat = require('../models/Chat.model.js')

const secured = require('../middleware/route-guard')

router.get('/', (req, res, next) => {
  res.redirect('/home')
})

/* GET home page */
router.get('/home', async (req, res, next) => {

  let currentUser
  let videos = await Video.find().populate('author')
  
  try {
    currentUser = await User.findOne({ authId: req.user.id })

    res.render('home', {
      title: 'Home',
      currentUser,
      videos,
    })
  } catch (error) {
    res.render('home', {
      title: 'Home',
      videos,
    })
    
  }
})

router.get('/trending', secured, async (req, res, next) => {
  let currentUser = await User.findOne({ authId: req.user.id })
  const trendingVideos = await Video.find({
    averageRating: { $gte: 4 },
    views: { $gte: 10 },
  })
    .populate('author')
    .sort({
      averageRating: 'desc',
      views: 'desc',
    })
  res.render('trending', {
    title: 'Trending',
    videos: trendingVideos,
    currentUser,
  })
})  

router.get('/groups', async (req, res, next) => {
  res.render('test', {
    title: 'groups',
  })
})

router.get('/subscriptions', async (req, res, next) => {
  res.render('test', {
    title: 'subscriptions',
  })
})
router.get('/nutrition', secured, async (req, res, next) => {
  res.render('nutrition/chatpage', {
    title: 'nutrition',
  })
})

router.get('/messages', secured, async (req, res, next) => {
  let currentUser = await User.findOne({ authId: req.user.id }).populate('chat').exec()
  let chats = [];
  
  for (let i = 0; i < currentUser.chat.length; i++) {
  chats.push(await Chat.findById(currentUser.chat[i]._id).populate('sender').populate('recipient').exec());
  }
  
  const newArr = chats.filter((item, index) => {
  const currentId = item.recipient._id.toString();
  if(currentUser._id != currentId)
  {
  return chats.findIndex((chat) => chat.recipient._id.toString() === currentId) === index;
  }
  });
  
  chats = newArr;
  
  res.render('chat/loadchats', {
  title: 'messages',
  currentUser,
  chats
  })
  })
router.get('/messages/:id', secured ,async (req, res, next) => {

  const { id } = req.params
  let currentUser = await User.findOne({ authId: req.user.id }).populate('chat').exec()
  let objID = new mongoose.Types.ObjectId(id)
  let otherUser = await User.findById(objID).exec()
  console.log(objID)
  let chatDM = await Chat.find({
    $or: [{ sender: objID }, { recipient: objID }],
    $and: [{ $or: [{ sender: currentUser._id }, { recipient: currentUser._id }] }]
  })
  .populate('sender')
  .lean()
  .exec();
  console.log(currentUser._id)
  chatDM = chatDM.map(function(item) {

    if (new mongoose.Types.ObjectId(item.sender._id).equals(currentUser._id)) {
      return {
        ...item,
        right: true
      };
    } else {
      return {
        ...item,
        right: false
      };
    }
  });

  console.log(chatDM)

  res.render('chat/dmchat', {
    title: 'messages',
    currentUser,
    chatDM,
    otherUser

  })
  
})

router.post('/messages/:recipient', secured, async (req, res, next) => {
  const {text_sms} = req.body
  const {recipient} = req.params

  let currentUser = await User.findOne({ authId: req.user.id }).exec()

  console.log(text_sms)
  console.log(recipient)

  let obj = {
    sender: currentUser._id,
    recipient:recipient,
    message: text_sms
    }

  try{
    let SendSMS = await Chat.create(obj)
    let addSMSsender = await User.findByIdAndUpdate(currentUser._id, {
      $addToSet: { chat: SendSMS._id },
    })
    let addSMSrecipient = await User.findByIdAndUpdate(recipient, {
      $addToSet: { chat: SendSMS._id },
    })

    res.redirect(`/messages/${recipient}`)
  }catch(error)
  {
    console.log(error)
  }
})


router.post('/messages', secured, async (req, res, next) => {
  const {text_sms , recipient} = req.body
  let currentUser = await User.findOne({ authId: req.user.id }).exec()

  console.log(text_sms)
  console.log(recipient)

  let obj = {
    sender: currentUser._id,
    recipient:recipient,
    message: text_sms
    }

  try{
    let SendSMS = await Chat.create(obj)
    let addSMSsender = await User.findByIdAndUpdate(currentUser._id, {
      $addToSet: { chat: SendSMS._id },
    })
    let addSMSrecipient = await User.findByIdAndUpdate(recipient, {
      $addToSet: { chat: SendSMS._id },
    })

    res.redirect(`/messages`)
  }catch(error)
  {
    console.log(error)
  }
})
router.post('/user/find', secured, async (req, res, next) => {
  const {search_dm} = req.body
  let currentUser = await User.findOne({ authId: req.user.id }).exec()

  let chatWith = await User.findOne({ username: { $regex: `${search_dm}`, $options: 'i'} });
  console.log(chatWith)
  if(chatWith === null)
  {
    res.redirect(`/messages`)

  }
  else {
    res.redirect(`/messages/${chatWith._id}`)

  }


})


module.exports = router
