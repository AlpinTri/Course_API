const Course = require('../../model/course.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const { save, destroy } = require('../../../public/handler')
const { Op } = require('sequelize')
const sequelizeConfig = require('../../config/sequelize.config')

module.exports.findAll = async (req, res, next) => {
  const { isActive, search } = req.query
  const condition = {
    where: {}
  }

  try {
    if (isActive === '1') condition.where.isActive = true
    if (isActive === '0') condition.where.isActive = false
    if (typeof search === 'string') condition.where.courseName = { [Op.iLike]: `%${search.trim()}%` }

    const foundCourses = await Course.findAll(condition)

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundCourses
      })
  } catch (err) {
    next(err)
  }
}

module.exports.findOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundCourse = await Course.findByPk(_id)

    if (!foundCourse) return next(createError(404, 'Course not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data: foundCourse
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { courseName, price, details, isActive } = req.body

  let imageName

  try {
    imageName = await save(req, 'courses')
  } catch (err) {
    console.error(err)
    return next(err)
  }

  try {
    const newCourse = await Course.create({
      _id: uuidv4(),
      courseName,
      price,
      details,
      isActive,
      banner: imageName
    })

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newCourse
      })
  } catch (err) {
    destroy(imageName, 'courses')
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { courseName, price, details, isActive } = req.body
  const { _id } = req.params
  let oldBanner = null

  const transaction = await sequelizeConfig.transaction()

  try {
    const foundCourse = await Course.findByPk(_id)

    if (!foundCourse) return next(createError(404, 'Course not found'))

    if (courseName) foundCourse.courseName = courseName
    if (price) foundCourse.price = price
    if (details) foundCourse.details = details
    if (typeof isActive === 'string' || typeof isActive === 'boolean') {
      const parse = JSON.parse(isActive)
      if (parse === true || parse === false) foundCourse.isActive = parse
    }

    await foundCourse.save({ transaction })

    if (req.files?.image) {
      oldBanner = foundCourse.banner
      const imageName = await save(req, 'courses')
      foundCourse.banner = imageName
      await foundCourse.save({ transaction })
      destroy(oldBanner, 'courses')
    }

    await transaction.commit()
    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundCourse
      })
  } catch (err) {
    await transaction.rollback()
    console.error(err)
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundCourse = await Course.findByPk(_id)

    if (!foundCourse) return next(createError(404, 'Course not found'))

    await foundCourse.destroy()

    destroy(foundCourse.banner, 'courses')

    res
      .status(204)
      .send()
  } catch (err) {
    next(err)
  }
}
