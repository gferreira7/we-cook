const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
require('dotenv').config()

function convertQuantityToGrams(quantity, unit) {
  switch (unit) {
    case 'g':
      return quantity
    case 'kg':
      return quantity * 1000
    case 'oz':
      return quantity * 28.35
    case 'lb':
      return quantity * 453.592
    default:
      return quantity
  }
}

const getFoodDetails = async (ingredientObj) => {
  const tokenOptions = {
    method: 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    auth: {
      username: process.env.FAT_SECRET_CLIENT_ID,
      password: process.env.FAT_SECRET_SECRET,
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials&scope=basic',
  }

  try {
    const {
      data: { access_token: token },
    } = await axios(tokenOptions)

    const endpointUrl = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${ingredientObj.ingredient}&max_results=1&format=json`

    const consumerKey = process.env.FAT_SECRET_CLIENT_ID
    const consumerSecret = process.env.FAT_SECRET_SECRET

    const oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64')
      },
    })

    const requestData = {
      url: endpointUrl,
      method: 'POST',
    }

    const headers = oauth.toHeader(
      oauth.authorize(requestData, {
        key: consumerKey,
        secret: consumerSecret,
      })
    )

    headers.Authorization = `Bearer ${token}`

    const requestConfig = {
      method: 'post',
      headers: headers,
      url: endpointUrl,
    }

    const {
      data: {
        foods: { food },
      },
    } = await axios(requestConfig)

    if (!food || !food.food_description) {
      return null
    }

    const regex =
      /Calories: (\d+)kcal \| Fat: ([\d\.]+)g \| Carbs: ([\d\.]+)g \| Protein: ([\d\.]+)g/
    const match = food.food_description.match(regex)

    if (!match) {
      return null
    }

    const caloriesPer100g = parseFloat(match[1])
    const fatPer100g = parseFloat(match[2])
    const carbsPer100g = parseFloat(match[3])
    const proteinPer100g = parseFloat(match[4])

    const quantityInGrams = convertQuantityToGrams(
      ingredientObj.quantity,
      ingredientObj.unit
    )
    const calories = (caloriesPer100g / 100) * quantityInGrams
    const fat = (fatPer100g / 100) * quantityInGrams
    const carbs = (carbsPer100g / 100) * quantityInGrams
    const protein = (proteinPer100g / 100) * quantityInGrams

    let objFood = {
      ingredient: ingredientObj.ingredient,
      unit: ingredientObj.unit,
      quantity: ingredientObj.quantity,
      calories: parseInt(calories),
      fat: parseInt(fat),
      carbs: parseInt(carbs),
      protein: parseInt(protein),
    }

    return objFood
  } catch (error) {
    console.log(error)
  }
}

module.exports = { getFoodDetails }
