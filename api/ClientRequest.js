class ClientRequest {
  // Private fields
  #consent;
  #requestedDuration;
  #userId;
  #operatingSystem;
  #deviceType;
  #screenSize;
  #clientIp;
  #rawParameters;

  constructor(params) {
    this.#consent = params.c;
    this.#requestedDuration = params.dur;
    this.#userId = params.uid;
    this.#operatingSystem = params.os;
    this.#deviceType = params.dt;
    this.#screenSize = params.ss;
    this.#clientIp = params.uip;
    // Store the raw query parameters (everything the client sent).
    this.#rawParameters = params;
  }

  getAllQueryParameters() {
    return this.#rawParameters;
  }

  getAllProperties() {
    const properties = {
      Consent: this.#consent,
      RequestedDuration: this.#requestedDuration,
      UserId: this.#userId,
      OperatingSystem: this.#operatingSystem,
      DeviceType: this.#deviceType,
      ScreenSize: this.#screenSize,
      ClientIp: this.#clientIp,
    };
    return properties;
  }
}

module.exports = ClientRequest;
