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

    this.created = timeStamp;
    this.sessionId = uuid();
    this.host = params.host;
    this.#user = new User(params.uid || null);

    this.#clientRequest = new ClientRequest(params);
    this.#eventTracker = new EventTracker();

    // Create Vast object.
    const vastObj = VastBuilder({
      sessionId: this.sessionId,
      desiredDuration: params.dur || "0",
      adserverHostname:
        process.env.ADSERVER || `localhost:${process.env.PORT || "8080"}`,
      maxPodDuration: params.max || null,
      minPodDuration: params.min || null,
      podSize: params.ps || null
    });

    this.#vastXml = vastObj.xml;
    this.adBreakDuration = vastObj.duration;
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

  getTrackedEvents(){
    return this.#eventTracker.getEvents();
  }

  AddTrackedEvent(eventObj){
    this.#eventTracker.AddEvent(eventObj);
  }

}

module.exports = Session;
