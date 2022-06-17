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

const PATTERN = {
  sessionId: /.*/,
  userId: /.*/,
  created: /.*/,
  adBreakDuration: /.*/,
  clientRequest: {
    Consent: /.*/,
    RequestedDuration: /.*/,
    UserId: /.*/,
    OperatingSystem: /.*/,
    DeviceType: /.*/,
    ScreenSize: /.*/,
    ClientIp: /.*/,
  },
  response: /.*/,
};

// CREATE A SESSION
test("<GET /vast,  Should *Succeed*>", async (t) => {
  t.plan(4);
  const app = builder();
  const parser = require("fast-xml-parser");

  t.teardown(() => app.close());

  const queryStr =
    "?c=YES&dur=90&uid=some-user-id&os=android&dt=samsung&ss=1000x200&uip=123.123.123.123";

  const res = await app.inject({
    method: "GET",
    url: "/api/v1/vast" + queryStr,
  });
  // Perhaps good to have a Test for the VAST contents?
  const jsonObj = parser.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/xml; charset=utf-8");
  t.type(res.payload, "string");
  t.equal(jsonObj.hasOwnProperty("VAST"), true);
});

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
    t.match(resArray[i], PATTERN);
  }
  TEST_SESSION["sessionId"] = resArray[0].sessionId;
  t.end();
});

test("<GET /session/:sessionId,  Should *Succeed*>", async (t) => {
  t.plan(5);
  const app = builder();
  t.teardown(() => app.close());

  const sid = TEST_SESSION["sessionId"];
  const res = await app.inject({
    method: "GET",
    url: `/api/v1/sessions/${sid}`,
  });
  const resObj = JSON.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.type(resObj, "object");
  t.match(resObj, PATTERN);
  t.equal(resObj.sessionId, sid);
});

test("<DELETE /session/:sessionId, Should *Succeed*>", async (t) => {
  t.plan(4);
  const app = builder();
  t.teardown(() => app.close());

  const sid = TEST_SESSION["sessionId"];
  const res = await app.inject({
    method: "DELETE",
    url: `/api/v1/sessions/${sid}`,
  });
  t.equal(res.statusCode, 204);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.same(JSON.parse(res.payload), {});

  // Update this with REAL Fail test later.
  t.test("<GET /session/:sessionId,  Should *Fail*>", async (child) => {
    child.plan(4);
    const app = builder();
    child.teardown(() => app.close());

    const sid = TEST_SESSION["sessionId"];
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/sessions/${sid}`,
    });
    const resObj = JSON.parse(res.payload);
    child.equal(res.statusCode, 404);
    child.equal(res.headers["content-type"], "application/json; charset=utf-8");
    child.type(resObj, "object");
    child.match(resObj, { message: /Session with ID:/ });
  });
});

test("<GET /session/:sessionId/tracking,  Should *Succeed*>", async (t) => {
  t.plan(4);
  const app = builder();
  t.teardown(() => app.close());

  const sid = "asbc-242-fsdv-123";
  const queryStr = "?adId=20001&progress=25";
  const res = await app.inject({
    method: "GET",
    url: `/api/v1/sessions/${sid}/tracking${queryStr}`,
  });
  const resObj = JSON.parse(res.payload);
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.type(resObj, "object");
  t.match(resObj, { message: /Tracking Data Recieved/ });
});

// test("<GET /users/:userId,  Should *Succeed*>", async (t) => {
//   const app = builder();
//   t.teardown(() => app.close());

//   const uid = "some-user-id";
//   const res = await app.inject({
//     method: "GET",
//     url: "/api/v1/users/" + uid,
//   });

//   const resArray = JSON.parse(res.payload);
//   t.equal(res.statusCode, 200);
//   t.equal(res.headers["content-type"], "application/json; charset=utf-8");
//   t.type(resArray, "Array");
//   for (var i = 0; i < resArray.length; i++) {
//     t.type(resArray[i], "object");
//     t.match(resArray[i], PATTERN);
//     t.equal(resArray[i].userId, uid);
//   }
//   t.end();
// });

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

test("<GET /session/:sessionId/tracking,  Should *Fail: 400*>", async (t) => {
  t.plan(3);
  const app = builder();
  t.teardown(() => app.close());

  const queryStr = "?adId=123&";

  const res = await app.inject({
    method: "GET",
    url: "/api/v1/vast" + queryStr,
  });

  t.equal(res.statusCode, 400);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.match(JSON.parse(res.payload), {
    message: /querystring should have required property/,
  });
});

test("<GET /vast,  Should *Fail: 400*>", async (t) => {
  t.plan(3);
  const app = builder();
  t.teardown(() => app.close());

  const queryStr = "?c=YES&";

  const res = await app.inject({
    method: "GET",
    url: "/api/v1/vast" + queryStr,
  });

  t.equal(res.statusCode, 400);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.match(JSON.parse(res.payload), {
    message: /querystring should have required property/,
  });
});

// === CANNOT TEST THIS YET ===
// test("<GET /vast,  Should *Fail: 404*>", async (t) => {
//   t.plan(3);
//   const app = builder();
//   t.teardown(() => app.close());

//   const queryStr = "?c=YES&";

//   const res = await app.inject({
//     method: "GET",
//     url: "/api/v1/vast" + queryStr,
//   });

//   t.equal(res.statusCode, 404);
//   t.equal(res.headers["content-type"], "application/json; charset=utf-8");
//   t.match(JSON.parse(res.payload), {
//     message: /querystring should have required property/,
//   });
// });
