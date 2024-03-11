const Trainer = require('../../model/trainer.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const checkUsedEmail = require('../../utilities/checkUsedEmail.util')
const { save, destroy, isSame } = require('../../../public/handler')
const sequelizeConfig = require('../../config/sequelize.config')

module.exports.findAll = async (req, res, next) => {
  try {
    const foundTrainers = await Trainer.findAll()

    if (!foundTrainers.length) return next(createError(404, 'Trainers not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundTrainers.map(trainer => trainer.dataValues)
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
        message: 'Ok',
        data: foundTrainer.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { email, name, gender, phoneNumber, birthDate, address } = req.body

  const transaction = await sequelizeConfig.transaction()

  let imageName

  try {
    imageName = await save(req)
  } catch (err) {
    return next(err)
  }

  try {
    if (!validator.isEmail(email)) return next(createError(400, 'Email is invalid'))

    const checkEmail = await checkUsedEmail(email)

    if (checkEmail) return next(createError(409, 'Email already used'))

    const trainerData = {
      _id: uuidv4(),
      email,
      name,
      gender,
      phoneNumber,
      birthDate,
      address,
      selfImage: imageName
    }

    const newTrainer = await Trainer.create(trainerData, { transaction })

    await transaction.commit()

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newTrainer.dataValues
      })
  } catch (err) {
    await transaction.rollback()
    destroy(imageName)
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

    const updateData = {}

    if (name) updateData.name = name
    if (gender) updateData.gender = gender
    if (phoneNumber) updateData.phoneNumber = phoneNumber
    if (birthDate) updateData.birthDate = birthDate
    if (address) updateData.address = address

    if (req.files?.image) {
      const match = await isSame(req.files.image, foundTrainer.dataValues.selfImage)

      if (!match) {
        const imageName = await save(req)
        destroy(foundTrainer.dataValues.selfImage)
        updateData.selfImage = imageName
      }
    }

    foundTrainer.set(updateData)
    await foundTrainer.save({ transaction })

    await transaction.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundTrainer.dataValues
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

    const filename = foundTrainer.dataValues.selfImage

    await foundTrainer.destroy({ transaction })

    destroy(filename)

    await transaction.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}
