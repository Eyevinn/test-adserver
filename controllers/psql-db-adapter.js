const DBAdapter = require("./db-adapter");
const { SQL2Session } = require("../utils/formatters");
const db = require("../db/psql-db");

class PsqlDBAdapter extends DBAdapter {
  async AddSessionToStorage(session) {
    try {
      const [id] = await db("sessions_table")
        .insert({
          session_id: session.sessionId,
          user_id: session.getUser(),
          ad_break_dur: session.adBreakDuration,
          created: session.created,
          cli_req: JSON.stringify(session.getClientRequest()),
          response: session.getVastXml().toString(),
        })
        .returning("id");
      return id;
    } catch (err) {
      throw err;
    }
  }

  // Get a list of running test sessions.
  async getAllSessions() {
    try {
      let db_reply = await db("sessions_table").select();
      // Can possibly return an empty array.
      return db_reply;
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
      console.log(db_reply);
      return SQL2Session(db_reply);
    } catch (err) {
      throw err;
    }
  }

  async DeleteSession(sessionId) {
    try {
      let db_reply = await db("sessions_table")
        .where("session_id", sessionId)
        .del();
      return db_reply; // 1
    } catch (err) {
      return err;
    }
  }
}

const adapter = new PsqlDBAdapter();

module.exports = adapter;
