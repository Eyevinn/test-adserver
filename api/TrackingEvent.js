class TrackingEvent {
  #eventList;

  constructor() {
    this.#eventList = [];
  }

  AddEvent(eventObj) {
    this.#eventList.push(eventObj);
  }

  getEvents() {
    return {
      events: this.#eventList,
    };
  }
}

module.exports = TrackingEvent;
