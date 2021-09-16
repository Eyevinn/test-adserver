
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
    sessionId: session.session_id,
    userId: session.user_id,
    created: session.created,
    adBreakDuration: session.ad_break_dur,
    clientRequest: JSON.parse(session.cli_req),
    response: session.response,
  };
  let result = JSON.parse(JSON.stringify(obj));
  return result;
}

module.exports = { SessionFormatter, SessionFormatter2 };
