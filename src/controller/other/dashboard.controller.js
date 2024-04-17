const Training = require('../../model/training.model')
const Trainer = require('../../model/trainer.model')
const Student = require('../../model/student.model')
const Course = require('../../model/course.model')
const Schedule = require('../../model/schedule.model')
const Company = require('../../model/company.model')
const { countData } = require('../../utilities/countGraphDashboard.util')

module.exports.dashboard = async (req, res, next) => {
  const { email, role } = req
  const data = {
    total: {}
  }

  try {
    if (role === 'admin') {
      const amountCompanies = await Company.findAll()
      const amountStudents = await Student.findAll()
      const amountTrainings = await Training.count()
      const amountCourse = await Course.count()
      const amountSchedules = await Schedule.count({
        where: {
          isDone: false
        }
      })
      const trainings = await Training.findAll()
      const students = await Student.findAll({
        where: {
          isApproval: false
        }
      })
      const companies = await Company.findAll({
        where: {
          isApproval: false
        }
      })

      data.graph = countData(trainings)
      data.total.customers = amountCompanies.length + amountStudents.length
      data.total.trainings = amountTrainings
      data.total.courses = amountCourse
      data.total.schedules = amountSchedules
      data.pendingCustomers = [...students, ...companies]
    } else {
      const foundTrainer = await Trainer.findOne({
        where: {
          email
        }
      })

      const trainings = await Training.findAll({
        where: {
          trainerId: foundTrainer._id
        },
        include: 'schedules'
      })
      console.log(trainings)

      data.pendingSchedules = []
      data.total.pendingSchedules = 0
      data.total.allSchedules = 0
      data.total.doneSchedules = 0
      data.total.trainings = trainings.length

      for (const training of trainings) {
        training.schedules.forEach(item => {
          data.total.allSchedules += 1
          if (item.isDone === false) {
            data.total.pendingSchedules += 1
            data.pendingSchedules.push(item)
          } else if (item.isDone === true) {
            data.total.doneSchedules += 1
          }
        })
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: 'Success',
        data
      })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
