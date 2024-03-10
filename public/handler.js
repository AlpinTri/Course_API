const path = require('node:path')
const fs = require('node:fs')
const crypto = require('node:crypto')
const logger = require('../src/config/logger.config')
const { v4: uuidv4 } = require('uuid')

module.exports.save = (req) => {
  return new Promise((resolve, reject) => {
    const files = req.files?.image

    if (!files) reject(new Error('Invalid \'image\' field'))

    const filename = `${uuidv4().replaceAll('-', '')}${path.extname(files.name)}`
    const filePath = path.join(__dirname, '/assets', filename)
    files.mv(filePath, (err) => {
      if (err) reject(err.message)

      resolve(filename)
    })
  })
}

module.exports.destroy = (filename) => {
  const filePath = path.join(__dirname, '/assets', filename)

  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error(err.message)
    }
  })
}

module.exports.isSame = (newFileHash, oldFile) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '/assets', oldFile), (err, data) => {
      if (err) {
        logger.error(err.message)
      }

      const hash = crypto.createHash('md5').update(data).digest('hex')

      if (hash === newFileHash) {
        resolve(true)
      }

      resolve(false)
    })
  })
}
