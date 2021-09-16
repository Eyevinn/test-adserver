class DBAdapter {
  async AddSessionToStorage(session) { }

  async getAllSessions(opt) { }

  async getSessionsByUserId(userId) { }

  async getSession(sessionId) { }
<<<<<<< HEAD

  async DeleteSession(sessionId) { }

  async _Paginator(opt) { }

=======

  async DeleteSession(sessionId) { }

  async _Paginator(opt) { }

  _FromDBToObject(session) { }
>>>>>>> 2d133a4 (rebase:)
}

module.exports = DBAdapter;
