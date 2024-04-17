const validator = require('validator')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const checkUsedEmail = require('../../utilities/checkUsedEmail.util')
const Student = require('../../model/student.model')
const User = require('../../model/user.model')
const Training = require('../../model/training.model')
const sequelizeConfig = require('../../config/sequelize.config')
const generatePassword = require('../../utilities/passwordGenerator.util')
const sendEmail = require('../../utilities/emailSender.util')
const { Op } = require('sequelize')

module.exports.findAll = async (req, res, next) => {
  const { company, search } = req.query

  const condition = {
    where: {}
  }

  try {
    if (company === '0') condition.where.companyId = { [Op.is]: null }
    if (company === '1') condition.where.companyId = { [Op.not]: null }
    if (typeof search === 'string') condition.where.name = { [Op.iLike]: `%${search.trim()}%` }

    const foundStudents = await Student.findAll(condition)

    console.log(foundStudents)
    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundStudents
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundStudent = await Student.findByPk(_id, {
      include: ['company']
    })

    if (!foundStudent) return next(createError(404, 'Student not found'))

    const foundTrainings = await Training.findAll({
      where: {
        studentId: foundStudent._id
      },
      include: 'course'
    })

    if (!foundTrainings) return next(createError(404, 'Student not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: {
          ...foundStudent.toJSON(),
          trainings: foundTrainings
        }
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
        data: newStudent
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { name, gender, phoneNumber, birthDate, address, isApproval } = req.body
  const { _id } = req.params

  const t = await sequelizeConfig.transaction()

  try {
    const foundStudent = await Student.findByPk(_id)
    const status = isApproval !== undefined ? JSON.parse(isApproval) : ''

    if (!foundStudent) return next(createError(404, 'Student not found'))

    const beforeState = foundStudent.isApproval

    if (name) foundStudent.name = name
    if (gender) foundStudent.gender = gender
    if (phoneNumber) foundStudent.phoneNumber = phoneNumber
    if (birthDate) foundStudent.birthDate = birthDate
    if (address) foundStudent.address = address
    if (status === true || status === false || status === null) foundStudent.isApproval = status

    // Student approved
    if (beforeState === false && status === true && !foundStudent.companyId) {
      const email = foundStudent.email

      const password = generatePassword()

      const newUser = await User.create({
        _id: uuidv4(),
        email,
        role: 'student',
        password,
        isActive: true
      }, { transaction: t })

      foundStudent.userId = newUser._id

      sendEmail(email, password)
    }

    // Student canceled
    if (beforeState === false && status === null) {
      await Training.update(
        { isApproval: null },
        {
          where: {
            studentId: _id
          },
          transaction: t
        }
      )
    }

    await foundStudent.save({ transaction: t })

    await t.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundStudent
      })
  } catch (err) {
    next(err)
    await t.rollback()
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
        email: foundStudent.email
      }
    })

    if (foundUser) await foundUser.destroy({ transaction: t })
    else await foundStudent.destroy({ transaction: t })

    await t.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
