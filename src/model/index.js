const Company = require('./company.model')
const Course = require('./course.model')
const Schedule = require('./schedule.model')
const Student = require('./student.model')
const Trainer = require('./trainer.model')
const Training = require('./training.model')
const User = require('./user.model')
const Token = require('./token.model')

module.exports = () => {
  // Student & Company Relation
  Student.belongsTo(Company, {
    foreignKey: {
      name: 'company_id'
    },
    targetKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })
  Company.hasMany(Student, {
    foreignKey: {
      name: 'company_id'
    },
    sourceKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })

  // Training & Trainer Relation
  Training.belongsTo(Trainer, {
    foreignKey: {
      name: 'trainer_id'
    },
    targetKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })
  Trainer.hasMany(Training, {
    foreignKey: {
      name: 'trainer_id'
    },
    sourceKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })

  // Training & Student Relation
  Training.belongsTo(Student, {
    foreignKey: {
      name: 'student_id'
    },
    targetKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  Student.hasMany(Training, {
    foreignKey: {
      name: 'student_id'
    },
    sourceKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })

  // Training & Course Relation
  Training.belongsTo(Course, {
    foreignKey: {
      name: 'course_id'
    },
    targetKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })
  Course.hasMany(Training, {
    foreignKey: {
      name: 'course_id'
    },
    sourceKey: '_id',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  })

  // Schedule & Training Relation
  Schedule.belongsTo(Training, {
    foreignKey: {
      name: 'training_id'
    },
    targetKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  Training.hasMany(Schedule, {
    foreignKey: {
      name: 'training_id'
    },
    sourceKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })

  // Refresh Token & User Relation
  Token.belongsTo(User, {
    foreignKey: {
      name: 'user_id'
    },
    targetKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  User.hasMany(Token, {
    foreignKey: {
      name: 'user_id'
    },
    sourceKey: '_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
}
