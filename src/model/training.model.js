const { DataTypes, ValidationError } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')

module.exports = sequelizeConfig.define('training', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: '_id'
  },
  trainerId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Trainer ID number cannot be empty'
      }
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Student ID number cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Student ID cannot be null'
      }
    }
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Course ID number cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Course ID cannot be null'
      }
    }
  },
  isGraduate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Graduate status cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Graduate status cannot be null'
      },
      isBoolean (value) {
        if (!(value === true) && !(value === false)) throw new ValidationError('Graduate status must be true or false')
      }
    }
  },
  isApproval: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  date: {
    type: DataTypes.DATEONLY,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Date cannot be empty'
      },
      isDate: {
        args: true,
        msg: 'Date field must be a valid format'
      }
    }
  },
  certificate: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  underscored: true,
  timestamps: true
})
