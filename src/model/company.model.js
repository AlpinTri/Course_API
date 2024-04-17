const { DataTypes } = require('sequelize')
const sequelizeConfig = require('../config/sequelize.config')

module.exports = sequelizeConfig.define('company', {
  _id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: '_id'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
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
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        args: true,
        msg: 'Company\'s name cannot be null'
      },
      notEmpty: {
        args: true,
        msg: 'Company\'s name cannot be empty'
      }
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        args: true,
        msg: 'Phone number cannot be null'
      },
      notEmpty: {
        args: true,
        msg: 'Phone number cannot be empty'
      },
      isNumeric: {
        args: true,
        msg: 'Phone number is invalid numeric'
      }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Name cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Name cannot be null'
      }
    }
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Job title cannot be empty'
      },
      notNull: {
        args: true,
        msg: 'Job title cannot be null'
      }
    }
  },
  address: {
    type: DataTypes.STRING,
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
  isApproval: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true
})
