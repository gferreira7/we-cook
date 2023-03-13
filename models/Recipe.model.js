const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case

const ingredientSchema = new Schema({
  ingredient: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
})

const recipeSchema = new Schema(
  {
    video: {
      id: { type: Schema.Types.ObjectId, ref: 'Video' },
    },
    // should convert to steps
    steps: String,
    ingredients: {
      type: [ingredientSchema],
    },
    author: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Recipe = model('Recipe', recipeSchema)

module.exports = Recipe
