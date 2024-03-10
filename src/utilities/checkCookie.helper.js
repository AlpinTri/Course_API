/* eslint-disable no-async-promise-executor */
const Token = require('../model/token.model')

/**
 *
 * @param {object} cookies
 * @param {object} res
 * @returns resolve(true) || reject(error)
 */
module.exports = (cookies, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const refreshToken = cookies?.jwt
      if (cookies?.jwt) {
        const foundToken = await Token.findByPk(refreshToken)

        console.log(refreshToken)

        if (foundToken) {
          await Token.destroy({
            where: {
              _id: refreshToken
            }
          })
        }
      }

      res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV !== 'development' })

      resolve(true)
    } catch (err) {
      reject(err)
    }
  })
}
