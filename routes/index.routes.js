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

  let currentUser = await User.findOne({ authId: req.user.id })

  res.render('test', {
    title: 'groups',
    currentUser
  })
})

router.get('/subscriptions',secured, async (req, res, next) => {

  let currentUser = await User.findOne({ authId: req.user.id })
  
  let subscribers = await User.find({subscribers: currentUser._id})


  res.render('subscriptions', {
    title: 'subscriptions',
    currentUser,
    subscribers
  })
})

router.get('/history', secured, async (req, res, next) => {

  let currentUser = await User.findOne({ authId: req.user.id }).populate('watchHistory')

  res.render('history', {
    title: 'history',
    currentUser
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
  let chatDM = await Chat.find({
    $or: [{ sender: objID }, { recipient: objID }],
    $and: [{ $or: [{ sender: currentUser._id }, { recipient: currentUser._id }] }]
  })
  .populate('sender')
  .lean()
  .exec();
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

  chatDM.forEach(async (chat) => {
    if(currentUser._id == chat.recipient ) { 
      let view = await Chat.findByIdAndUpdate(chat._id, { viewed: true });
    }
    
  });


  res.render('chat/dmchat', {
    title: 'messages',
    currentUser,
    chatDM,
    otherUser

  })
})

router.get('/messages/:id/new', secured ,async (req, res, next) => {
  const { id } = req.params
  try { 

 
  let currentUser = await User.findOne({ authId: req.user.id }).populate('chat').exec()
  let objID = new mongoose.Types.ObjectId(id)
  let otherUser = await User.findById(objID).exec()
  let chatDM = await Chat.find({
    $or: [{ sender: objID }, { recipient: objID }],
    $and: [{ $or: [{ sender: currentUser._id }, { recipient: currentUser._id }] }]
  })
  .populate('sender')
  .lean()
  .exec();
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

  chatDM.forEach(async (chat) => {
    
    if(new mongoose.Types.ObjectId(currentUser._id).equals(chat.recipient) ) { 
      let view = await Chat.findByIdAndUpdate(chat._id, { viewed: true });
    }
    
  });

  res.json(chatDM)
}catch(error)
{
  console.log(error)
}
})



router.get('/notification', secured ,async (req, res, next) => { 
  let currentUser = await User.findOne({ authId: req.user.id }).populate('chat').exec();
  let notification = await Chat.find({ recipient: currentUser._id, viewed: false })
    .populate('sender')
    .lean()
    .exec();

    res.json(notification)
})



router.post('/messages/:recipient', secured, async (req, res, next) => {
  const {text_sms} = req.body
  const {recipient} = req.params

  let currentUser = await User.findOne({ authId: req.user.id }).exec()


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

    res.json(SendSMS)

  }catch(error)
  {
    console.log(error)
  }
})


router.post('/messages', secured, async (req, res, next) => {
  const {text_sms , recipient} = req.body
  let currentUser = await User.findOne({ authId: req.user.id }).exec()


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
  if(chatWith === null)
  {
    res.redirect(`/messages`)

  }
  else {
    res.redirect(`/messages/${chatWith._id}`)

  }

})




module.exports = router
