function SessionFormatter(session) {
  // return a JSON
  let obj = {
    sessionId: session.sessionId,
    userId: session.getUser(),
    created: session.created,
    adBreakDuration: session.adBreakDuration,
    clientRequest: session.getClientRequest(),
    response: session.getVastXml().toString(),
  };
  let result = JSON.parse(JSON.stringify(obj));
  return result;
}

function SessionFormatter2(session) {
  // return a JSON
  let obj = {
    sessionId: session.sessionId,
    userId: session.getUser(),
    created: session.created,
    adBreakDuration: session.adBreakDuration,
    clientRequest: session.getClientRequest(),
    response: session.getVastXml().toString(),
  };
  let result = JSON.parse(JSON.stringify(obj));
  return result;
}

module.exports = { SessionFormatter, SessionFormatter2 };
