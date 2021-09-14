// SMALLER UTILITY FUNCTIONS GO HERE

/**
 *
 * @param {Array} knex_db - Knex DB instance, the one making the SQL queries.
 * @param {string} page - Desired page number.
 * @param {string} limit - Limit for amount of objects on each page.
 *
 * @example
 * knex_db = require("knex")({
              client: "pg",
              connection:process.env.APP_DB_URL
            });
  
 * page = '2'
 * limit = '5'
 *
 */
async function PaginatePsqlDB(knex_db, pageNum, pageLimit) {
  const limit = parseInt(pageLimit, 10) || 80;
  const page = parseInt(pageNum, 10) || 1;

  const startAt = (page - 1) * limit;

  try {
    const total = await knex_db("sessions_table").count("* as count").first(),
      // TODO: IMPLEMENT select where offset + limit
      rawSessions = await knex_db("sessions_table")
        .select()
        .orderBy("created", "desc")
        .offset(startAt)
        .limit(limit);

    return {
      previousPage: getPreviousPage(page),
      currentPage: page,
      nextPage: getNextPage(page, limit, total.count),
      totalPages: getTotalPages(limit, total.count),
      limit: limit,
      totalItems: total.count,
      data: rawSessions,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

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

function PsqlTransform(session) {
  // return a JSON
  let obj = {
    sessionId: session.session_id,
    userId: session.user_id,
    created: session.created,
    adBreakDuration: session.ad_break_dur,
    clientRequest: JSON.parse(session.cli_req),
    response: session.response,
  };
  let result = JSON.parse(JSON.stringify(obj));
  return result;
}

module.exports = { PaginateMemoryDB, Transform, PaginatePsqlDB, PsqlTransform };
