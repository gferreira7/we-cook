const submitSubscribe = async (channelName, updateCriteria) => {
  try {
    let response = await axios.post(
      `/channel/${channelName}/subscribe`,
      updateCriteria,
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
