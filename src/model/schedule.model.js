const { DataTypes, ValidationError } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')

module.exports = sequelizeConfig.define('schedule', {
  _id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: '_id'
  },
  trainingId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Training ID cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Training ID cannot be null'
      }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Date cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Date cannot be null'
      },
      isDate: {
        args: true,
        msg: 'Date field must be a valid format'
      }
    }
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Time cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Time cannot be null'
      }
    }
  },
  location: {
    type: DataTypes.TEXT,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Location cannot be empty'
      }
    }
  },
  isDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Schedule status cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Schedule status cannot be null'
      },
      isBoolean (value) {
        if (!(value === true) && !(value === false)) throw new ValidationError('Schedule status must be true or false')
      }
    }
  }
}, {
  underscored: true,
  timestamps: true
})
