const DBAdapter = require("./db-adapter");
const db = require("../db/psql-db");
const Session = require("../api/Session");

class PsqlDBAdapter extends DBAdapter {
  async AddSessionToStorage(session) {
    try {
      let db_reply = await db("sessions_table") // returns object or undefined
      .where("session_id", session.sessionId)
      .update({ tracked_events: JSON.stringify(session.getTrackedEvents())})
      if (!db_reply) {
        const [id] = await db("sessions_table")
        .insert(session.toJSON())
        .returning("id");
        return id;
      }
    } catch (err) {
      throw err;
    }
  }

  // Get a list of running test sessions.
  async getAllSessions(opt) {
    try {
      let pagi_db_reply = await this._Paginator({
        targetHost: opt.targetHost,
        database: db,
        pageNum: opt.page,
        pageLimit: opt.limit
      });
      // TURN IT BACK TO SESSION CLASS OBJECT
      pagi_db_reply.data = pagi_db_reply.data.map((session) => {
        let new_session = new Session();
        new_session.fromJSON(session);
        return new_session;
      });

      return pagi_db_reply;
    } catch (err) {
      throw err;
    }
  }

  // Get a list of running test sessions.
  async getSessionsByUserId(userId) {
    try {
      let db_reply = await db("sessions_table")
        .select()
        .where("user_id", userId);
      // TODO: decide if should respond with 404 || []
      if (db_reply.length === 0) {
        return null;
      }
      // TURN IT BACK TO SESSION CLASS OBJECT
      db_reply = db_reply.map((session) => {
        let new_session = new Session();
        new_session.fromJSON(session);
        return new_session;
      });
      return db_reply;
    } catch (err) {
      throw err;
    }
  }

  // Get information of a specific test session.
  async getSession(sessionId) {
    try {
      // Might return array if copies exists.
      let [db_reply] = await db("sessions_table") // returns object or undefined
        .select()
        .where("session_id", sessionId);
      if (!db_reply) {
        return null;
      }
      // TURN IT BACK TO SESSION CLASS OBJECT
      let new_session = new Session();
      new_session.fromJSON(db_reply);
      return new_session;
    } catch (err) {
      throw err;
    }
  }

  async DeleteSession(sessionId) {
    try {
      let db_reply = await db("sessions_table")
        .where("session_id", sessionId)
        .del();
      return db_reply; 
    } catch (err) {
      return err;
    }
  }

  async _Paginator(opt) {
    if (!opt || !opt.database) {
      return false;
    }
    const db = opt.database;
    const limit = parseInt(opt.pageLimit, 10) || 80;
    const page = parseInt(opt.pageNum, 10) || 1;
    const startAt = (page - 1) * limit;
    const getTotalPages = (limit, totalCount) => Math.ceil(totalCount / limit);
    const getNextPage = (page, limit, total) => (total / limit) > page ? page + 1 : null;
    const getPreviousPage = page => page <= 1 ? null : page - 1;

    try {
      const total = await db("sessions_table").count("* as count").first();
      const rawSessions = await db("sessions_table")
        .select()
        .where("host", opt.targetHost)
        .orderBy("created", "desc")
        .offset(startAt)
        .limit(limit);

      return {
        previousPage: getPreviousPage(page),
        currentPage: page,
        nextPage: getNextPage(page, limit, total.count),
        totalPages: getTotalPages(limit, total.count),
        limit: limit,
        totalItems: parseInt(total.count),
        data: rawSessions,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

module.exports = PsqlDBAdapter;
