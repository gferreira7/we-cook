const Review = require('../models/Review.model.js')
const possibleTimes = ['15m','30m', '45m', '1h', '1h15m','1h30m','1h45m', 'over 2h',]

const cookTimeConvert = (index) =>{
  let convertedTime = {
    stringFormat : '',
    minutes: 0
  }
  convertedTime.stringFormat = possibleTimes[index]
  convertedTime.minutes = (parseInt(index) + 1) * 15
  return convertedTime
}
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
  cookTimeConvert
}
