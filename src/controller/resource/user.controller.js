const User = require('../../model/user.model')
// const Company = require('../../model/company.model')
// const Trainer = require('../../model/trainer.model')
// const Student = require('../../model/student.model')
const createError = require('http-errors')
const checkEmail = require('../../utilities/checkUsedEmail.util')
const { v4: uuidv4 } = require('uuid')
const sequelizeConfig = require('../../config/sequelize.config')
const sendMail = require('../../utilities/emailSender.util')

module.exports.findAll = async (req, res, next) => {
  const foundUsers = await User.findAll()

  console.log(foundUsers)
  if (!foundUsers.length) return next(createError(404, 'Users not found'))

  res
    .status(200)
    .json({
      success: true,
      message: 'Ok',
      data: foundUsers.map(user => user.dataValues)
    })
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  const foundUser = await User.findByPk(_id)

  if (!foundUser) return next(createError(404, 'User not found'))

  res
    .status(200)
    .json({
      success: true,
      message: 'Ok',
      data: foundUser.dataValues
    })
}

module.exports.createOne = async (req, res, next) => {
  const { email, password, role, isActive, isSend } = req.body
  const _id = uuidv4()

  const roleList = ['business', 'student', 'trainer']

  if (role === 'super admin') {
    const isUsed = await checkEmail(email, role)

    if (isUsed) return next(createError(409, 'Email already used'))
  }

  if (roleList.includes(role)) {
    const isUsed = await checkEmail(email, role)

    if (!isUsed) return next(createError(404, 'Cannot found the email'))
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
        data: newUser.dataValues
      })

    if (isSend === true) {
      sendMail(newUser.dataValues.email, newUser.dataValues.password)
    }
  } catch (err) {
    return next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { isActive } = req.body
  const { _id } = req.params

  try {
    const foundUser = await User.findByPk(_id)

    if (!foundUser) return next(createError(404, 'User not found'))

    foundUser.isActive = isActive

    await foundUser.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundUser.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  // const foundUser = await User.findByPk(_id)
  // let destroyData

  // if (!foundUser) return next(createError(404, 'User not found'))

  // if (foundUser.dataValues.role === 'business') {
  //   destroyData = await Company.findOne({
  //     where: {
  //       email: foundUser.dataValues.email
  //     }
  //   })
  // }

  // if (foundUser.dataValues.role === 'student') {
  //   destroyData = await Student.findOne({
  //     where: {
  //       email: foundUser.dataValues.email
  //     }
  //   })
  // }

  // if (foundUser.dataValues.role === 'trainer') {
  //   destroyData = await Trainer.findOne({
  //     where: {
  //       email: foundUser.dataValues.email
  //     }
  //   })
  // }

  const transaction = await sequelizeConfig.transaction()

  try {
    const foundUser = await User.findByPk(_id)

    if (!foundUser) return next(createError(404, 'User not found'))

    await foundUser.destroy({
      transaction
    })

    // await destroyData.destroy({
    //   transaction
    // })

    await transaction.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}
