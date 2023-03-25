const updateSubscribe = async (channelName) => {
  try {
    let response = await axios.post(
      `/channel/${channelName}/subscribe`,{},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response
  } catch (error) {
    return error
  }
}
const checkSubscribe = async (channelName) => {
  try {
    let response = await axios.get(
      `/channel/${channelName}/subscribe`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response
  } catch (error) {
    return error
  }
}
