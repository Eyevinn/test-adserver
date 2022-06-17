// SMALLER UTILITY FUNCTIONS GO HERE

/**
 *
 * @param {Array} list - Full list of objects.
 * @param {string} page - Desired page number.
 * @param {string} limit - Limit for amount of objects on each page.
 *
 * @example
 * list = [{...}, {...}, {...}]
 * page = '2'
 * limit = '5'
 *
 */

function PaginateMemoryDB(list = [], pageNum, pageLimit) {
  const limit = parseInt(pageLimit, 10) || 80;
  const page = parseInt(pageNum, 10) || 1;

  const startAt = (page - 1) * limit;
  const endAt = page * limit;

  const totalCount = list.length;

  let sessions = list.slice(startAt, endAt);

  return {
    previousPage: getPreviousPage(page),
    currentPage: page,
    nextPage: getNextPage(page, limit, totalCount),
    totalPages: getTotalPages(limit, totalCount),
    limit: limit,
    totalItems: totalCount,
    data: sessions,
  };
}

const getTotalPages = (limit, totalCount) => {
  return Math.ceil(totalCount / limit);
};

const getNextPage = (page, limit, total) => {
  if (total / limit > page) {
    return page + 1;
  }

  return null;
};

const getPreviousPage = (page) => {
  if (page <= 1) {
    return null;
  }
  return page - 1;
};

const CloudWatchLog = (type, host, logEntry) => {
  logEntry.type = type;
  logEntry.host = host;
  logEntry.time = new Date().toISOString();
  console.log(JSON.stringify(logEntry));
};

// Function that allows you to specify how to return the data to the client
function Transform(session) {
  return {
    sessionId: session.sessionId,
    userId: session.getUser(),
    created: session.created,
    adBreakDuration: session.adBreakDuration,
    clientRequest: session.getClientRequest(),
    response: session.getXmlResponse.toString(),
  };
}
const SecondsToTimeFormat = (seconds, includeFrame) => {
  const sec = parseInt(seconds, 10);

  let h = Math.floor(sec / 3600);
  let m = Math.floor((sec - h * 3600) / 60);
  let s = sec - h * 3600 - m * 60;

  if (h < 10) {
    h = "0" + h;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (s < 10) {
    s = "0" + s;
  }

  if (includeFrame && seconds.toString().includes(".")) {
    const timeSplit = seconds.toString().split(".");
    const frame = Array.isArray(timeSplit) ? timeSplit[1] : "0";
    return h + ":" + m + ":" + s + "." + frame.substr(0, 3);
  }
  return h + ":" + m + ":" + s;
};

module.exports = { PaginateMemoryDB, Transform, CloudWatchLog, SecondsToTimeFormat };
