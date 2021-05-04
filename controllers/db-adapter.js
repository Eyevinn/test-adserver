class DBAdapter {
  async AddSessionToStorage(session) {}

  async getAllSessions() {}

  async getSessionsByUserId(userId) {}

  async getSession(sessionId) {}

  async DeleteSession(sessionId) {}
}

module.exports = DBAdapter;
