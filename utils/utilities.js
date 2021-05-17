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
  const limit = parseInt(pageLimit, 10) || 5;
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

// Function that allows you to specify how to return the data to the client
function Transform(session) {
  return {
    sessionId: session.sessionId,
    userId: session.getUser(),
    created: session.created,
    adBreakDuration: session.adBreakDuration,
    clientRequest: session.getClientRequest(),
    response: session.getVastXml().toString(),
  };
}
module.exports = { PaginateMemoryDB, Transform };
