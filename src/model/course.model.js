const { DataTypes, ValidationError } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')
const validator = require('validator')

module.exports = sequelizeConfig.define('course', {
  _id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: '_id'
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Course name cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Course name cannot be null'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Price cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Price cannot be null'
      },
      isNumeric: {
        args: true,
        msg: 'Price is invalid numeric'
      }
    }
  },
  description: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Descriptions cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Descriptions cannot be null'
      },
      isJSON (value) {
        if (!validator.isJSON(value)) throw new ValidationError('Description must be JSON')
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Course status cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Course status cannot be null'
      },
      isBoolean (value) {
        if (!(value === true) && !(value === false)) throw new ValidationError('Course status must be true or false')
      }
    }
  }
}, {
  underscored: true,
  timestamps: true
})
