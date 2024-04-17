const path = require('node:path')
const fs = require('node:fs')
const crypto = require('node:crypto')
const logger = require('../src/config/logger.config')
const { v4: uuidv4 } = require('uuid')

module.exports.save = (req, folder) => {
  return new Promise((resolve, reject) => {
    const files = req.files?.image

    if (!files) return reject(new Error('Invalid \'image\' field'))

    const filename = `${uuidv4().replaceAll('-', '')}${path.extname(files.name)}`
    const filePath = path.join(__dirname, `/assets/${folder}`, filename)
    files.mv(filePath, (err) => {
      if (err) return reject(err.message)

      resolve(filename)
    })
  })
}

module.exports.destroy = (filename, folder) => {
  const filePath = path.join(__dirname, `/assets/${folder}`, filename)

  fs.unlink(filePath, (err) => {
    if (err) {
      logger.error(err.message)
    }
  })
}

module.exports.isSame = (newFileHash, oldFile, folder) => {
  return new Promise((resolve, reject) => {
    const dirFile = path.join(__dirname, `/assets/${folder}`, oldFile)

    fs.readFile(dirFile, (err, data) => {
      if (err) {
        logger.error(err.message)
        resolve(false)
        return
      }

      const hash = crypto.createHash('md5').update(data).digest('hex')

      if (hash === newFileHash) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

module.exports.saveCert = (req) => {
  const date = new Date()
  const file = req.files?.certificate

  console.log(file)

  const fileName = `${date.getFullYear()}${date.getMonth()}${date.getDate()}-${date.getTime()}${path.extname(file.name)}`
  const filePath = path.join(__dirname, '/assets/certificates', fileName)
  return new Promise((resolve, reject) => {
    file.mv(filePath, (err) => {
      if (err) return reject(err.message)

      resolve(fileName)
    })
  })
}

module.exports.sendCert = (res, fileName) => {
  const filePath = path.join(__dirname, '/assets/certificates', fileName)
  console.log(filePath)

  res.sendFile(filePath)
}
