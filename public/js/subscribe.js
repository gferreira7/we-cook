
const submitSubscribe = (channelName, updateCriteria) => {
    axios
      .post(`/channel/${channelName}/subscribe`, updateCriteria, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        //dislikeCount.innerHTML = response.data.dislikes.length
       // likeCount.innerHTML = response.data.likes.length
      })
      .catch((err) => res = err)
  }