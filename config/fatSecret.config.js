const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
require('dotenv').config()
 
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
        return null;
      }
      
      const regex = /Calories: (\d+)kcal \| Fat: ([\d\.]+)g \| Carbs: ([\d\.]+)g \| Protein: ([\d\.]+)g/;
      const match = food.food_description.match(regex);
      
      if (!match) {
        return null;
      }
      
      const calories = parseFloat(match[1]) * ingredientObj.quantity / 100;
      const fat = parseFloat(match[2]) * ingredientObj.quantity / 100;
      const carbs = parseFloat(match[3]) * ingredientObj.quantity / 100;
      const protein = parseFloat(match[4]) * ingredientObj.quantity / 100;
      
      let objFood = {
        ingredient: ingredientObj.ingredient,
        unit: ingredientObj.unit,
        quantity: ingredientObj.quantity,
        calories: calories,
        fat: fat,
        carbs: carbs,
        protein: protein
      };
      
      console.log(objFood);
      return objFood
    } catch (error) {
      console.log(error)
    }
  }

  module.exports = {getFoodDetails}