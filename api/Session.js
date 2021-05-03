const ClientRequest = require("./ClientRequest.js");
const User = require("./User.js");
const { VastBuilder } = require("../utils/vast-maker");

class Session {
  // Public Fields
  sessionId;
  adBreakDuration;
  created;
  // Private Fields
  #clientRequest;
  #user;
  #vastXml;

  constructor(queryParams) {
    // Take a time stamp.
    const timeStamp = new Date().toISOString();

    this.created = timeStamp;
    this.sessionId = this.#SessionIdGenerator(queryParams, timeStamp);
    this.#user = new User(queryParams.uid);
    this.#clientRequest = new ClientRequest(queryParams);

    // Create Vast object.
    const vastObj = VastBuilder({
      sessionId: this.sessionId,
      desiredDuration: queryParams.dur,
      adserverHostname: `${process.env.HOST || "127.0.0.1"}:${
        process.env.PORT || "8080"
      }`,
    });

    this.#vastXml = vastObj.xml;
    this.adBreakDuration = vastObj.duration;
  }

  #SessionIdGenerator(queryParams, timeStamp) {
    // ex output: my-uid20210430124444752
    const sessionId = `${queryParams.uid}${timeStamp.replace(/[-:TZ.]/g, "")}`;
    return sessionId;
  }

  getUser() {
    return this.#user.getUserId();
  }

  getVastXml() {
    return this.#vastXml;
  }

  getClientRequest() {
    return this.#clientRequest.getQueryParameters();
  }

  /*
  getAllInfo() {
    const payload = {
      sessionId: this.sessionId,
      userId: this.getUser(),
      created: this.created,
      adBreakDuration: this.adBreakDuration,
      clientRequest: this.getClientRequest(),
      response: this.getVastXml().toString(),
    };
    return payload;
  }
  */
}

module.exports = Session;
