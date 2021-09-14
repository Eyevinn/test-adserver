class EventTracker {
  #eventList;

  constructor(list) {
    if (!list) {
      this.#eventList = [];
    } else {
      this.#eventList = list;
    }
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

module.exports = EventTracker;
