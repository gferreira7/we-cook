const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const reviewSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: String,
    rating: Number,
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Review = model('Review', reviewSchema)

module.exports = Review
