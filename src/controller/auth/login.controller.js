const createError = require('http-errors')
const User = require('../../model/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require('../../model/token.model')
const checkCookie = require('../../utilities/checkCookie.util')

module.exports = async (req, res, next) => {
  const { email, password } = req.body
  const cookies = req.cookies

  // Found the user account
  const user = await User.findOne({
    where: {
      email
    }
  })

  if (!user) return next(createError(401, 'Invalid credentials'))

  // Compare the password
  const match = await bcrypt.compare(password, user.password)

  if (!match) return next(createError(401, 'Invalid credentials'))

  // Check user status acount
  if (!user.isActive) return next(createError(403, 'Your account is blocked'))

  // Create Access Token & Refresh Token
  const accessToken = jwt.sign({
    data: {
      _id: user._id
    }
  }, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: process.env.ACCESS_TOKEN_EXPIRE })

  const refreshToken = jwt.sign({
    data: {
      _id: user._id
    }
  }, process.env.REFRESH_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: process.env.REFRESH_TOKEN_EXPIRE })

  // Save refresh token to DB & send response to client
  try {
    await checkCookie(cookies, res)

    await Token.create({
      _id: refreshToken,
      userId: user._id,
      expiredAt: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    })
  } catch (err) {
    return next(err)
  }

  const userData = {
    role: user.role,
    email: user.email,
    _id: user._id
  }

  try {
    if (user.role === 'student') {
      const student = await user.getStudent()
      userData.name = student.name
    } else if (user.role === 'business') {
      const company = await user.getCompany()
      userData.name = company.name
    } else if (user.role === 'trainer') {
      const trainer = await user.getTrainer()
      userData.name = trainer.name
    }
  } catch (err) {
    return next(err)
  }

  res
    .status(200)
    .cookie('jwt', refreshToken, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development'
    })
    .json({
      success: true,
      message: 'Login is successful',
      accessToken,
      data: userData
    })
}
