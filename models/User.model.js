const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    firstName: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    channelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // id from Auth0
    authId: String,
    // image url
    profilePic: {
      type: String,
      default: "/images/icons/account.png"
    },
    bannerImage: {
      type: String,
    },
    description: String,
    subscribers: { type: Number, default: 0 },
    channelViews: { type: Number, default: 0 },
    channelLikes: { type: Number, default: 0 },
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
      discord: String,
      youtube: String,
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const User = model('User', userSchema)

module.exports = User
