const { DataTypes, ValidationError } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')
const bcrypt = require('bcrypt')

module.exports = sequelizeConfig.define('user', {
  _id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: '_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        args: true,
        msg: 'Email is invalid'
      },
      notNull: {
        args: true,
        msg: 'Email cannot be null'
      },
      notEmpty: {
        args: true,
        msg: 'Email cannot be empty'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set (value) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(value, salt)
      this.setDataValue('password', hash)
    },
    validate: {
      // customValidator (value) {
      //   if (value.length < 8) throw new ValidationError('Password must be at least 8 character')
      // }
    }
  },
  role: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: ['admin', 'trainer', 'business', 'student'],
    defaultValue: 'student',
    validate: {
      isIn: {
        args: [['admin', 'trainer', 'business', 'student']],
        msg: 'Role not allowed'
      },
      notEmpty: {
        args: true,
        msg: 'Role cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Role cannot be null'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Approval status cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Approval status cannot be null'
      },
      isBoolean (value) {
        if (!(value === true) && !(value === false)) throw new ValidationError('User status must be true or false')
      }
    }
  }
}, {
  underscored: true,
  timestamps: true
})
