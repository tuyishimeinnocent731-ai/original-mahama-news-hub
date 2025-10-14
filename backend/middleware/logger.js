const winston = require('winston');
const morgan = require('morgan');

function initLogger() {
  const level = process.env.LOG_LEVEL || 'info';
  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
  });
  return logger;
}

function requestLogger(req, res, next) {
  const logger = initLogger();
  const format = process.env.MORGAN_FORMAT || 'combined';
  return morgan(format, {
    stream: { write: (message) => logger.info(message.trim()) }
  })(req, res, next);
}

module.exports = { initLogger, requestLogger };
