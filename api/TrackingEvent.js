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
      event: this.#eventList,
    };
  }
}

module.exports = TrackingEvent;
