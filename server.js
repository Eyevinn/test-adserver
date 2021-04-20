const fastify = require("fastify")();

fastify.register(require("./api/v1/index"), { prefix: "api/v1/" });

fastify.get("/", async () => {
  return {
    Test: "This is working fine",
  };
});

// MAKE IT LISTEN
const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 8080);
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
