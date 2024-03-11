const Training = require('../../model/training.model')
const Trainer = require('../../model/trainer.model')
const createError = require('http-errors')
const Student = require('../../model/student.model')
const Course = require('../../model/course.model')
const User = require('../../model/user.model')
const { v4: uuidv4 } = require('uuid')
const pwGenerator = require('../../utilities/passwordGenerator.util')
const sendMail = require('../../utilities/emailSender.util')
const sequelizeConfig = require('../../config/sequelize.config')

module.exports.findAll = async (req, res, next) => {
  try {
    const foundTrainings = await Training.findAll()

    if (!foundTrainings.length) return next(createError(404, 'Trainings not found'))

    const trainings = foundTrainings.map(trn => trn.dataValues)

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: trainings
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundTraining = await Training.findByPk(_id)

    if (!foundTraining) return next(createError(404, 'Training not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundTraining.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { trainerId, studentId, courseId, isGraduate, isApproval, date } = req.body

  try {
    const foundTrainer = await Trainer.findByPk(trainerId)
    const foundStudent = await Student.findByPk(studentId)
    const foundCourse = await Course.findByPk(courseId)

    if (!foundStudent || !foundCourse) return next(createError(404, 'Course or Student not found'))

    const trainingData = {
      _id: uuidv4(),
      studentId,
      courseId,
      isGraduate,
      isApproval,
      date
    }

    if (foundTrainer) trainingData.trainerId = trainerId

    await Training.create(trainingData)

    res
      .status(201)
      .json({
        success: true,
        message: 'Created'
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { trainerId, studentId, courseId, isApproval, isGraduate, date } = req.body
  const { _id } = req.params

  const trainingData = {}

  const t = await sequelizeConfig.transaction()

  try {
    const password = pwGenerator()

    const foundTraining = await Training.findByPk(_id)

    if (!foundTraining) return next(createError(404, 'Training not found'))

    const stateBeforeUpdate = foundTraining.dataValues.isApproval

    if (trainerId) trainingData.trainerId = trainerId
    if (studentId) trainingData.studentId = studentId
    if (courseId) trainingData.courseId = courseId
    if (isApproval === true || isApproval === false) trainingData.isApproval = isApproval
    if (isGraduate) trainingData.isGraduate = isGraduate
    if (date) trainingData.date = date

    const user = await foundTraining.getStudent()

    if (stateBeforeUpdate === false && isApproval === true && !user.dataValues.companyId) {
      await User.create({
        _id: uuidv4(),
        email: user.dataValues.email,
        password,
        isActive: true
      }, { transaction: t })
    }

    foundTraining.set(trainingData)
    await foundTraining.save({ transaction: t })

    await t.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated'
      })

    sendMail(user.dataValues.email, password)
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundTraining = await Training.findByPk(_id)

    if (!foundTraining) return next(createError(404, 'Training not found'))

    await foundTraining.destroy()

    res
      .status(204)
      .send()
  } catch (err) {
    next(err)
  }
}
