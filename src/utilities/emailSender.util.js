const nodemailer = require('nodemailer')
const logger = require('../config/logger.config')

module.exports = (email, password) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alpintripranjadata@gmail.com',
      pass: 'nofa ydfc jriw mpmb'
    }
  })

  const messageOptions = {
    from: 'Alpin Tri Pranjadata <alpintripranjadata@gmail.com>',
    to: email,
    subject: 'Password untuk akun kursus kamu',
    html: `<p>Password kamu adalah ${password}</p>`
  }

  transporter.sendMail(messageOptions, (err, info) => {
    if (err) {
      logger.error(err.message)
    } else {
      logger.info(info)
    }
  })
}
