const app = require('./src/app')
const syncRelation = require('./src/model/index')
const sequelizeConfig = require('./src/config/sequelize.config')
const logger = require('./src/config/logger.config')

app.listen(process.env.NODE_PORT, () => {
  sequelizeConfig.sync({ force: false })
  syncRelation()
  logger.info(`Server is start at ${new Date()}`)
})
