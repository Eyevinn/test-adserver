const winston = require("winston");

const format = winston.format;
const consoleTransport = new winston.transports.Console();

const options = {
  format: format.combine(
    format.label({ label: "Client Requested Query Parameters" }),
    //format.colorize(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss", // for adding timestamp to log
    }),
    format.prettyPrint()
  ),
  transports: [consoleTransport],
};

const logger = new winston.createLogger(options); // initialising logger

module.exports = logger;
