class ClientRequest {
  // Private fields
  #consent;
  #requestedDuration;
  #userId;
  #operatingSystem;
  #deviceType;
  #screenSize;
  #clientIp;
  #userAgent;
  #acceptLanguage;
  #maxPodDuration;
  #minPodDuration;
  #podSize;
  #host;
  #rawParameters;

  constructor(params) {
    this.#consent = params.c || null;
    this.#requestedDuration = params.dur || null;
    this.#userId = params.uid || null;
    this.#operatingSystem = params.os || null;
    this.#deviceType = params.dt || null;
    this.#screenSize = params.ss || null;
    this.#clientIp = params.uip || null;
    this.#userAgent = params.userAgent || null;
    this.#acceptLanguage = params.acceptLang || null;
    this.#host = params.host || null;
    this.#maxPodDuration = params.max || null;
    this.#minPodDuration = params.min || null;
    this.#podSize = params.ps || null;
    // Store the raw query parameters (everything the client sent).
    this.#rawParameters = params;
  }

  getAllParameters() {
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
      UserAgent: this.#userAgent,
      AcceptLanguage: this.#acceptLanguage,
      Host: this.#host,
      MaxPodDuration: this.#maxPodDuration,
      MinPodDuration: this.#minPodDuration,
      PodSizeNoCreatives: this.#podSize
    };
    return properties;
  }
}

module.exports = ClientRequest;
