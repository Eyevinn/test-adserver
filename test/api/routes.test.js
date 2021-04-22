"use strict";

const { test } = require("tap");
const { build } = require("../helper");
const fastify = require("../../server").fastify;



test("GET/sessions Always Return Array", (t) => {
  t.plan(4);
  (async function () {
    console.warn("Gonna start listening.");
    fastify.listen(0, async (err) => {
      t.error(err);

      // HTTP injection
      const res = await fastify.inject({
        method: "GET",
        url: "/api/v1/sessions",
      });
      // Tests
      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(JSON.parse(res.payload), []);
      // tear down our app after we are done
      console.warn("Want to close app");
      t.teardown(() => fastify.close());
      process.exit(0);
    });
  })();
});

// test("GET/:sessionId Always Return Session Object", (t) => {
//   t.plan(4);
//   t.teardown(() => fastify.close());
//   (async function () {
//     console.warn("Gonna start listening.");

//       const res = await fastify.inject({
//         method: "GET",
//         url: "/api/v1/sessions/123",
//       });

//       t.equal(res.statusCode, 200);
//       t.equal(res.headers["content-type"], "application/json; charset=utf-8");
//       t.same(JSON.parse(res.payload), {});
//       // tear down our app after we are done
//       console.warn("Want to close app");
//       process.exit(0);
//   })();
// });

// test("routes is loaded", async (t) => {
//   t.plan(1);
//   const app = build(t);

//   const res = await app.inject({
//     method: "GET",
//     url: "/api/v1/sessions/123",
//   });
//   t.same(JSON.parse(res.payload), {});
// });
