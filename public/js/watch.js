const minViewTime = 5
const video = document.querySelector('video[videoId]') 
let videoId = video.getAttribute('videoId')

const likeButton = document.querySelector('button[like-btn]')
const dislikeButton = document.querySelector('button[dislike-btn]')

const likeCount = document.querySelector('span[like-count]')
const dislikeCount = document.querySelector('span[dislike-count]')

const cookTimeElement = document.querySelector('span[cookTime]')


const updateViews = (videoId) => {
  axios
    .post(
      `/video/${videoId}/update`,
      { toUpdate: 'views' },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      console.log(response.data)
    })
    .catch(function (error) {
      console.log('ERROR', error)
    })

  return true
}

const updateLikesAndDislikes = (videoId, updateCriteria ) => {
    axios.post(`/video/${videoId}/update`, updateCriteria, {
        headers: {
            'Content-Type': 'application/json'
        }          
    }).then(response => {
        console.log(response.data)
    }).catch(err => console.log(err))
}
