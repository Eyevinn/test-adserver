const fastify = require("fastify")({ ignoreTrailingSlash: true });

fastify.get("/", async () => {
  return {
    Test: "This is working fine",
  };
});

fastify.register(require("fastify-swagger"), {
  routePrefix: "/api/docs",
  swagger: {
    info: {
      title: "Test Adserver API",
      description: "This is for testing.",
      version: "0.1.0",
    },
    securityDefinitions: {
      apiKey: {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
      },
    },
  },
  exposeRoute: true,
});

fastify.register(require("./api/routes.js"), {
  prefix: "/api/v1",
});
fastify.ready((err) => {
  if (err) throw err;
  fastify.swagger();
});

// MAKE IT LISTEN
const start = async () => {
  try {
    const address = await fastify.listen(process.env.PORT || 8080);
    console.log(`Test Adserver API is listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
