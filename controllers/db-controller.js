// :::API TO SPEAK TO SESSION STORAGE:::

SESSION_DB = {};

AddSessionToStorage = async (session) => {
  try {
    SESSION_DB[session.sessionId] = session; // Logic to be used here.
    return true;
  } catch (err) {
    throw err;
  }
};

// Get a list of running test sessions.
getAllSessions = async () => {
  try {
    const list = Object.values(SESSION_DB); // Logic to be used here.
    return list;
  } catch (err) {
    throw err;
  }
};

// Get a list of running test sessions.
getSessionsByUserId = async (userId) => {
  try {
    let usersSessions = Object.values(SESSION_DB).filter(
      (session) => userId == session.getUser()
    );
    // If empty, then we have no sessions.
    if (usersSessions.length === 0) {
      return null;
    }
    return usersSessions;
  } catch (err) {
    throw err;
  }
};

// Get information of a specific test session.
getSession = async (sessionId) => {
  try {
    const session = SESSION_DB[sessionId]; // Logic to be used here.
    // !! Might not need this if case.
    if (!session) {
      return null;
    }
    return session;
  } catch (err) {
    throw err;
  }
};

DeleteSession = async (sessionId) => {
  try {
    // Add and Use deletion-function Here.
    delete SESSION_DB[sessionId];
    //console.log(`I DEL session->: ${sessionId}`);
    return 1;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  AddSessionToStorage,
  getAllSessions,
  getSessionsByUserId,
  getSession,
  DeleteSession,
};
