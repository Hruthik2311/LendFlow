const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'loan-recovery-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging methods
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

const logError = (error, req) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    path: req?.path,
    method: req?.method,
    body: req?.body,
    params: req?.params,
    query: req?.query,
    user: req?.user?.id
  });
};

const logDatabase = (message, data = {}) => {
  logger.info('Database Operation', {
    message,
    ...data
  });
};

const logSecurity = (event, data = {}) => {
  logger.warn('Security Event', {
    event,
    ...data
  });
};

const logBusiness = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    ...data
  });
};

module.exports = {
  logger,
  logRequest,
  logError,
  logDatabase,
  logSecurity,
  logBusiness
}; 