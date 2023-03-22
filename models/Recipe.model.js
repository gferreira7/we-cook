const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the User model to whatever makes sense in this case

const ingredientSchema = new Schema({
  ingredient: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
  },
  carbs: {
    type: Number,
  },
  protein: {
    type: Number,
  },
  fat: {
    type: Number,
  },
})

const recipeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    cookTime: { minutes: Number, stringFormat: String },
    mealType: String,
    portions: Number,
    steps: [String],
    ingredients: {
      type: [ingredientSchema],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Recipe = model('Recipe', recipeSchema)

module.exports = Recipe
