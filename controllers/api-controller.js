// Get a list of running test sessions.
getSessions = async () => {
  try {
    const list = []; // Logic to be used here.
    console.log(`I GET List of running Test Sessions`);
    return list;
  } catch (err) {
    throw err;
  }
};

// Get information of a specific test session.
get = async (sessionId) => {
    try {
      const sessionInfo = {}; // Logic to be used here.
      console.log(`I GET information for test session->: ${sessionId}`);
      return sessionInfo;
    } catch (err) {
      throw err;
    }
  };


module.exports = {
  getSessions,
  get,
};
