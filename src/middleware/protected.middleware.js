const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const User = require('../model/user.model')
const validator = require('validator')

module.exports = async (req, res, next) => {
  let accessToken

  try {
    if (req.headers.authorization?.startsWith('Bearer')) {
      accessToken = req.headers.authorization?.split(' ')[1]

      if (!accessToken || !validator.isJWT(accessToken)) return next(createError(401, 'Access token unavailable'))
    } else {
      return next(createError(400, 'Missing authorization header'))
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    const foundUser = await User.findByPk(decoded.data._id)

    if (!foundUser) return next(createError(401, 'Unauthorized'))
    if (!foundUser.isActive) return next(createError(403, 'Your account is blocked'))

    req.role = foundUser.role
    req.email = foundUser.email

    next()
  } catch (err) {
    if (err.message === 'jwt expired') return next(createError(401, 'Access token expired'))
    if (err instanceof jwt.JsonWebTokenError) return next(createError(400, 'Invalid access token'))
    console.log(err)
    next(err)
  }
}
