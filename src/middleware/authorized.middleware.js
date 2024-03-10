const createError = require('http-errors')

module.exports = (...role) => {
  return async (req, res, next) => {
    if (role.includes(req.role)) return next()

    console.log(req.role)
    next(createError(403, 'Forbidden'))
  }
}
