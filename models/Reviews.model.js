const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const reviewSchema = new Schema(
  {
    author: 
    {
      id: { type: Schema.Types.ObjectId, ref: "User" },
    },
    description: String,
    rating: Number,
    video: 
    {
      id: { type: Schema.Types.ObjectId, ref: "Video" },
    },
  },
  {
    timestamps: true,
  }
)

const Review = model('Review', reviewSchema)

module.exports = Review
  