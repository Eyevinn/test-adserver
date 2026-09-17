const Session = require("../api/Session");
const constants = require("../utils/constants");
const chai = require("chai");
const should = chai.should();
const chaiMatchPattern = require("chai-match-pattern");
const _ = chaiMatchPattern.getLodashModule();

mockClientParams1 = {
  c: true,
  dur: "25",
  uid: "waitress-456",
  os: "ios",
  dt: "mobile",
  ss: "1920x1080",
  uip: "123.23.32.13",
  v: "3",
};
mockClientParams2 = {
  c: true,
  dur: "25",
  uid: "charlie-123",
  os: "ios",
  dt: "mobile",
  ss: "1920x1080",
  uip: "193.123.32.153",
};

mockTrackedEvent1 = {
  type: "start",
  issuedAt: "Today",
  onAd: "Ad_44",
  userAgent: "Mozilla",
};
mockTrackedEvent2 = {
  type: "midpoint",
  issuedAt: "Today",
  onAd: "Ad_44",
  userAgent: "Mozilla",
};
mockTrackedEvent3 = {
  type: "complete",
  issuedAt: "Today",
  onAd: "Ad_44",
  userAgent: "Mozilla",
};

describe("SESSION CLASS", () => {
  it("should create unique session ids", (done) => {
    session1 = new Session(mockClientParams1);
    session2 = new Session(mockClientParams2);
    session1["sessionId"].should.not.equal(session2["sessionId"]);
    done();
  });

  it("should store events", (done) => {
    session1 = new Session(mockClientParams1);
    session1.AddTrackedEvent(mockTrackedEvent1);
    session1.AddTrackedEvent(mockTrackedEvent2);
    session1.AddTrackedEvent(mockTrackedEvent3);

    const eventsObj = session1.getTrackedEvents();

    eventsObj.should.be.a("object");
    eventsObj["events"].should.be.a("array");
    eventsObj["events"].length.should.equal(3);
    done();
  });

  it("should return stored events", (done) => {
    session1 = new Session(mockClientParams1);
    session1.AddTrackedEvent(mockTrackedEvent1);
    session1.AddTrackedEvent(mockTrackedEvent2);
    session1.AddTrackedEvent(mockTrackedEvent3);

    const eventsObj = session1.getTrackedEvents();

    eventsObj.should.be.a("object");
    eventsObj["events"].should.be.a("array");

    eventsObj["events"][0].should.equal(mockTrackedEvent1);
    eventsObj["events"][1].should.equal(mockTrackedEvent2);
    eventsObj["events"][2].should.equal(mockTrackedEvent3);
    done();
  });


});

describe("PAUSE AD VAST", () => {
  const pauseParams = (extra) =>
    Object.assign(
      {
        uid: "pauser-1",
        host: "adserver.local",
        rf: constants.RESPONSE_FORMATS.PAUSE_AD,
      },
      extra || {}
    );

  it("defaults to the non-linear pause ad shape", (done) => {
    const session = new Session(pauseParams());
    const xml = session.getPauseAdVast();
    xml.should.be.a("string");
    xml.should.contain("<NonLinearAds>");
    xml.should.contain("<NonLinear");
    xml.should.not.contain("<Linear>");
    xml.should.not.contain("<MediaFile");
    done();
  });

  it("returns a linear image pause ad when format=linear", (done) => {
    const session = new Session(pauseParams({ format: "linear" }));
    const xml = session.getPauseAdVast();
    xml.should.be.a("string");
    // Linear creative with a Duration in HH:MM:SS.
    xml.should.contain("<Linear>");
    xml.should.match(/<Duration>(<!\[CDATA\[)?\d{2}:\d{2}:\d{2}/);
    // MediaFile carries the required attributes and an image MIME type.
    xml.should.match(/<MediaFile[^>]*\bdelivery="progressive"/);
    xml.should.match(/<MediaFile[^>]*\btype="image\/[a-z]+"/);
    xml.should.match(/<MediaFile[^>]*\bwidth="\d+"/);
    xml.should.match(/<MediaFile[^>]*\bheight="\d+"/);
    // Labelled as a deliberate non-conformant emulation.
    xml.should.contain("<CreativeExtension");
    xml.should.contain("emulation");
    // Not the non-linear shape.
    xml.should.not.contain("<NonLinear");
    done();
  });

  it("honours a custom duration for the linear pause ad", (done) => {
    const session = new Session(pauseParams({ format: "linear", dur: "00:00:30" }));
    const xml = session.getPauseAdVast();
    xml.should.contain("00:00:30");
    done();
  });
});
