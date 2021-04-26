"use strict";

const { test } = require("tap");
const builder = require("../../app");

const TEST_SESSION = {
  sessionId: "asbc-242-fsdv-123",
  userId: "141412",
  created: "2021-04-19T10:02:40Z",
  request: {
    c: "true",
    dur: "30",
    uid: "asbc-242-fsdv-123",
    os: "ios",
    dt: "mobile",
    ss: "1920x1080",
    uip: "“192.168.1.20",
  },
  response: "<VAST XML>",
};

test("<GET /sessions, Should *Succeed*>", async (t) => {
  const app = builder();
  t.teardown(() => app.close());

  const res = await app.inject({
    method: "GET",
    url: "/api/v1/sessions",
  });
  // Tests
  const resArray = JSON.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.type(resArray, "Array");
  for (var i = 0; i < resArray.length; i++) {
    t.type(resArray[i], "object");
    t.equal(resArray[i].hasOwnProperty("sessionId"), true);
    t.equal(resArray[i].hasOwnProperty("userId"), true);
    t.equal(resArray[i].hasOwnProperty("created"), true);
  }
  t.end();
});

test("<GET /session/:sessionId,  Should *Succeed*>", async (t) => {
  t.plan(6);
  const app = builder();
  t.teardown(() => app.close());

  const sid = "asbc-242-fsdv-123";
  const res = await app.inject({
    method: "GET",
    url: "/api/v1/sessions/" + sid,
  });
  const resObj = JSON.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.type(resObj, "object");
  t.equal(resObj.hasOwnProperty("sessionId"), true);
  t.equal(resObj.hasOwnProperty("userId"), true);
  t.equal(resObj.hasOwnProperty("created"), true);
});

test("<DELETE /session/:sessionId, Should *Succeed*>", async (t) => {
  t.plan(3);
  const app = builder();
  t.teardown(() => app.close());

  const sid = "the-best-id";
  const res = await app.inject({
    method: "DELETE",
    url: "/api/v1/sessions/" + sid,
  });
  t.equal(res.statusCode, 204);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.same(JSON.parse(res.payload), {});
});

test("<GET /users/:userId,  Should *Succeed*>", async (t) => {
  const app = builder();
  t.teardown(() => app.close());

  const uid = "some-user-id";
  const res = await app.inject({
    method: "GET",
    url: "/api/v1/users/" + uid,
  });
  const resArray = JSON.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  //t.equal(JSON.parse(res.payload).length, 2)
  t.type(resArray, "Array");
  for (var i = 0; i < resArray.length; i++) {
    t.type(resArray[i], "object");
    t.equal(resArray[i].hasOwnProperty("sessionId"), true);
    t.equal(resArray[i].hasOwnProperty("userId"), true);
    t.equal(resArray[i].hasOwnProperty("created"), true);
  }
  t.end();
});

test("<GET /vast,  Should *Succeed*>", async (t) => {
  t.plan(2);
  const app = builder();
  t.teardown(() => app.close());

  const queryStr =
    "?c=YES&dur=90&uid=some-user-id&os=android&dt=samsung&ss=1000x200&uip=123.123.123.123";
  const res = await app.inject({
    method: "GET",
    url: "/api/v1/vast" + queryStr,
  });
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/xml; charset=utf-8");
});

/**
 * Make More Fail/Error Test Later.?
 */
// test("<GET /session/:sessionId, Should *Fail*>", async (t) => {
//   t.plan(3);
//   const app = builder();
//   t.teardown(() => app.close());

//   const sid = "the-best-id";
//   const res = await app.inject({
//     method: "GET",
//     url: "/api/v1/sessions/" + sid,
//   });
//   t.equal(res.statusCode, 404);
//   t.equal(res.headers["content-type"], "application/json; charset=utf-8");
//   t.same(JSON.parse(res.payload), {
//     message: `Session with ID ${sid} was not found`,
//   });
// });
