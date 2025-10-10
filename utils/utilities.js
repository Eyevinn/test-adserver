// SMALLER UTILITY FUNCTIONS GO HERE

const { v4: uuid } = require("uuid");
const logger = require("./logger.js");
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

// IM MEMORY CACHE, containing specified ad list for each tenant.
const TENANT_CACHE = {};

async function UpdateCache(tenant, feedURI, cache) {
  // Start Over Clean
  cache[tenant] = {}
  try {
    const response = await fetch(feedURI);
    const xml = await response.text();
    const parser = new XMLParser();
    const json = parser.parse(xml);
    let feedEntry = json.feed.entry;

    // Turn to array if only one Ad was in the feed
    if (!Array.isArray(feedEntry)) {
      feedEntry = [feedEntry]
    }

    // Transform feed entry into expected Ad Objects, with fallback values.
    feedEntry = feedEntry.map(entry => (
      {
        universalId: entry.universalId || uuid(),
        id: entry.id || "streamingtech_ad",
        url: Array.isArray(entry.link) ? entry.link : [entry.link || "https://testcontent.eyevinn.technology/ads/probably-the-best-10s.mp4"],
        duration: entry.duration || "00:00:10",
        bitrate: entry.bitrate || "17700",
        width: entry.width || "1920",
        height: entry.height || "1080",
        codec: entry.codec || "H.264"
      }
    ));
    // Add new values.
    cache[tenant].cachedAdList = feedEntry;
    cache[tenant].lastUpdated = Date.now();
    return;
  } catch (err) {
    delete cache[tenant]
    logger.error(err.message, { label: "Error in UpdateCache()" });
    return;
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
    response: session.getXmlResponse().toString(),
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

module.exports = { PaginateMemoryDB, Transform, CloudWatchLog, SecondsToTimeFormat, TENANT_CACHE, UpdateCache };
