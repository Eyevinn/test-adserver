const fastify = require("fastify")();

fastify.get("/", async () => {
  return {
    Test: "This is working fine",
  };
});

fastify.get("/sessions/:sessionId", async (req, reply) => {
  console.log(req.params.sessionId);
  return {
    Test: "This is working fine",
  };
});

const start = async () => {
  try {
    await fastify.listen(8080);
    console.log(
      `Test Adserver API is listening at http://${
        fastify.server.address().address
      }:${fastify.server.address().port}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
