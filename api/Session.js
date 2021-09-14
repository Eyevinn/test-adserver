const ClientRequest = require("./ClientRequest.js");
const EventTracker = require("./EventTracker.js")
const User = require("./User.js");
const { VastBuilder } = require("../utils/vast-maker");
const { v4: uuid } = require("uuid");

class Session {
  // Public Fields
  sessionId;
  adBreakDuration;
  created;
  host;
  // Private Fields
  #clientRequest;
  #user;
  #vastXml;
  #eventTracker

  constructor(params) {
    // Take a time stamp.
    const timeStamp = new Date().toISOString();

<<<<<<< HEAD
<<<<<<< HEAD
    this.created = timeStamp;
    this.sessionId = uuid();
    this.host = params.host;
    this.#user = new User(params.uid || null);
=======
    this.created = queryParams || timeStamp;
    this.sessionId = queryParams.sessionId || uuid();
    this.#user = new User(queryParams.uid || null);
>>>>>>> a8bffbf (test: added unittest for session)
=======
    this.created = queryParams.created || timeStamp;
    this.sessionId = queryParams.sessionId || uuid();
<<<<<<< HEAD
    this.#user = new User(queryParams.userId || queryParams.uid || null);
>>>>>>> 73c22ee (rebase attempt cont.)
=======
    this.#user = new User(queryParams.userId || queryParams.uid || 'NOT FOUND');// null); // <-- because init.sql make a NOT NULL for uid
>>>>>>> b2f94e8 (feat: pagination on psql version)

    this.#clientRequest = new ClientRequest(params);
    this.#eventTracker = new EventTracker();

    // Create Vast object.
    const vastObj = VastBuilder({
      sessionId: this.sessionId,
      desiredDuration: params.dur || "0",
      adserverHostname: this.host,
      maxPodDuration: params.max || null,
      minPodDuration: params.min || null,
      podSize: params.ps || null
    });

    this.#vastXml = queryParams.response || vastObj.xml;
    this.adBreakDuration = queryParams.adBreakDuration || vastObj.duration;
  }

  getUser() {
    return this.#user.getUserId();
  }

  getVastXml() {
    return this.#vastXml;
  }

  getClientRequest() {
    return this.#clientRequest.getAllParameters();
  }

  getTrackedEvents() {
    return this.#eventTracker.getEvents();
  }

  AddTrackedEvent(eventObj) {
    this.#eventTracker.AddEvent(eventObj);
  }

}

module.exports = Session;
