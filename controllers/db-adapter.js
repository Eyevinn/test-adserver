class DBAdapter {
  async AddSessionToStorage(session) {}

  async getAllSessions(opt) {}

  async getSessionsByUserId(userId) {}

  async getSession(sessionId) {}

  async DeleteSession(sessionId) {}

  async _Paginator(opt) {}
}

module.exports = DBAdapter;
