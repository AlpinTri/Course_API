const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const User = require('../model/user.model')
const validator = require('validator')

module.exports = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1]

  try {
    if (!accessToken || !validator.isJWT(accessToken)) return next(createError(401, 'Unauthorized'))

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    const foundUser = await User.findByPk(decoded.data._id)

    if (!foundUser) return next(createError(401, 'Unauthorized'))

    req.role = decoded.data.role

    next()
  } catch (err) {
    if (err.message === 'jwt expired') return next(createError(403, 'Access token expired'))
    if (err instanceof jwt.JsonWebTokenError) return next(createError(400, 'Invalid access token'))

    next(err)
  }
}
