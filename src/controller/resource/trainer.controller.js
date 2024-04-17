const Trainer = require('../../model/trainer.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const checkUsedEmail = require('../../utilities/checkUsedEmail.util')
const sequelizeConfig = require('../../config/sequelize.config')
const { Op } = require('sequelize')
const User = require('../../model/user.model')
const generatePassword = require('../../utilities/passwordGenerator.util')

module.exports.findAll = async (req, res, next) => {
  const { search } = req.query
  const condition = {
    where: {}
  }

  try {
    if (typeof search === 'string') condition.where.name = { [Op.iLike]: `%${search.trim()}%` }

    const foundTrainers = await Trainer.findAll(condition)

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundTrainers
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundTrainer = await Trainer.findByPk(_id)

    if (!foundTrainer) return next(createError(404, 'Trainer not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundTrainer
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { email, name, gender, phoneNumber, birthDate, address } = req.body

  const transaction = await sequelizeConfig.transaction()

  try {
    if (!validator.isEmail(email)) return next(createError(400, 'Email is invalid'))

    const checkEmail = await checkUsedEmail(email)

    if (checkEmail) return next(createError(409, 'Email already used'))

    const password = generatePassword()

    console.log(password)

    const newUser = await User.create({
      _id: uuidv4(),
      email,
      password,
      role: 'trainer',
      isActive: true
    }, { transaction })

    const newTrainer = await Trainer.create({
      _id: uuidv4(),
      email,
      name,
      gender,
      phoneNumber,
      birthDate,
      address,
      userId: newUser._id
    }, { transaction })

    await transaction.commit()

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newTrainer
      })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { name, gender, phoneNumber, birthDate, address } = req.body
  const { _id } = req.params

  const transaction = await sequelizeConfig.transaction()

  try {
    const foundTrainer = await Trainer.findByPk(_id)

    if (!foundTrainer) return next(createError(404, 'Trainer not found'))

    if (name) foundTrainer.name = name
    if (gender) foundTrainer.gender = gender
    if (phoneNumber) foundTrainer.phoneNumber = phoneNumber
    if (birthDate) foundTrainer.birthDate = birthDate
    if (address) foundTrainer.address = address

    await foundTrainer.save({ transaction })
    await transaction.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundTrainer
      })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  const transaction = await sequelizeConfig.transaction()

  try {
    const foundTrainer = await Trainer.findByPk(_id)

    if (!foundTrainer) return next(createError(404, 'Trainer not found'))

    const foundUser = await User.findOne({
      where: {
        email: foundTrainer.email
      }
    })

    if (foundUser) await foundUser.destroy({ transaction })
    else await foundTrainer.destroy({ transaction })

    await transaction.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}
