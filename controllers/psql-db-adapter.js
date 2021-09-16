const DBAdapter = require("./db-adapter");
const { SQL2Session } = require("../utils/formatters");
const db = require("../db/psql-db");
<<<<<<< HEAD
const Session = require("../api/Session");
=======
>>>>>>> 2d133a4 (rebase:)

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
<<<<<<< HEAD
      let pagi_db_reply = await this._Paginator({
        targetHost: opt.targetHost,
=======
      //let db_reply = await db("sessions_table").select().orderBy('created', 'desc').offset(0).limit(1);
      // Can possibly return an empty array.

      // TODO: PAGINATION AND SORT
      let pagi_db_reply = await this._Paginator({
>>>>>>> 2d133a4 (rebase:)
        database: db,
        pageNum: opt.page,
        pageLimit: opt.limit
      });
<<<<<<< HEAD
=======

>>>>>>> 2d133a4 (rebase:)
      // TURN IT BACK TO SESSION CLASS OBJECT
      pagi_db_reply.data = pagi_db_reply.data.map((session) => {
<<<<<<< HEAD
        let new_session = new Session();
        new_session.fromJSON(session);
        return new_session;
      });

=======
        return this._FromDBToObject(session);
      });

      // (!) They are expecting a pagination object
      console.log(JSON.stringify(pagi_db_reply));
>>>>>>> 2d133a4 (rebase:)
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
<<<<<<< HEAD
        let new_session = new Session();
        new_session.fromJSON(session);
        return new_session;
=======
        return this._FromDBToObject(session);
>>>>>>> 2d133a4 (rebase:)
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
<<<<<<< HEAD
      let new_session = new Session();
      new_session.fromJSON(db_reply);
      return new_session;
=======
      return this._FromDBToObject(db_reply);
>>>>>>> 2d133a4 (rebase:)
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
<<<<<<< HEAD
        .where("host", opt.targetHost)
=======
>>>>>>> 2d133a4 (rebase:)
        .orderBy("created", "desc")
        .offset(startAt)
        .limit(limit);

      return {
        previousPage: getPreviousPage(page),
        currentPage: page,
        nextPage: getNextPage(page, limit, total.count),
        totalPages: getTotalPages(limit, total.count),
        limit: limit,
<<<<<<< HEAD
        totalItems: parseInt(total.count),
=======
        totalItems: total.count,
>>>>>>> 2d133a4 (rebase:)
        data: rawSessions,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
<<<<<<< HEAD
=======

  _FromDBToObject(session) {
    return {
      sessionId: session.session_id,
      userId: session.user_id,
      created: session.created,
      adBreakDuration: session.ad_break_dur,
      clientRequest: JSON.parse(session.cli_req),
      response: session.response,
    };
  }
>>>>>>> 2d133a4 (rebase:)
}

module.exports = PsqlDBAdapter;
