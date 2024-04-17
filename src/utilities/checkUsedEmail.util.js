/* eslint-disable no-async-promise-executor */
// Utils for check is email that pass to argument is used in other table
const Company = require('../model/company.model')
const User = require('../model/user.model')
const Trainer = require('../model/trainer.model')
const Student = require('../model/student.model')

module.exports = (email) => {
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

      if (foundCompany || foundStudent || foundTrainer || foundUser) return resolve(true)

      resolve(false)
    } catch (err) {
      reject(err.message)
    }
  })
}
