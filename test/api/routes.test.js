"use strict";

const { test } = require("tap");
const builder = require("../../app");

let TEST_SESSION = {
    sessionId: "session-123",
    userId: "user-123",
    created: "time-stamp-here",
  };



test("<GET /sessions, Should *Succeed*>", async (t) => {
  t.plan(3);
  const app = builder();
  t.teardown(() => app.close());

  const res = await app.inject({
    method: "GET",
    url: "/api/v1/sessions",
  });
  // Tests
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.same(JSON.parse(res.payload), []);
});

test("<GET /session/:sessionId,  Should *Succeed*>", async (t) => {
  t.plan(3);
  const app = builder();
  t.teardown(() => app.close());

  const sid = "the-best-id";
  const res = await app.inject({
    method: "GET",
    url: "/api/v1/sessions/" + sid,
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.hasStrict(JSON.parse(res.payload), TEST_SESSION);
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
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.same(res.payload, 204);
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
    t.equal(resArray[i].hasOwnProperty("sessionId"), true);
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
  t.equal(res.statusCode, 201);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
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
