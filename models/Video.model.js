const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case



const dateSchema = new Schema({
  day: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  hour: {
    type: String,
    required: true,
  }
})

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    reviews: [
      {
        id: { type: Schema.Types.ObjectId, ref: 'Review' },
      },
    ],
    averageRating: Number,
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
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
    },
    uploadedDate:{
     type: dateSchema
     }
    },
  {
    timestamps: true,
  }
)

const Video = model('Video', videoSchema)

module.exports = Video
