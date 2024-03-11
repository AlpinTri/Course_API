const validator = require('validator')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const checkUsedEmail = require('../../utilities/checkUsedEmail.util')
const Student = require('../../model/student.model')
const User = require('../../model/user.model')
const sequelizeConfig = require('../../config/sequelize.config')

module.exports.findAll = async (req, res, next) => {
  const { company } = req.query

  const condition = {}

  try {
    if (company) condition.where = { companyId: company }

    const foundStudents = await Student.findAll(condition)

    if (!foundStudents.length) return next(createError(404, 'Student not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundStudents.map(student => student.dataValues)
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundStudent = await Student.findByPk(_id)

    if (!foundStudent) return next(createError(404, 'Student not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundStudent.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { email, companyId, name, gender, phoneNumber, birthDate, address } = req.body

  try {
    if (!validator.isEmail(email)) return next(createError(400, 'Email is invalid'))

    const checkEmail = await checkUsedEmail(email)

    if (checkEmail) return next(createError(409, 'Email already used'))

    const studentData = {
      _id: uuidv4(),
      email,
      name,
      gender,
      phoneNumber,
      birthDate,
      address
    }

    if (companyId) studentData.companyId = companyId

    const newStudent = await Student.create(studentData)

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newStudent.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { companyId, name, gender, phoneNumber, birthDate, address } = req.body
  const { _id } = req.params

  try {
    const foundStudent = await Student.findByPk(_id)

    if (!foundStudent) return next(createError(404, 'Student not found'))

    const updateData = {}

    if (companyId) updateData.companyId = companyId
    if (name) updateData.name = name
    if (gender) updateData.gender = gender
    if (phoneNumber) updateData.phoneNumber = phoneNumber
    if (birthDate) updateData.birthDate = birthDate
    if (address) updateData.address = address

    foundStudent.set(updateData)
    await foundStudent.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundStudent.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  const t = await sequelizeConfig.transaction()

  try {
    const foundStudent = await Student.findByPk(_id)

    if (!foundStudent) return next(createError(404, 'Student not found'))

    const foundUser = await User.findOne({
      where: {
        email: foundStudent.dataValues.email
      }
    })

    await foundStudent.destroy({ transaction: t })

    if (foundUser) await foundUser.destroy({ transaction: t })

    await t.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
