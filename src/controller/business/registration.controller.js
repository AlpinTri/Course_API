const sequelizeConfig = require('../../config/sequelize.config')
const checkEmail = require('../../utilities/checkUsedEmail.util')
const createError = require('http-errors')
const Company = require('../../model/company.model')
const Student = require('../../model/student.model')
const { v4: uuidv4 } = require('uuid')

module.exports.individual = async (req, res, next) => {
  const { email, name, gender, phoneNumber, birthDate, address, courseId } = req.body

  const t = await sequelizeConfig.transaction()

  try {
    const now = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' }).substring(0, 10).replaceAll('/', '-')

    const isUsed = await checkEmail(email)

    if (isUsed) return next(createError(409, 'Email is already used'))

    const newStudent = await Student.create({
      _id: uuidv4(),
      email,
      name,
      gender,
      phoneNumber,
      birthDate,
      address
    }, { transaction: t })

    const newTr = await newStudent.createTraining({
      _id: uuidv4(),
      studentId: newStudent.dataValues._id,
      courseId,
      date: now
    }, { transaction: t })

    console.log(newTr)
    await t.commit()

    res
      .status(201)
      .json({
        success: true,
        message: 'Created'
      })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

module.exports.group = async (req, res, next) => {
  const { company, students } = req.body
  const { email, companyName, phoneNumber, address, name, jobTitle } = company

  const t = await sequelizeConfig.transaction()

  try {
    const now = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' }).substring(0, 10).split('/').reverse().join('-')

    const isCompanyUsed = await checkEmail(company.email)

    if (isCompanyUsed) return next(createError(409, `${company.email} is already used`))

    const newCompany = await Company.create({
      _id: uuidv4(),
      email,
      companyName,
      phoneNumber,
      address,
      name,
      jobTitle
    }, { transaction: t })

    for (const student of students) {
      const { courseId, email, name, gender, phoneNumber, birthDate, address } = student
      const isUsed = await checkEmail(email)

      if (isUsed) return next(createError(409, `${student.email} is already used`))

      const newStudent = await Student.create({
        _id: uuidv4(),
        email,
        name,
        gender,
        phoneNumber,
        birthDate,
        address,
        companyId: newCompany.dataValues._id
      }, { transaction: t })

      await newStudent.createTraining({
        _id: uuidv4(),
        studentId: newStudent.dataValues._id,
        courseId,
        date: now
      }, { transaction: t })
    }

    await t.commit()

    res
      .status(201)
      .json({
        success: true,
        message: 'Created'
      })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}
