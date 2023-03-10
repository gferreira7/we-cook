
const timePassedSince = (initialTime) => {
    const currentTime = new Date().getTime()
    let milisecondsSince = currentTime - initialTime

  
const seconds = Math.floor(milisecondsSince / 1000);
const minutes = Math.floor(seconds / 60);
const hours = Math.floor(minutes / 60);
const days = Math.floor(hours / 24);

const timePassed = {
        seconds, minutes, hours, days
}

return timePassed
} 


module.exports = {
    timePassedSince
}