const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const chaiMatchPattern = require("chai-match-pattern");
const { default: fastify } = require("fastify");
const builder = require("../app");
const _ = chaiMatchPattern.getLodashModule();
const fetch = require("node-fetch");

let SERVER_URL = process.env.APP_URL || "http://localhost:8080";

const PATTERN = {
  sessionId: _.isString,
  userId: _.isString,
  created: _.isString,
  adBreakDuration: _.isString,
  clientRequest: _.isObject,
  response: _.isString,
};

const EVENT_PATTERN = { 
  type: _.isString,
  issuedAt: _.isString,
  onAd: _.isString,
  userAgent: _.isString
};

const UID = "TESTER-ID";
let SID;

chai.use(chaiHttp);
chai.use(chaiMatchPattern);

let serverIsUp = false;
let fastifyServer;

async function checkServer() {
  try {
    const response = await fetch(SERVER_URL);
    serverIsUp = true;
  } catch (err) {
    serverIsUp = false;
    fastifyServer = builder();
    await fastifyServer.listen({ port: 8080, host: '0.0.0.0' });
    SERVER_URL = "http://localhost:8080";
  }
}

// Initialize server before tests
before(async function() {
  this.timeout(5000);
  await checkServer();
});

const queryStr = `?c=1&dur=15&uid=${UID}&os=android&dt=samsung&ss=1000x200&uip=123.123.123.123`;

