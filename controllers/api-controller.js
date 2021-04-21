// :::SESSION ROUTES:::
// Get a list of running test sessions.
getSessionsList = async () => {
  try {
    const list = []; // Logic to be used here.
    console.log(`I GET List of running Test Sessions`);
    return list;
  } catch (err) {
    throw err;
  }
};

// Get information of a specific test session.
getSession = async (sessionId) => {
  try {
    const sessionInfo = {}; // Logic to be used here.
    console.log(`I GET information for session->: ${sessionId}`);
    return sessionInfo;
  } catch (err) {
    throw err;
  }
};

deleteSession = async (sessionId) => {
  try {
    // Add and Use deletion-function Here.

    console.log(`I DEL session->: ${sessionId}`);
    return 1;
  } catch (err) {
    throw err;
  }
};

// :::USER ROUTES:::
// todo

// :::VAST ROUTES:::
// todo

module.exports = {
  getSessionsList,
  getSession,
  deleteSession,
};
