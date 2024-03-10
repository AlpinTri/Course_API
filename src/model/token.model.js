const { DataTypes, ValidationError } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')
const validator = require('validator')

module.exports = sequelizeConfig.define('token', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    validate: {
      notEmpty: {
        args: true,
        msg: 'ID cannot be empty'
      },
      isJWT (value) {
        if (!validator.isJWT(value)) throw new ValidationError('ID must be JSON')
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'User ID cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'User ID cannot be null'
      }
    }
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Date field cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Date field cannot be null'
      },
      isDate: {
        args: true,
        msg: 'Date field must be a valid format'
      }
    }
  },
  isExpired: {
    type: DataTypes.VIRTUAL,
    get () {
      return this.expiredAt < Date.now()
    },
    set (value) {
      throw new Error('Do not try to set the `isExpired` value!')
    }
  }
}, {
  underscored: true,
  timestamps: true
})
