const createError = require('http-errors')

module.exports = (...role) => {
  return async (req, res, next) => {
    if (role.includes(req.role)) return next()

    next(createError(403, 'The operation is not allowed'))
  }
}
