const { DataTypes } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')

module.exports = sequelizeConfig.define('trainer', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        args: true,
        msg: 'Name cannot be null'
      },
      notEmpty: {
        args: true,
        msg: 'Name cannot be empty'
      }
    }
  },
  gender: {
    type: DataTypes.ENUM,
    values: ['Male', 'Female'],
    allowNull: false,
    validate: {
      isIn: {
        args: [['Male', 'Female', 'Other']],
        msg: 'Gender not allowed'
      },
      notEmpty: {
        args: true,
        msg: 'Gender cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Gender cannot be null'
      }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Birth date cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Birth date cannot be null'
      }
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Phone number cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Phone number cannot be null'
      },
      isNumeric: {
        args: true,
        msg: 'Phone number is invalid numeric'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Address cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Address cannot be null'
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  underscored: true,
  timestamps: true
})
