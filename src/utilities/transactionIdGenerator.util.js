const randomString = require('randomstring')

module.exports = () => {
  const randomNum = randomString.generate({
    length: 6,
    charset: 'numeric'
  })

  const date = new Date()
  return `INV${date.getFullYear()}${date.getMonth()}${date.getDate()}${randomNum}`
}
