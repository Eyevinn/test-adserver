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
    this.#consent = params.c || null;
    this.#requestedDuration = params.dur || null;
    this.#userId = params.uid || null;
    this.#operatingSystem = params.os || null;
    this.#deviceType = params.dt || null;
    this.#screenSize = params.ss || null;
    this.#clientIp = params.uip || null;
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
