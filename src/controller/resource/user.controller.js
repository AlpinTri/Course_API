const User = require('../../model/user.model')
const createError = require('http-errors')
const isEmailUsed = require('../../utilities/checkUsedEmail.util')
const { v4: uuidv4 } = require('uuid')
const sequelizeConfig = require('../../config/sequelize.config')
const sendMail = require('../../utilities/emailSender.util')

module.exports.findAll = async (req, res, next) => {
  try {
    const foundUsers = await User.findAll({ attributes: { exclude: ['password'] } })

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundUsers
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  const foundUser = await User.findByPk(_id, { attributes: { exclude: ['password'] } })

  if (!foundUser) return next(createError(404, 'User not found'))

  res
    .status(200)
    .json({
      success: true,
      message: 'Success',
      data: foundUser
    })
}

module.exports.createOne = async (req, res, next) => {
  const { email, password, role, isActive } = req.body
  const { isSend } = req.query
  const _id = uuidv4()

  const roleList = ['admin']

  if (roleList.includes(role)) {
    const isUsed = await isEmailUsed(email)

    if (isUsed) return next(createError(409, 'Email already used'))
  } else {
    return next(createError(400, 'Role now allowed'))
  }

  try {
    const newUser = await User.create({
      _id,
      email,
      role,
      password,
      isActive
    })

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newUser
      })

    if (isSend === true) {
      sendMail(newUser.email, newUser.password)
    }
  } catch (err) {
    return next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { isActive } = req.body
  const { _id } = req.params
  const status = isActive !== undefined ? JSON.parse(isActive) : null

  try {
    const foundUser = await User.findByPk(_id)

    if (!foundUser) return next(createError(404, 'User not found'))

    if (status === true || status === false) foundUser.isActive = status

    await foundUser.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundUser
      })
  } catch (err) {
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  const transaction = await sequelizeConfig.transaction()

  try {
    const foundUser = await User.findByPk(_id)

    if (!foundUser) return next(createError(404, 'User not found'))

    await foundUser.destroy({
      transaction
    })

    await transaction.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}
