const winston = require('winston')

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
      filename: 'error.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.json()
      )
    }),
    new winston.transports.Console()
  ]
})

module.exports = logger
