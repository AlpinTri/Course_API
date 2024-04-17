const Training = require('../../model/training.model')
const Trainer = require('../../model/trainer.model')
const createError = require('http-errors')
const Student = require('../../model/student.model')
const Course = require('../../model/course.model')
const sequelizeConfig = require('../../config/sequelize.config')
const { Op } = require('sequelize')
const generateInvoice = require('../../utilities/transactionIdGenerator.util')
const { saveCert, destroy } = require('../../../public/handler')

module.exports.findAll = async (req, res, next) => {
  const { search } = req.query
  const condition = {
    student: {},
    trainer: {},
    course: {}
  }

  try {
    if (typeof search === 'string') {
      condition.student.name = { [Op.iLike]: `%${search.trim()}%` }
      condition.trainer.name = { [Op.iLike]: `%${search.trim()}%` }
      condition.course.courseName = { [Op.iLike]: `%${search.trim()}%` }
    }

    const foundTrainings = await Training.findAll({
      include: [
        {
          model: Trainer,
          attributes: ['name']
        },
        {
          model: Student,
          attributes: ['name']
        },
        {
          model: Course,
          attributes: ['courseName']
        }
      ]
    })

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundTrainings
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundTraining = await Training.findByPk(_id, {
      include: ['student', 'course', 'schedules', 'trainer']
    })

    if (!foundTraining) return next(createError(404, 'Training not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundTraining
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { trainerId, studentId, courseId } = req.body

  try {
    const now = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' }).substring(0, 10).split('/').reverse().join('-')
    const foundStudent = await Student.findByPk(studentId)
    const foundCourse = await Course.findByPk(courseId)

    if (!foundStudent) return next(createError(404, 'Student not found'))
    if (!foundCourse) return next(createError(404, 'Course not found'))

    const trainingData = {
      _id: generateInvoice(),
      studentId,
      courseId,
      date: now
    }

    if (trainerId !== undefined) {
      const foundTrainer = await Trainer.findByPk(trainerId)
      if (foundTrainer) trainingData.trainerId = trainerId
    }

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
  const { trainerId, studentId, courseId, isApproval, isGraduate } = req.body
  const { _id } = req.params
  const status = {
    isGraduate: isGraduate !== undefined ? JSON.parse(isGraduate) : '',
    isApproval: isApproval !== undefined ? JSON.parse(isApproval) : ''
  }

  const t = await sequelizeConfig.transaction()

  try {
    const foundTraining = await Training.findByPk(_id)

    if (!foundTraining) return next(createError(404, 'Training not found'))

    if (trainerId) foundTraining.trainerId = trainerId
    if (studentId) foundTraining.studentId = studentId
    if (courseId) foundTraining.courseId = courseId
    if (status.isApproval === true || status.isApproval === false || status.isApproval === null) foundTraining.isApproval = status.isApproval
    if (status.isGraduate === true || status.isGraduate === false) foundTraining.isGraduate = status.isGraduate

    await foundTraining.save({ transaction: t })

    await t.commit()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated'
      })
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

module.exports.setCert = async (req, res, next) => {
  const { _id } = req.params
  let oldFile = null

  try {
    const foundTraining = await Training.findOne({ where: { _id } })

    if (!foundTraining) return next(createError(404, 'Training not found'))

    if (foundTraining.certificate) oldFile = foundTraining.certificate

    const filename = await saveCert(req)

    foundTraining.certificate = filename
    foundTraining.isGraduate = true

    await foundTraining.save()

    if (oldFile) destroy(oldFile, 'certificates')

    res
      .status(200)
      .json({
        success: true,
        message: 'Success'
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
