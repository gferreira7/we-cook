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
    recipe: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    url: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
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
    }
  },
  {
    timestamps: true,
  }
)

const Video = model('Video', videoSchema)

module.exports = Video
