const Session = require("../api/Session");
const DBAdapter = require("./db-adapter");

SESSION_STORE = {};

class MemoryDBAdapter extends DBAdapter {
  // Add Session obj to storage.
  async AddSessionToStorage(session) {
    SESSION_STORE[session.sessionId] = session;
    return 1;
  }

  // Get a List of running test sessions.
  async getAllSessions(opt) {
    let sessionList = Object.values(SESSION_STORE);

    // Filter session list on host field.
    if (opt && opt.targetHost && opt.targetHost != "") {
      sessionList = sessionList.filter( session => session.host.localeCompare(opt.targetHost) === 0);
    }

    // Sort by newest first
    sessionList.sort((a, b) => {
      const dateA = new Date(a["created"]);
      const dateB = new Date(b["created"]);
      return dateB - dateA;
    });

    // Assuming We are to always respond with a pagination.
    // Paginate w/ query params, deafult values used otherwise.
    sessionList = await this._Paginator({ list: sessionList, pageNum: opt.page, pageLimit: opt.limit });
    if (!sessionList) {
      return {};
    }
    // Return Pagination Object
    return sessionList;
  }

  // Get a List of running test sessions.
  async getSessionsByUserId(userId) {
    let sessionList = await Object.values(SESSION_STORE).filter(
      (session) => userId == session.getUser()
    );
    // If empty, then we have no sessions.
    if (sessionList.length === 0) {
      return null;
    }
    sessionList.map((session) => {
      return this._FromDBToObject(session);
    });
    return sessionList;
  }

  // Get information of a specific test session.
  async getSession(sessionId) {
    const session = SESSION_STORE[sessionId];
    if (!session) {
      return session;
    }
    return session;
  }

  async DeleteSession(sessionId) {
    delete SESSION_STORE[sessionId];
    return 1;
  }

  async _Paginator(opt) {
    if (!opt) {
      return false;
    }
    let list = opt.list || [];
    const limit = parseInt(opt.pageLimit, 10) || 80;
    const page = parseInt(opt.pageNum, 10) || 1;
    const startAt = (page - 1) * limit;
    const endAt = page * limit;
    const totalCount = list.length;
    const getTotalPages = (limit, totalCount) => Math.ceil(totalCount / limit);
    const getNextPage = (page, limit, total) => (total / limit) > page ? page + 1 : null;
    const getPreviousPage = page => page <= 1 ? null : page - 1;
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
}

module.exports = MemoryDBAdapter;
