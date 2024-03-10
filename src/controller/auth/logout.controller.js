const Token = require('../../model/token.model')

module.exports = async (req, res, next) => {
  try {
    const cookies = req.cookies

    if (!cookies?.jwt) {
      return res.sendStatus(204)
    }

    const refreshToken = cookies.jwt
    const foundToken = await Token.findByPk(refreshToken)

    if (foundToken) {
      await foundToken.destroy()
    }

    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}
