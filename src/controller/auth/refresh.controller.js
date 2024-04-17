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
    if (foundToken.isExpired) return next(createError(401, 'Refresh token expired'))

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const foundUser = await User.findByPk(decoded.data._id, { attributes: { exclude: ['password'] } })

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
        _id: foundUser._id
      }
    }, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRE })

    const userData = {
      role: foundUser.role,
      email: foundUser.email,
      _id: foundUser._id
    }

    if (foundUser.role === 'student') {
      const student = await foundUser.getStudent()
      userData.name = student.name
    } else if (foundUser.role === 'business') {
      const company = await foundUser.getCompany()
      userData.name = company.name
    } else if (foundUser.role === 'trainer') {
      const trainer = await foundUser.getTrainer()
      userData.name = trainer.name
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        accessToken: newAccessToken,
        data: userData
      })
  } catch (err) {
    if (err.message === 'jwt expired') {
      await Token.destroy({
        where: {
          _id: refreshToken
        }
      })

      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })

      return next(createError(401, 'Refresh token expired'))
    } else {
      return next(err)
    }
  }
}
