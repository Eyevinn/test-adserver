// SMALLER UTILITY FUNCTIONS GO HERE


const CloudWatchLog = (type, host, logEntry) => {
  logEntry.type = type;
  logEntry.host = host;
  logEntry.time = (new Date()).toISOString();
  console.log(JSON.stringify(logEntry));
};


module.exports = { CloudWatchLog };
