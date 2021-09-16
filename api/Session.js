const ClientRequest = require("./ClientRequest.js");
const EventTracker = require("./EventTracker.js")
const User = require("./User.js");
const { VastBuilder } = require("../utils/vast-maker");
const { v4: uuid } = require("uuid");
const DOMParser = require('xmldom').DOMParser;

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
    if (params) {
    // Take a time stamp.
    this.created = (new Date()).toISOString();
    this.sessionId = uuid();
    this.host = params.host || null;
    this.#user = new User(params.uid || "unknown");

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

    this.#vastXml = vastObj.xml;
    this.adBreakDuration = vastObj.duration;
    }
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

<<<<<<< HEAD
  toJSON() {
    return {
      session_id: this.sessionId,
      user_id: this.getUser(),
      ad_break_dur: this.adBreakDuration,
      created: this.created,
      host: this.host,
      cli_req: JSON.stringify(this.getClientRequest()),
      response: this.getVastXml().toString(),
      tracked_events: JSON.stringify(this.getTrackedEvents())
    }
  }
=======
  // toJSON(session) {
  //   return {
  //     session_id: session.sessionId,
  //     user_id: session.getUser(),
  //     ad_break_dur: session.adBreakDuration,
  //     created: session.created,
  //     host: session.host,
  //     cli_req: JSON.stringify(session.getClientRequest()),
  //     response: session.getVastXml().toString(),
  //     tracked_events: JSON.stringify(session.getTrackedEvents())
  //   }
  // }
>>>>>>> 54e3f1f (rebase:)

  // Initialize new Session from its JSON form.
  fromJSON(jsonObj) {
    this.created = jsonObj.created;
    this.sessionId = jsonObj.session_id;
    this.host = jsonObj.host;
    this.#user = new User(jsonObj.user_id || "unknown");
    this.#clientRequest = new ClientRequest(JSON.parse(jsonObj.cli_req));
<<<<<<< HEAD
    this.#eventTracker = new EventTracker(JSON.parse(jsonObj.tracked_events)['events']);
=======
    this.#eventTracker = new EventTracker(JSON.parse(jsonObj.tracked_events));
>>>>>>> 54e3f1f (rebase:)
    this.adBreakDuration = jsonObj.ad_break_dur;

    const parser = new DOMParser();
    const vastXml = parser.parseFromString(jsonObj.response, "text/xml");
    this.#vastXml = vastXml;
  }

  toObject() {
<<<<<<< HEAD
    return {
=======
    console.log(":::::LOGGING HERE:::")
    let item = {
>>>>>>> 54e3f1f (rebase:)
      sessionId: this.sessionId,
      userId: this.getUser(),
      created: this.created,
      adBreakDuration: this.adBreakDuration,
      clientRequest: this.getClientRequest(),
      response: this.getVastXml().toString(),
    };
<<<<<<< HEAD
=======
    return item;
>>>>>>> 54e3f1f (rebase:)
  }

}

module.exports = Session;