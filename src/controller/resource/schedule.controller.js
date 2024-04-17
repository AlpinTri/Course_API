const Training = require('../../model/training.model')
const Schedule = require('../../model/schedule.model')
const createError = require('http-errors')
const validator = require('validator')
const { v4: uuidv4 } = require('uuid')
const sequelizeConfig = require('../../config/sequelize.config')
const { Op } = require('sequelize')
const Trainer = require('../../model/trainer.model')
const Course = require('../../model/course.model')
const Student = require('../../model/student.model')

module.exports.findAll = async (req, res, next) => {
  const { training, isDone, search } = req.query
  const { role, email } = req

  const condition = {
    where: {}
  }

  try {
    if (training !== undefined && validator.isUUID(training)) condition.where.trainingId = training
    if (['1', '0'].includes(isDone)) condition.where.isDone = isDone
    if (typeof search === 'string') condition.where.location = { [Op.iLike]: `%${search.trim()}%` }

    if (role === 'trainer') {
      const trainer = await Trainer.findOne({ where: { email } })

      condition.include = {
        model: Training,
        where: {
          trainerId: trainer._id
        }
      }
    }

    const foundSchedules = await Schedule.findAll(condition)

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundSchedules
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params
  const { training } = req.query
  const { email, role } = req
  const condition = {
    where: {
      _id,
      trainingId: training
    }
  }

  try {
    if (role === 'trainer') {
      const trainer = await Trainer.findOne({ where: { email } })

      condition.include = {
        model: Training,
        where: {
          trainerId: trainer._id
        },
        include: [
          {
            model: Course,
            attributes: ['courseName']
          },
          {
            model: Trainer,
            attributes: ['name']
          },
          {
            model: Student,
            attributes: ['name']
          }
        ]
      }
    }

    const foundSchedule = await Schedule.findOne(condition)

    if (!foundSchedule) return next(createError(404, 'Schedule not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundSchedule
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { date, time, location, trainingId } = req.body
  const { isSetAll } = req.query

  const t = await sequelizeConfig.transaction()

  try {
    const foundTraining = await Training.findByPk(trainingId, { transaction: t })

    if (!foundTraining) return next(createError(404, 'Training not found'))

    if (isSetAll === '1' && foundTraining.companyId) {
      const foundTrainings = await Training.findAll({
        where: {
          companyId: foundTraining.companyId
        }
      })

      for (const training of foundTrainings) {
        await training.createSchedule({
          _id: uuidv4(),
          trainingId: training._id,
          date,
          time,
          location
        }, { transaction: t })
      }
    } else {
      await foundTraining.createSchedule({
        _id: uuidv4(),
        trainingId,
        date,
        time,
        location
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

module.exports.updateOne = async (req, res, next) => {
  const { date, time, location, isDone } = req.body
  const { _id } = req.params
  const status = isDone !== undefined ? JSON.parse(isDone) : null

  try {
    const foundSchedule = await Schedule.findByPk(_id)

    if (!foundSchedule) return next(createError(404, 'Schedule not found'))

    if (req.role === 'admin') {
      if (date) foundSchedule.date = date
      if (time) foundSchedule.time = time
      if (location) foundSchedule.location = location
    }

    if (status === true || status === false) foundSchedule.isDone = status

    await foundSchedule.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundSchedule
      })
  } catch (err) {
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundSchedule = await Schedule.findByPk(_id)

    if (!foundSchedule) return next(createError(404, 'Schedule not found'))

    await foundSchedule.destroy()

    res
      .status(204)
      .send()
  } catch (err) {
    next(err)
  }
}
