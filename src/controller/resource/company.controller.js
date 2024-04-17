const Company = require('../../model/company.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const isEmailUsed = require('../../utilities/checkUsedEmail.util')
const validator = require('validator')
const User = require('../../model/user.model')
const sequelizeConfig = require('../../config/sequelize.config')
const generatePassword = require('../../utilities/passwordGenerator.util')
const sendEmail = require('../../utilities/emailSender.util')
const { Op } = require('sequelize')
const Student = require('../../model/student.model')
const Training = require('../../model/training.model')

module.exports.findAll = async (req, res, next) => {
  const { search } = req.query
  const condition = {
    where: {}
  }

  try {
    if (typeof search === 'string') {
      condition.where = {
        [Op.or]: [
          {
            companyName: { [Op.iLike]: `%${search.trim()}%` }
          },
          {
            name: { [Op.iLike]: `%${search.trim()}%` }
          }
        ]
      }
    }

    const foundCompanies = await Company.findAll(condition)

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundCompanies
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundCompany = await Company.findByPk(_id, {
      include: 'students'
    })

    if (!foundCompany) return next(createError(404, 'Companies not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundCompany
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { email, companyName, phoneNumber, address, name, jobTitle } = req.body

  const t = await sequelizeConfig.transaction()

  try {
    if (!validator.isEmail(email)) return next(createError(400, 'Email is invalid'))

    const isUsed = await isEmailUsed(email)

    if (isUsed) return next(createError(409, 'Email already used'))

    const newCompany = await Company.create({
      _id: uuidv4(),
      email,
      companyName,
      phoneNumber,
      address,
      name,
      jobTitle
    }, { transaction: t })

    await t.commit()

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newCompany
      })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { companyName, phoneNumber, address, name, jobTitle, isApproval } = req.body
  const { _id } = req.params

  const t = await sequelizeConfig.transaction()

  try {
    const foundCompany = await Company.findByPk(_id)
    const status = isApproval !== undefined ? JSON.parse(isApproval) : ''

    if (!foundCompany) return next(createError(404, 'Companies not found'))

    const beforeState = foundCompany.isApproval

    if (companyName) foundCompany.companyName = companyName
    if (phoneNumber) foundCompany.phoneNumber = phoneNumber
    if (address) foundCompany.name = name
    if (jobTitle) foundCompany.jobTitle = jobTitle
    if (status === true || status === false || status === null) foundCompany.isApproval = status

    if (beforeState === false && status === true) {
      const email = foundCompany.email

      const foundUser = await User.findOne({
        where: {
          email
        }
      })

      const password = generatePassword()

      if (!foundUser) {
        const newUser = await User.create({
          _id: uuidv4(),
          email,
          role: 'business',
          password,
          isActive: true
        }, { transaction: t })

        foundCompany.userId = newUser._id

        sendEmail(email, password)
      }
    }

    if (beforeState === false && status === null) {
      const [rows, students] = await Student.update(
        { isApproval: null },
        {
          where: {
            companyId: _id
          },
          returning: true,
          transaction: t
        }
      )

      console.log(rows)

      for (const student of students) {
        await Training.update(
          { isApproval: null },
          {
            where: {
              studentId: student._id
            },
            transaction: t
          }
        )
      }
    }

    await foundCompany.save({ transaction: t })

    await t.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundCompany
      })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  const t = await sequelizeConfig.transaction()

  try {
    const foundCompany = await Company.findByPk(_id)

    if (!foundCompany) return next(createError(404, 'Companies not found'))

    const foundUser = await User.findOne({
      where: {
        email: foundCompany.email
      }
    })

    if (foundUser) await foundUser.destroy({ transaction: t })
    else await foundCompany.destroy({ transaction: t })

    await t.commit()

    res
      .status(204)
      .send()
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
