const DBAdapter = require("./db-adapter");

SESSION_STORE = {};

class MemoryDBAdapter extends DBAdapter {
  // Add Session obj to storage.
  async AddSessionToStorage(session) {
    SESSION_STORE[session.sessionId] = session;
    return 1;
  }

  // Get a List of running test sessions.
  async getAllSessions() {
    const sessionList = Object.values(SESSION_STORE);
    return sessionList;
  }

  // Get a List of running test sessions.
  async getSessionsByUserId(userId) {
    let sessionList = Object.values(SESSION_STORE).filter(
      (session) => userId == session.getUser()
    );
    // If empty, then we have no sessions.
    if (sessionList.length === 0) {
      return null;
    }
    return sessionList;
  }

  // Get information of a specific test session.
  async getSession(sessionId) {
    const session = SESSION_STORE[sessionId];
    return session;
  }

  async DeleteSession(sessionId) {
    delete SESSION_STORE[sessionId];
    return 1;
  }
}

const adapter = new MemoryDBAdapter();

module.exports = adapter;
