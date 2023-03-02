const ClientRequest = require("./ClientRequest.js");
const EventTracker = require("./EventTracker.js");
const User = require("./User.js");
const { VastBuilder } = require("../utils/vast-maker");
const { VmapBuilder } = require("../utils/vmap-maker");
const { v4: uuid } = require("uuid");
const constants = require("../utils/constants");

class Session {
  // Public Fields
  sessionId;
  adBreakDuration;
  created;
  host;
  responseFormat;
  // Private Fields
  #clientRequest;
  #user;
  #vastXml;
  #vmapXml;
  #eventTracker;

  constructor(params) {
    // Take a time stamp.
    const timeStamp = new Date().toISOString();

    this.created = timeStamp;
    this.sessionId = uuid();
    this.host = params.host;
    this.responseFormat = params.rf || constants.RESPONSE_FORMATS.VAST;
    this.#user = new User(params.uid || null);

    this.#clientRequest = new ClientRequest(params);
    this.#eventTracker = new EventTracker();

    if (this.responseFormat === constants.RESPONSE_FORMATS.VMAP) {
      // Create VMAP object. 
      let vmapObj;
      vmapObj = VmapBuilder({
        breakpoints: params.bp || "",
        preroll: params.prr === "true",
        postroll: params.por === "true",
        generalVastConfigs: {
          sessionId: this.sessionId,
          desiredDuration: params.dur || "0",
          adserverHostname: this.host,
          maxPodDuration: params.max || null,
          minPodDuration: params.min || null,
          podSize: params.ps || null,
          adCollection: params.coll || null,
        },
      });
      this.#vmapXml = vmapObj.xml;
      this.adBreakDuration = vmapObj.durations;
    } else {
      // Create VAST object.
      const vastObj = VastBuilder({
        sessionId: this.sessionId,
        desiredDuration: params.dur || "0",
        adserverHostname: this.host,
        maxPodDuration: params.max || null,
        minPodDuration: params.min || null,
        podSize: params.ps || null,
        adCollection: params.coll || null,
      });
      this.#vastXml = vastObj.xml;
      this.adBreakDuration = vastObj.duration;
    }
  }

  getUser() {
    return this.#user.getUserId();
  }

  getXmlResponse() {
    if (this.#vastXml) {
      return this.getVastXml();
    }
    if (this.#vmapXml) {
      return this.getVmapXml();
    }
    return "";
  }

  getVastXml() {
    return this.#vastXml;
  }

  getVmapXml() {
    return this.#vmapXml;
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
