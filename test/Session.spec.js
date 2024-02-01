const Session = require("../api/Session");
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
