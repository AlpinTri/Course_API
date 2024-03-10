const randomString = require('randomstring')

module.exports = () => {
  return randomString.generate({
    length: 6,
    charset: 'numeric'
  })
}
