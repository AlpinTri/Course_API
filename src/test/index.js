const req = require('supertest')
const app = require('../app')
const request = req(app)
const url = {
  auth: '/api/v1/auth',
  registration: '/api/v1/registration',
  company: '/api/v1/companies',
  course: '/api/v1/courses',
  schedule: '/api/v1/schedules',
  student: '/api/v1/student',
  trainer: '/api/v1/trainer',
  training: '/api/v1/trainings',
  user: '/api/v1/users'
}
const authorization = {
  accessToken: null,
  refreshToken: null
}

module.exports = { url, authorization, request }
