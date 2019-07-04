const winston = require("winston");
const config = require('../config');
require('winston-mongodb');
require('winston-daily-rotate-file')
const moment = require('moment')

const fs = require('fs');
const logDir = 'log';


if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

let options = {
  infolog: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    db: config.mongodbUri,
    collection: 'infologs',
  },
  filelog: {
    level: 'debug',
    handleExceptions: true,
    timestamp: function(){
      return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    filename: 'log/logfile.log',
    datePattern: 'YYYY-MM-DD',

    json:false,
    maxsize: 1024*1024*100, //100mb
    maxFiles:10,
  }
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.MongoDB(options.infolog),
    new winston.transports.DailyRotateFile(options.filelog),
  ]
});

// create a stream object with a 'write' function that will be used by `morgan`. This stream is based on node.js stream https://nodejs.org/api/stream.html.
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports
    logger.info(message);
  }
};

logger.combinedFormat = function(err, req, res) {
  // Similar combined format in morgan
  // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
  return `${req.ip} - - [${moment().format('YYYY-MM-DD HH:mm:ss')}] \"${req.method} ${req.originalUrl} HTTP/${req.httpVersion}\" ${err.status ||
    500} - ${req.headers["user-agent"]}`;

};

module.exports = logger;
