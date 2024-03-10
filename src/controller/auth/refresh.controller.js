const createError = require('http-errors')
const Token = require('../../model/token.model')
const jwt = require('jsonwebtoken')
const User = require('../../model/user.model')

module.exports = async (req, res, next) => {
  const cookies = req.cookies

  // Check available cookie
  if (!cookies?.jwt) return next(createError(401, 'Refresh token unavailabe'))

  const refreshToken = cookies.jwt
  const foundToken = await Token.findByPk(refreshToken)

  // If client/user try to reuse refresh token
  if (!foundToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

      await Token.destroy({
        where: {
          userId: decoded.data._id
        }
      })

      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })

      return next(createError(403, 'Forbidden'))
    } catch (err) {
      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })
      return next(createError(403, 'Forbidden'))
    }
  }

  try {
    if (foundToken.isExpired) return next(createError(401, 'Token expired'))

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const foundUser = await User.findByPk(decoded.data._id)

    // If user try to create access token but user has been deleted
    if (!foundUser) {
      await Token.destroy({
        where: {
          userId: foundToken.userId
        }
      })

      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })

      return next(createError(401, 'Unautorized'))
    }

    // Create new token and send to client
    const newAccessToken = jwt.sign({
      data: {
        _id: foundUser._id,
        role: foundUser.role
      }
    }, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRE })

    res
      .status(200)
      .json({
        success: true,
        message: 'Success to create new access token',
        accessToken: newAccessToken
      })
  } catch (err) {
    if (err.message === 'jwt expired') {
      await Token.destroy({
        where: {
          _id: refreshToken
        }
      })

      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })

      return next(createError(401, 'Token expired'))
    } else {
      return next(err)
    }
  }
}
