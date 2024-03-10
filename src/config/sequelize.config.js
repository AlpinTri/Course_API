const { Sequelize } = require('sequelize')
const logger = require('./logger.config')

const sequelizeConfig = new Sequelize({
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  dialect: 'postgres',
  logging: msg => logger.debug(msg)
})

module.exports = sequelizeConfig
