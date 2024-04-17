const User = require('../../model/user.model')
const Training = require('../../model/training.model')
const Trainer = require('../../model/trainer.model')
const Student = require('../../model/student.model')
const Course = require('../../model/course.model')
const Schedule = require('../../model/schedule.model')
const Company = require('../../model/company.model')
const { filterCourseQuery, filterMemberQuery } = require('../../utilities/filterStatus.util')
const createError = require('http-errors')
const generateInvoice = require('../../utilities/transactionIdGenerator.util')
const checkUsedEmail = require('../../utilities/checkUsedEmail.util')
const validator = require('validator')
const { v4: uuidv4 } = require('uuid')
const { sendCert } = require('../../../public/handler')
const sequelizeConfig = require('../../config/sequelize.config')

module.exports.me = async (req, res, next) => {
  const email = req.email

  try {
    const foundUser = await User.findOne({
      where: { email },
      attributes: { exclude: ['password'] }
    })
    let data = {}

    if (foundUser.role === 'business') {
      data = await foundUser.getCompany()
    } else if (foundUser.role === 'student') {
      data = await foundUser.getStudent()
    } else if (foundUser.role === 'trainer') {
      data = await foundUser.getTrainer()
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateMe = async (req, res, next) => {
  const email = req.email
  console.log('pass')

  try {
    const foundUser = await User.findOne({ where: { email } })
    let data = null

    if (foundUser.role === 'business') {
      const result = await foundUser.getCompany()
      const { name, phoneNumber, jobTitle, address, gender } = req.body

      if (!result) return next(createError(404, 'Data not found'))

      result.set({
        name,
        phoneNumber,
        jobTitle,
        address,
        gender
      })

      await result.save()

      data = result
    } else if (foundUser.role === 'student') {
      const result = await foundUser.getStudent()
      const { name, phoneNumber, gender, address, birthDate } = req.body

      if (!result) return next(createError(404, 'Data not found'))

      result.set({
        name,
        phoneNumber,
        gender,
        address,
        birthDate
      })

      await result.save()

      data = result
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: data.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.cancelCourse = async (req, res, next) => {
  const { _id } = req.params
  const { status } = req.body
  const email = req.email

  try {
    if (status !== 0) return next(createError(400, 'Invalid payload'))

    const foundUser = await User.findOne({ where: { email } })

    if (foundUser.role === 'business') {
      const result = await foundUser.getCompany()

      if (!result) return next(createError(404, 'Company not found'))

      const foundTraining = await Training.findOne({
        where: {
          _id
        },
        include: {
          model: Student,
          where: {
            companyId: result._id
          }
        }
      })

      if (!foundTraining) return next(createError(404, 'Training not found'))

      foundTraining.set({
        isApproval: null
      })

      await foundTraining.save()
    } else if (foundUser.role === 'student') {
      const result = await foundUser.getStudent()

      if (!result) return next(createError(404, 'Student not found'))

      const foundTraining = await Training.findOne({
        where: {
          _id,
          studentId: result._id
        }
      })

      if (!foundTraining) return next(createError(404, 'Training not found'))

      foundTraining.set({
        isApproval: null
      })

      await foundTraining.save()
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success'
      })
  } catch (err) {
    next(err)
  }
}

module.exports.cancelMember = async (req, res, next) => {
  const { status } = req.body
  const { _id } = req.params
  const email = req.email

  const transaction = await sequelizeConfig.transaction()

  try {
    if (status !== 0) return next(createError(400, 'Invalid payload'))

    const foundUser = await User.findOne({ where: { email } })

    if (foundUser.role === 'business') {
      const result = await foundUser.getCompany()

      if (!result) return next(createError(404, 'Company not found'))

      const foundStudent = await Student.findOne({
        where: {
          isApproval: false,
          _id,
          companyId: result._id
        }
      })

      if (!foundStudent) return next(createError(404, 'Student not found'))

      foundStudent.set({
        isApproval: null
      }, { transaction })

      await Training.update(
        { isApproval: null },
        {
          where: {
            studentId: foundStudent._id
          },
          transaction
        }
      )

      await foundStudent.save({ transaction })

      await transaction.commit()
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success'
      })
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

module.exports.courses = async (req, res, next) => {
  const { status } = req.query
  const email = req.email

  try {
    const foundUser = await User.findOne({ where: { email } })
    const data = []

    if (foundUser.role === 'student') {
      const student = await foundUser.getStudent()
      const trainings = await Training.findAll({
        where: {
          studentId: student._id,
          ...filterCourseQuery(status)
        },
        include: [
          {
            model: Trainer,
            attributes: ['name']
          },
          {
            model: Course,
            attributes: ['courseName']
          },
          {
            model: Student,
            attributes: ['name']
          }
        ]
      })

      trainings.forEach(item => data.push(item.dataValues))
    } else if (foundUser.role === 'business') {
      const company = await foundUser.getCompany()
      const students = await Student.findAll({
        where: {
          companyId: company._id
        }
      })

      for (const student of students) {
        const foundTrainings = await Training.findAll({
          where: {
            studentId: student._id,
            ...filterCourseQuery(status)
          },
          include: [
            {
              model: Trainer,
              attributes: ['name']
            },
            {
              model: Course,
              attributes: ['courseName']
            },
            {
              model: Student,
              attributes: ['name']
            }
          ]
        })

        for (const training of foundTrainings) {
          data.push(training.dataValues)
        }
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.course = async (req, res, next) => {
  const { _id } = req.params
  const email = req.email

  try {
    const foundUser = await User.findOne({ where: { email } })
    let data = null

    if (foundUser.role === 'student') {
      const student = await foundUser.getStudent()
      const trainings = await Training.findOne({
        where: {
          studentId: student._id,
          _id
        },
        include: [
          {
            model: Trainer,
            attributes: ['name']
          },
          {
            model: Course,
            attributes: ['courseName', 'price']
          },
          {
            model: Student,
            attributes: ['name']
          },
          {
            model: Schedule
          }
        ]
      })

      if (trainings) {
        data = trainings.dataValues
      }
    } else if (foundUser.role === 'business') {
      const company = await foundUser.getCompany()
      const trainings = await Training.findOne({
        where: {
          _id
        },
        include: [
          {
            model: Trainer,
            attributes: ['name']
          },
          {
            model: Course,
            attributes: ['courseName', 'price']
          },
          {
            model: Student,
            attributes: ['name'],
            where: {
              companyId: company._id
            }
          },
          {
            model: Schedule
          }
        ]
      })

      if (trainings) {
        data = trainings.dataValues
      }
    }

    if (data === null) return next(createError(404, 'Training not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.newCourse = async (req, res, next) => {
  const { studentId, courseId } = req.body
  const email = req.email

  try {
    const now = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' }).substring(0, 10).split('/').reverse().join('-')
    const user = await User.findOne({ where: { email } })

    if (user.role === 'business') {
      const foundCompany = await user.getCompany()
      if (!foundCompany) return next(createError(404, 'Company not found'))

      const foundStudent = await Student.findOne({ where: { _id: studentId, companyId: foundCompany._id } })
      if (!foundStudent) return next(createError(404, 'Student not found'))

      const foundCourse = await Course.findByPk(courseId)
      if (!foundCourse) return next(createError(404, 'Course not found'))

      await foundStudent.createTraining({
        _id: generateInvoice(),
        studentId: foundStudent._id,
        courseId: foundCourse._id,
        date: now
      })
    } else if (user.role === 'student') {
      const foundStudent = await user.getStudent()
      if (!foundStudent) return next(createError(404, 'Student not found'))

      const foundCourse = await Course.findByPk(courseId)
      if (!foundCourse) return next(createError(404, 'Course not found'))

      await foundStudent.createTraining({
        _id: generateInvoice(),
        studentId: foundStudent._id,
        courseId: foundCourse._id,
        date: now
      })
    }

    res
      .status(201)
      .json({
        success: true,
        message: 'Created'
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.members = async (req, res, next) => {
  const { status } = req.query
  const email = req.email

  try {
    const foundUser = await User.findOne({ where: { email } })
    const data = []
    const company = await foundUser.getCompany()
    const students = await Student.findAll({
      where: {
        companyId: company._id,
        ...filterMemberQuery(status)
      }
    })

    students.forEach(item => data.push(item.dataValues))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.newMember = async (req, res, next) => {
  const companyEmail = req.email
  const { email, name, gender, phoneNumber, birthDate } = req.body

  try {
    const foundCompany = await Company.findOne({ where: { email: companyEmail } })

    if (!foundCompany) return next(createError(404, 'Company not found'))

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
      address: foundCompany.address,
      companyId: foundCompany._id
    }

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

module.exports.downloadCert = async (req, res, next) => {
  const { email, role } = req
  const { _id } = req.params

  console.log('RUMM')
  console.log(role)
  try {
    if (role === 'business') {
      const company = await Company.findOne({
        where: {
          email
        }
      })

      const foundTraining = await Student.findOne({
        where: {
          companyId: company._id
        },
        include: {
          model: Training,
          where: {
            _id
          }
        }
      })

      if (!foundTraining) return next(createError(404, 'Training not found'))

      console.log(foundTraining)
      // sendCert(res, foundTraining.certificate)
      res.json({
        message: 'ok'
      })
    } else if (role === 'student') {
      const student = await Student.findOne({ where: { email } })

      const foundTraining = await Student.findOne({
        where: {
          _id: student._id
        },
        include: {
          model: Training,
          where: {
            _id
          }
        }
      })

      sendCert(res, foundTraining.trainings[0].certificate)
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
}