describe(" MY ROUTES", () => {
  after((done) => {
    if (!serverIsUp) {
      fastifyServer.close();
    }
    done();
  });
  // test 1
  describe("GET->VAST/VMAP", () => {
    let numOfSessions;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/json; charset=utf-8"
          );
          numOfSessions = res.body["data"].length;
          done();
        });
    });

    it("should have status code 200 and respond with VMAP-XML", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vmap" + queryStr + `&bp=60,120,180&prr=1&por=1`)
        .end((err, res) => {
          if (err) {
            console.error(err);
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/xml; charset=utf-8"
          );
          done();
        });
    });

    it("should have status code 200 and respond with VAST-XML", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vast" + queryStr)
        .end((err, res) => {
          if (err) {
            console.log(err);
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/xml; charset=utf-8"
          );
          done();
        });
    });

    it("should have created a new session and stored it", (done) => {
      chai;
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/json; charset=utf-8"
          );
          res.body["data"].length.should.equal(numOfSessions + 2);
          done();
        });
    });

    let temp_sid;
    it("should still send vast-xml when there is no 'dur' query", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vast?uid=dur-parameter-missing")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/xml; charset=utf-8"
          );
          done();
        });
    });
    it("should still send vmap-xml when there is no 'dur' query", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vmap?uid=dur-parameter-missing")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.should.have.header(
            "content-type",
            "application/xml; charset=utf-8"
          );
          done();
        });
    });
    it("should get session by user id", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/users/dur-parameter-missing")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          const session = res.body.pop();
          temp_sid = session.sessionId;
          done();
        });
    });
    it("should delete the session from db", (done) => {
      chai
        .request(SERVER_URL)
        .delete("/api/v1/sessions/" + temp_sid)
        .end((err, res) => {
          if (err) {
            console.log("Error! ->", err);
            done(err);
          }
          res.should.have.status(200);
          done();
        });
    });

    // Add new test block for /ads endpoint
    describe("GET->ADS", () => {
      const adsQueryStr = `?c=1&dur=15&uid=${UID}&os=android&dt=samsung&ss=1000x200&uip=123.123.123.123`;

      it("should return VAST-XML when rt=vast", (done) => {
        chai
          .request(SERVER_URL)
          .get("/api/v1/ads" + adsQueryStr + "&rt=vast")
          .end((err, res) => {
            if (err) {
              console.log(err);
              done(err);
            }
            res.should.have.status(200);
            res.should.have.header(
              "content-type",
              "application/xml; charset=utf-8"
            );
            done();
          });
      });

      it("should return VMAP-XML when rt=vmap with VMAP params", (done) => {
        chai
          .request(SERVER_URL)
          .get("/api/v1/ads" + adsQueryStr + "&rt=vmap&bp=60,120,180&prr=1&por=1")
          .end((err, res) => {
            if (err) {
              console.log(err);
              done(err);
            }
            res.should.have.status(200);
            res.should.have.header(
              "content-type",
              "application/xml; charset=utf-8"
            );
            done();
          });
      });


      it("should return 400 when rt parameter is invalid", (done) => {
        chai
          .request(SERVER_URL)
          .get("/api/v1/ads" + adsQueryStr + "&rt=invalid")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("message");
            res.body.message.should.equal("querystring/rt must be equal to one of the allowed values");
            done();
          });
      });

      it("should return VAST-XML when rt parameter is missing", (done) => {
        chai
          .request(SERVER_URL)
          .get("/api/v1/ads" + adsQueryStr)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.should.have.header(
              "content-type",
              "application/xml; charset=utf-8"
            );
            done();
          });
      });
    });
  });
  // test 2
  describe("GET->SESSIONS/", () => {
    let reply;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/")
        .end((err, res) => {
          if (err) {
            console.log(err);
            done(err);
          }
          reply = res;
          done();
        });
    });

    it("should have status code 200", () => {
      reply.should.have.status(200);
    });
    it("should be a pagination object", () => {
      reply.body.should.be.a("object");
      reply.body.should.have.property("previousPage");
      reply.body.should.have.property("currentPage");
      reply.body.should.have.property("nextPage");
      reply.body.should.have.property("totalPages");
      reply.body.should.have.property("limit");
      reply.body.should.have.property("totalItems");
      reply.body.should.have.property("data");
    });
    it("should have Array where items match PATTERN", () => {
      for (var i = 0; i < reply.body.data.length; i++) {
        reply.body.data[i].should.be.a("object");
        reply.body.data[i].should.matchPattern(PATTERN);
      }
    });
  });
  // test 3
  describe("GET->USERS/:userId", () => {
    let reply;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/users/" + UID)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should have status 200", () => {
      reply.should.have.status(200);
      // Extract SessionID
      const session = reply.body.pop();
      SID = session.sessionId;
    });

    it("should be an Array", () => {
      reply.body.should.be.a("array");
    });

    it("should have Array where items match PATTERN", () => {
      for (var i = 0; i < reply.body.length; i++) {
        reply.body[i].should.be.a("object");
        reply.body[i].should.matchPattern(PATTERN);
        reply.body[i].userId = UID;
      }
    });

    it("should 404 when user ID unknown", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/users/DONT_EXIST")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.matchPattern({ message: _.isString });
          done();
        });
    });
  });
  // test 4
  describe("GET->SESSIONS/:sessionId", () => {
    let reply;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/" + SID)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should have status 200", () => {
      reply.should.have.status(200);
    });
    it("should send an object", () => {
      reply.body.should.be.a("object");
    });
    it("should be content-type: application/json ", () => {
      reply.should.have.header(
        "content-type",
        "application/json; charset=utf-8"
      );
    });

    it("should contain all required fields", () => {
      reply.body.should.matchPattern(PATTERN);
    });
    it("should not be wierd", () => {
      reply.body["sessionId"].should.not.equal(null);
      reply.body["sessionId"].should.be.a("string");
    });

    it("should 404 when session ID unknown", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/DONT_EXIST")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.matchPattern({ message: _.isString });
          done();
        });
    });
  });
  // test 5
  // Disabled this test because it causes the following tests to fail. The correct solution
  // is to fix the next test to be independent of other tests.
  xdescribe("DEL->SESSIONS/:sessionId", () => {
    it("should delete the session from db", (done) => {
      chai
        .request(SERVER_URL)
        .delete("/api/v1/sessions/" + SID)
        .end((err, res) => {
          if (err) {
            console.log("Error! ->", err);
            done(err);
          }
          res.should.have.status(200);
          done();
        });
    });
    it("should return 404 becuase session is not in db", (done) => {
      chai
        .request(SERVER_URL)
        .delete("/api/v1/sessions/" + SID)
        .end((err, res) => {
          if (err) {
            console.log("Error! ->", err);
            done(err);
          }
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.matchPattern({ message: _.isString });
          done();
        });
    });
  });
  // test 6
  describe("GET->SESSIONS/:sessionId/tracking VAST v4.0", () => {
    let reply;
    before((done) => {
      const queryParams = "?adId=mockAd1&progress=100";
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/" + SID + "/tracking" + queryParams)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should have status 200", () => {
      reply.should.have.status(200);
    });
    it("should send an object", () => {
      reply.body.should.be.a("object");
    });
    it("should be content-type: application/json ", () => {
      reply.should.have.header(
        "content-type",
        "application/json; charset=utf-8"
      );
    });

    it("should return a confirmation message", () => {
      reply.body.should.matchPattern({message: _.isString});
    });
    it("should store an event object in given session", () => {

    });
  });
  describe("GET->SESSIONS/:sessionId/tracking VAST v2.0/v3.0", () => {
    let reply;
    before((done) => {
      const queryParams = "?adID=mockAd1&progress=100";
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/" + SID + "/tracking" + queryParams)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should have status 200", () => {
      reply.should.have.status(200);
    });
    it("should send an object", () => {
      reply.body.should.be.a("object");
    });
    it("should be content-type: application/json ", () => {
      reply.should.have.header(
        "content-type",
        "application/json; charset=utf-8"
      );
    });

    it("should return a confirmation message", () => {
      reply.body.should.matchPattern({message: _.isString});
    });
  });
  describe("GET->SESSIONS/DONT_EXIST/tracking", () => {
    it("should 404 when sessionID is unknown", (done) => {
      const queryParams = "?adId=mockAd1&progress=100";
      chai
      .request(SERVER_URL)
      .get("/api/v1/sessions/DONT_EXIST/tracking" + queryParams)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.should.have.status(404);
        res.body.should.be.a("object");
        res.body.should.matchPattern({ message: _.isString });
        done();
      });
    });
  });
  describe("GET->SESSIONS/:sessionId/tracking wrong adId param", () => {
    it("should 400 when adId/adID param is set to adid", (done) => {
      const queryParams = "?adid=mockAd1&progress=100";
      chai
      .request(SERVER_URL)
      .get("/api/v1/sessions/" + SID + "/tracking" + queryParams)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.matchPattern({ message: _.isString });
        done();
      });
    });
  });

  // test 7
  describe("GET->SESSIONS/:sessionId/events", () => {
    let reply;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/" + SID + "/events")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should have status 200", () => {
      reply.should.have.status(200);
    });
    it("should send an object", () => {
      reply.body.should.be.a("object");
    });
    it("should have object with array where items match EVENT_PATTERN", () => {
      let eventsList = reply.body['events'];
      for (var i = 0; i < eventsList; i++) {
        eventsList[i].should.be.a("object");
        eventsList[i].should.matchPattern(EVENT_PATTERN);
      }
    });
    it("should be content-type: application/json ", () => {
      reply.should.have.header(
        "content-type",
        "application/json; charset=utf-8"
      );
    });

    it("should 404 when session ID unknown", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/DONT_EXIST/events")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.matchPattern({ message: _.isString });
          done();
        });
    });
  });
  // test 8
  describe("GET->SESSIONS/:sessionId/vast", () => {
    let reply;
    before((done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/sessions/" + SID + "/vast")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          reply = res;
          done();
        });
    });
    it("should be content-type: application/xml ", () => {
      reply.should.have.header(
        "content-type",
        "application/xml;charset=UTF-8"
      );
    });    
  });
});
