class ClientRequest {
  #consent;
  #requestedDuration;
  #userId;
  #operatingSystem;
  #deviceType;
  #screenSize;
  #clientIp;
  #leftovers;

  constructor(params) {
    this.#consent = params.c;
    this.#requestedDuration = params.dur;
    this.#userId = params.uid;
    this.#operatingSystem = params.os;
    this.#deviceType = params.dt;
    this.#screenSize = params.ss;
    this.#clientIp = params.uip;

    this.#leftovers = this._RemoveExpectedParams(params);
  }

  _RemoveExpectedParams(params) {
    const expected = ["c", "dur", "uid", "os", "dt", "ss", "uip"];
    for (const param in expected) {
      delete params[param];
    }
    return params;
  }

  getQueryParameters() {
    const expected = {
      Consent: this.#consent,
      RequestedDuration: this.#requestedDuration,
      UserId: this.#userId,
      OperatingSystem: this.#operatingSystem,
      DeviceType: this.#deviceType,
      ScreenSize: this.#screenSize,
      ClientIp: this.#clientIp,
    };
    const unexpected = this.#leftovers;
    const complete = { expected, unexpected };

    return expected;
  }
}

module.exports = ClientRequest;
