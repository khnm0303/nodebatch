const fs = require('fs');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');


const logDir =  __dirname + '/../logs'
require('dotenv').config();

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`; // 날짜 로그레벨: 메세지
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat // log 출력 포맷
  ),
  transports: [
    new winstonDaily({
      level: 'debug', 
      datePattern: 'YYYY-MM-DD', 
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    /*
    new winston.transports.Console({
      level: 'info',
      format: combine(
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.colorize(),
              logFormat
            )
    })
  */
  ],
    exceptionHandlers: [
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});


if (process.env.NODE_ENV !== 'REAL') {
  logger.add(
    new winston.transports.Console({
     format: combine(
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.colorize(),
              logFormat
            )
    })
  );
}


module.exports = logger;

