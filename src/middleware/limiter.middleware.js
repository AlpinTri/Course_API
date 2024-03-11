const { rateLimit } = require('express-rate-limit')

const limiter = (limit) => {
  return rateLimit({
    limit,
    windowMs: 1 * 60 * 1000,
    handler: async (req, res, next, options) => {
      res
        .status(options.statusCode)
        .json({
          success: false,
          error: options.message
        })
    }
  })
}
module.exports = limiter
