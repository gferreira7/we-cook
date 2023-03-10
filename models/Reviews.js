const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const reviewSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: 
      {
        id: { type: Schema.Types.ObjectId, ref: "User" },
        type: String,
      },
    description: {
      type: String,
      required: false,
    },
    video: 
    {
      id: { type: Schema.Types.ObjectId, ref: "Video" },
      type: String,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Review = model('review', reviewSchema)

module.exports = Review
