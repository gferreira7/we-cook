const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reviews: [
      {
        id: { type: Schema.Types.ObjectId, ref: 'Review' },
        type: String,
      },
    ],
    description: {
      type: String,
      required: false,
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    recipe: [String],
    url: {
      type: String,
      // required: true,
      trim: true,
    },
    thumbnail: {
      //image url to store in cloudinary
      type: String,
      // required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cloudId: { type: String },
    durationInSeconds: { type: Number },
    durationInHMS: {type: String },
    format: { type: String },
    file: {
      type: String,
    },
    category:{
      type: String,
      // enum: ['Healthy', 'Cheat Day!']
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Video = model('Video', videoSchema)

module.exports = Video
