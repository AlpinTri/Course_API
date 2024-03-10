const logger = require('../config/logger.config')
const sequelize = require('sequelize')

module.exports = async (err, req, res, next) => {
  logger.error(err.message)

  if (!err) return next()

  if (err instanceof sequelize.ValidationError) {
    res
      .status(400)
      .json({
        success: false,
        error: err.message
      })
    return
  }

  if (err.status) {
    res
      .status(err.status)
      .json({
        success: false,
        error: err.message
      })
  } else {
    res
      .status(500)
      .json({
        success: false,
        error: err.message
      })
  }
}
