const Review = require('../models/Review.model.js')

const timePassedSince = (initialTime) => {
  const currentTime = new Date().getTime()
  let milisecondsSince = currentTime - initialTime

  const seconds = Math.floor(milisecondsSince / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const timePassed = {
    seconds,
    minutes,
    hours,
    days,
  }

  return timePassed
}

const toHoursAndMinutes = (totalSeconds) => {
  const totalMinutes = Math.floor(totalSeconds / 60)

  const seconds = totalSeconds % 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`
}

const getRating = async (videoId) => {
  const reviews = await Review.find({ video: videoId })

  if (reviews.length !== 0) {
    let sum = reviews.reduce((acc, currentValue) => {
      return acc + parseInt(currentValue.rating)
    }, 0)
    let average = (sum / reviews.length).toFixed(2)
    return average
  }
}

module.exports = {
  timePassedSince,
  toHoursAndMinutes,
  getRating,
}
