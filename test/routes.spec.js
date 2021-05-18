const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const chaiMatchPattern = require("chai-match-pattern");
const _ = chaiMatchPattern.getLodashModule();

const SERVER_URL = process.env.APP_URL || "http://localhost:8080";

const PATTERN = {
  sessionId: _.isString,
  userId: _.isString,
  created: _.isString,
  adBreakDuration: _.isString,
  clientRequest: _.isObject,
  response: _.isString,
};

const UID = "TESTER-ID";
let SID;

chai.use(chaiHttp);
chai.use(chaiMatchPattern);

const queryStr = `?c=YES&dur=15&uid=${UID}&os=android&dt=samsung&ss=1000x200&uip=123.123.123.123`;

describe(" MY ROUTES", () => {
  // test 1
  describe("GET->VAST", () => {
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
          numOfSessions = res.body['data'].length;
          done();
        });
    });

    it("should have status code 200 and respond with XML", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vast" + queryStr)
        .end((err, res) => {
          if (err) {
            console.log(err);
            done(err);
          }
          res.should.have.status(200);
          res.body.should.be.a("object");
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
          res.body['data'].length.should.equal(numOfSessions + 1);
          done();
        });
    });

    let temp_sid;
    it("should still send xml when there is no 'dur' query", (done) => {
      chai
        .request(SERVER_URL)
        .get("/api/v1/vast?uid=dur-parameter-missing")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.be.a("object");
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
      reply.body.should.have.property('previousPage');
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
  describe("DEL->SESSIONS/:sessionId", () => {
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
});
