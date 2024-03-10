const Course = require('../../model/course.model')
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')

module.exports.findAll = async (req, res, next) => {
  try {
    const foundCourses = await Course.findAll()

    if (!foundCourses.length) return next(createError(404, 'Course not found'))

    res
      .status(200)
      .json({
        success: true,
        message: 'Ok',
        data: foundCourses.map(course => course.dataValues)
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
        message: 'Ok',
        data: foundCourse.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.createOne = async (req, res, next) => {
  const { courseName, price, description, isActive } = req.body

  try {
    const courseData = {
      _id: uuidv4(),
      courseName,
      price,
      description,
      isActive
    }

    const newCourse = await Course.create(courseData)

    res
      .status(201)
      .json({
        success: true,
        message: 'Created',
        data: newCourse.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOne = async (req, res, next) => {
  const { courseName, price, description, isActive } = req.body
  const { _id } = req.params

  try {
    const foundCourse = await Course.findByPk(_id)

    if (!foundCourse) return next(createError(404, 'Course not found'))

    const courseData = {}

    if (courseName) courseData.courseName = courseName
    if (price) courseData.price = price
    if (description) courseData.description = description
    if (isActive === true || isActive === false) courseData.isActive = isActive

    foundCourse.set(courseData)
    await foundCourse.save()

    res
      .status(200)
      .json({
        success: true,
        message: 'Updated',
        data: foundCourse.dataValues
      })
  } catch (err) {
    next(err)
  }
}

module.exports.destroyOne = async (req, res, next) => {
  const { _id } = req.params

  try {
    const foundCourse = await Course.findByPk(_id)

    if (!foundCourse) return next(createError(404, 'Course not found'))

    await foundCourse.destroy()

    res
      .status(204)
      .send()
  } catch (err) {
    next(err)
  }
}
