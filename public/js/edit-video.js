const tagsWrapper = document.querySelector('div[tags]')
const tagsArray = tagsWrapper.getAttribute('tags').split(',')
const newTagInput = tagsWrapper.querySelector('input[newTagInput]')
const addNewTagBtn = tagsWrapper.querySelector('button[addNewTagBtn]')

const addNewTag = (tag) => {
  const tagBtn = document.createElement('button')
  tagBtn.type = 'button'
  tagBtn.setAttribute('tag', tag)
  tagBtn.classList.add('btn', 'btn-outline-dark', 'p-2')
  tagBtn.textContent = tag + ' x'

  tagBtn.onclick = (e) => {
    e.target.closest('.btn').remove()
  }
  tagsWrapper.appendChild(tagBtn)
}




