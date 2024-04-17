// dependencies require
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')
const cors = require('cors')
const path = require('node:path')

// middleware require
const errorHandler = require('./middleware/errorHandler.middleware')
const notFoundHandler = require('./middleware/notFoundHandler.middleware')
const protect = require('./middleware/protected.middleware')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(helmet({
  crossOriginResourcePolicy: false
  // crossOriginResourcePolicy: { policy: 'same-site' }
  // crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({
  credentials: true,
  origin: 'https://eeba-114-142-172-20.ngrok-free.app'
}))
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://eeba-114-142-172-20.ngrok-free.app')
//   next()
// })

// app.all('*', cors({
//   credentials: true,
//   // origin: ['http://localhost:5173', 'https://eeba-114-142-172-20.ngrok-free.app']
//   origin: 'https://eeba-114-142-172-20.ngrok-free.app'
// }))

app.use(fileUpload({
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}))

app.use('/assets/images/c', express.static(path.join(__dirname, '../public/assets/courses')))
app.use('/assets/images/t', express.static(path.join(__dirname, '../public/assets/trainers')))
app.use('/cert', express.static(path.join(__dirname, '../public/assets/certificates')))

app.use('/api/v1/registrations', require('./routes/registration.routes'))
app.use('/api/v1/auth', require('./routes/auth.routes'))
app.use('/api/v1/courses', require('./routes/course.routes'))

app.use('/api/v1/students', protect, require('./routes/student.routes'))
app.use('/api/v1/companies', protect, require('./routes/company.routes'))
app.use('/api/v1/trainers', protect, require('./routes/trainer.routes'))
app.use('/api/v1/trainings', protect, require('./routes/training.routes'))
app.use('/api/v1/schedules', protect, require('./routes/schedule.routes'))
app.use('/api/v1/me', protect, require('./routes/profile.routes'))
app.use('/api/v1/dashboard', protect, require('./routes/dashboard.routes'))
app.use('/api/v1/users', require('./routes/user.routes'))

// error handler middleware
app.use(errorHandler)

// not found routes handler
app.use(notFoundHandler)

module.exports = app
