const Company = require('../../model/company.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const isEmailUsed = require('../../utilities/checkUsedEmail.util')
const validator = require('validator')
const User = require('../../model/user.model')
const sequelizeConfig = require('../../config/sequelize.config')
const generatePassword = require('../../utilities/passwordGenerator.util')
const sendEmail = require('../../utilities/emailSender.util')

module.exports.findAll = async (req, res, next) => {
  try {
    const foundCompanies = await Company.findAll()

    if (!foundCompanies.length) return next(createError(404, 'Companies not found'))

    const companies = foundCompanies.map(trd => trd.dataValues)

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: companies
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundCompany = await Company.findByPk(_id)

    if (!foundCompany) return next(createError(404, 'Companies not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundCompany.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { email, companyName, phoneNumber, address, name, jobTitle } = req.body

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
    })

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newCompany.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { companyName, phoneNumber, address, name, jobTitle, isApproval } = req.body
  const { _id } = req.params

  const t = await sequelizeConfig.transaction()

  try {
    const foundCompany = await Company.findByPk(_id)

    if (!foundCompany) return next(createError(404, 'Companies not found'))

    const beforeState = foundCompany.dataValues.isApproval

    const companyData = {}

    if (companyName) companyData.companyName = companyName
    if (phoneNumber) companyData.phoneNumber = phoneNumber
    if (address) companyData.name = name
    if (jobTitle) companyData.jobTitle = jobTitle
    if (isApproval === true || isApproval === false) companyData.isApproval = isApproval

    foundCompany.set(companyData)
    await foundCompany.save({ transaction: t })

    console.log(beforeState)
    if (beforeState === false && isApproval === true) {
      console.log('pass')
      const email = foundCompany.dataValues.email

      const foundUser = await User.findOne({
        where: {
          email
        }
      })

      const password = generatePassword()

      if (!foundUser) {
        await User.create({
          _id: uuidv4(),
          email,
          role: 'business',
          password,
          isActive: true
        }, { transaction: t })

        sendEmail(email, password)
      }
    }

    await t.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundCompany.dataValues
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
        email: foundCompany.dataValues.email
      }
    })

    await foundCompany.destroy({ transaction: t })

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
