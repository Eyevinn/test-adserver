const Session = require("../api/Session");
const chai = require("chai");
const should = chai.should();
const chaiMatchPattern = require("chai-match-pattern");
const _ = chaiMatchPattern.getLodashModule();

clientParams1 = {
  console: true,
  dur: "25",
  uid: "waitress-456",
  os: "ios",
  dt: "mobile",
  ss: "1920x1080",
  uip: "123.23.32.13",
};
clientParams2 = {
  console: true,
  dur: "25",
  uid: "charlie-123",
  os: "ios",
  dt: "mobile",
  ss: "1920x1080",
  uip: "193.123.32.153",
};

describe("SESSION CLASS", () => {
  it("should create unique session ids", (done) => {
    session1 = new Session(clientParams1);
    session2 = new Session(clientParams2);
    session1["sessionId"].should.not.equal(session2["sessionId"]);
    done();
  });
});
