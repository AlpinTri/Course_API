// dependencies require
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

// middleware require
const errorHandler = require('./middleware/errorHandler.middleware')
const notFoundHandler = require('./middleware/notFoundHandler.middleware')
const protect = require('./middleware/protected.middleware')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(fileUpload({
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}))

app.use('/api/v1/registrations', require('./routes/registration.routes'))
app.use('/api/v1/auth', require('./routes/auth.routes'))
app.use('/api/v1/courses', require('./routes/course.routes'))

app.use('/api/v1/students', protect, require('./routes/student.routes'))
app.use('/api/v1/companies', protect, require('./routes/company.routes'))
app.use('/api/v1/trainers', protect, require('./routes/trainer.routes'))
app.use('/api/v1/trainings', protect, require('./routes/training.routes'))
app.use('/api/v1/schedules', protect, require('./routes/schedule.routes'))
app.use('/api/v1/users', protect, require('./routes/user.routes'))

// error handler middleware
app.use(errorHandler)

// not found routes handler
app.use(notFoundHandler)

module.exports = app
