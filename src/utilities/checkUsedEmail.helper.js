/* eslint-disable no-async-promise-executor */
const Company = require('../model/company.model')
const User = require('../model/user.model')
const Trainer = require('../model/trainer.model')
const Student = require('../model/student.model')

module.exports = (email, role = undefined) => {
  return new Promise(async (resolve, reject) => {
    try {
      const foundCompany = await Company.findOne({
        where: {
          email
        }
      })

      const foundUser = await User.findOne({
        where: {
          email
        }
      })

      const foundTrainer = await Trainer.findOne({
        where: {
          email
        }
      })

      const foundStudent = await Student.findOne({
        where: {
          email
        }
      })

      // If the email has been used in one of tables and the role is equal to 'super admin'
      if (role === 'admin' && (foundCompany || foundStudent || foundTrainer || foundUser)) resolve(true)

      if (role === 'business' && foundCompany) resolve(true)

      if (role === 'student' && foundCompany) resolve(true)

      if (role === 'trainer' && foundCompany) resolve(true)

      if (!role && (foundCompany || foundStudent || foundTrainer || foundUser)) resolve(true)

      resolve(false)
    } catch (err) {
      reject(err)
    }
  })
}
