class ClientRequest {
  // Private fields
  #consent;
  #requestedDuration;
  #userId;
  #operatingSystem;
  #deviceType;
  #screenSize;
  #clientIp;
  #additionalParams;

  constructor(params) {
    this.#consent = params.c;
    this.#requestedDuration = params.dur;
    this.#userId = params.uid;
    this.#operatingSystem = params.os;
    this.#deviceType = params.dt;
    this.#screenSize = params.ss;
    this.#clientIp = params.uip;
    // In case client sends more params than expected.
    this.#additionalParams = this.#getUnexpectedParams(params);
  }

  #getUnexpectedParams(params) {
    // All expected params.
    const expected = ["c", "dur", "uid", "os", "dt", "ss", "uip"];
    // A new collection of items:
    // 'params'-items where keys are not included in 'expected'.
    const unexpected = Object.keys(params)
      .filter((key) => !expected.includes(key))
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});
    // return remaining params (the unexpected ones).
    return unexpected;
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
    const unexpected = this.#additionalParams;
    // concatenate the 2 objects.
    const allParameters = Object.assign(expected, unexpected);

    return allParameters;
  }
}

module.exports = ClientRequest;
