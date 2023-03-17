const axios = require('axios')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')

const getFoodDetails = async (ingredientObj) => {
    const clientID = 'df668fcaf2094bcc850c96e2f589d6b4'
    const clientSecret = 'aeec0d38440349799e18992a431b556a'
  
    const tokenOptions = {
      method: 'POST',
      url: 'https://oauth.fatsecret.com/connect/token',
      auth: {
        username: clientID,
        password: clientSecret,
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
  
      const endpointUrl = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${ingredientObj}&max_results=1&format=json`
  
      const consumerKey = clientID
      const consumerSecret = clientSecret
  
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
      return food
    } catch (error) {
      console.log(error)
    }
  }

  module.exports = {getFoodDetails}