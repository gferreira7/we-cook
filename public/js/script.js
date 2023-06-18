// Add click event listener to each sidebar link

let pages = [
  'profile',
  'home',
  'subscriptions',
  'groups',
  'history',
  'trending',
  'nutrition',
]

pages.forEach((page) => {
  let pageFound = window.location.href.includes(page)
  const element = document.getElementById(page)
  if (pageFound) {
    element.classList.add('is-active')
  } else {
    element.classList.remove('is-active')
  }
})

const sidebarLinks = document.querySelectorAll('.sidebar-link')

const hideSidebar = () => {
  console.log('here', window.screen.innerWidth)
  const sidebar = document.querySelector('.sidebar')
  if (window.screen.innerWidth > 1090) {
    sidebar.classList.remove('collapse')
    sidebar.classList.add('show')
  } else {
    sidebar.classList.add('collapse')
    sidebar.classList.add('show')
  }
}

window.addEventListener('load', hideSidebar)

// Add resize event listener to window
window.addEventListener('resize', hideSidebar)

window.dispatchEvent(new Event('resize'))

// Add mouseover and mouseleave event listeners to each video
const allVideos = document.querySelectorAll('.video')
allVideos.forEach((video) => {
  const v = video.querySelector('video')

  video.addEventListener('mouseover', () => v.play())
  video.addEventListener('mouseleave', () => v.pause())
})

// Add click event listeners to logo, logo-expand, and discover
const logo = document.querySelector('.logo')
const logoExpand = document.querySelector('.logo-expand')
const discover = document.querySelector('.discover')
const mainContainer = document.querySelector('.main-container')
logo.addEventListener('click', () => {
  mainContainer.classList.remove('show')
  mainContainer.scrollTop = 0
})
logoExpand.addEventListener('click', () => {
  mainContainer.classList.remove('show')
  mainContainer.scrollTop = 0
})
discover.addEventListener('click', () => {
  mainContainer.classList.remove('show')
  mainContainer.scrollTop = 0
})

// Add click event listeners to trending and video
const trending = document.querySelector('.trending')
const videoLinks = document.querySelectorAll('.video')
trending.addEventListener('click', () => {
  mainContainer.classList.add('show')
  mainContainer.scrollTop = 0
  sidebarLinks.forEach((link) => link.classList.remove('is-active'))
  trending.classList.add('is-active')
})

if (!window.location.href.includes('profile')) {
  videoLinks.forEach((video) => {
    video.addEventListener('click', () => {
      const source = video.querySelector('source').getAttribute('src')
      const title = video.querySelector('.video-name').textContent
      const person = video.querySelector('.video-by').textContent
      const img = video.querySelector('.author-img').getAttribute('src')
      const videoStream = document.querySelector('.video-stream video')
      const videoTitle = document.querySelector('.video-p-title')
      const videoPerson = document.querySelector('.video-p-name')
      const videoDetailImg = document.querySelector('.video-detail .author-img')
      videoStream.pause()
      videoStream.setAttribute('src', source)
      videoStream.load()
      videoTitle.textContent = title
      videoPerson.textContent = person
      videoDetailImg.setAttribute('src', img)
    })
  })
}
