const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const logFormat = printf(({ level, message, label, timestamp, sessionId }) => {
  return `${timestamp} [${label}${sessionId?"/"+sessionId:""}] ${level}: ${JSON.stringify(message)}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [new transports.Console({ level: process.env.DEBUG ? "debug" : "info" })]
});

module.exports = logger;
