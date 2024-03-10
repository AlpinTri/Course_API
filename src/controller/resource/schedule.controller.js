const Training = require('../../model/training.model')
const Schedule = require('../../model/schedule.model')
const createError = require('http-errors')
const validator = require('validator')
const { v4: uuidv4 } = require('uuid')

module.exports.findAll = async (req, res, next) => {
  const { training } = req.query

  const condition = {}

  try {
    if (!validator.isEmpty(training)) condition.where = { trainingId: training }

    const foundSchedules = await Schedule.findAll(condition)

    if (!foundSchedules.length) return next(createError(404, 'Schedules not found'))

    const schedules = foundSchedules.map(sch => sch.dataValues)

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: schedules
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundSchedule = await Schedule.findByPk(_id)

    if (!foundSchedule) return next(createError(404, 'Schedule not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundSchedule.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { trainingId, date, time, location, isDone } = req.body

  try {
    const foundTraining = await Training.findByPk(trainingId)

    if (!foundTraining) return next(createError(404, 'Training not found'))

    const scheduleData = {
      _id: uuidv4(),
      trainingId,
      isDone: false,
      date,
      time,
      location
    }

    if (isDone === true || isDone === false) scheduleData.isDone = isDone

    const newSchedule = await Schedule.create(scheduleData)

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newSchedule.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { date, time, location, isDone } = req.body
  const { _id } = req.params

  try {
    const foundSchedule = await Schedule.findByPk(_id)

    if (!foundSchedule) return next(createError(404, 'Schedule not found'))

    const scheduleData = {}

    if (date) scheduleData.date = date
    if (time) scheduleData.time = time
    if (location) scheduleData.location = location
    if (isDone === true || isDone === false) scheduleData.isDone = isDone

    foundSchedule.set(scheduleData)
    await foundSchedule.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundSchedule.dataValues
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
