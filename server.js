// IMPORT MODULES
const fastify = require("fastify")({ ignoreTrailingSlash: true });
// Read from local .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Homepage route? Replace later.
fastify.get("/", async () => {
  return {
    Test: "This is working fine",
  };
});

// SET UP Swagger
fastify.register(require("fastify-swagger"), {
  routePrefix: "/api/docs",
  swagger: {
    info: {
      title: "Test Adserver API",
      description: "This is for testing.",
      version: "0.1.0",
    },
    tags: [
      { name: "sessions", description: "Session related end-points" },
      { name: "users", description: "User related end-points" },
      { name: "vast", description: "Vast related end-points" },
    ],
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
    const address = await fastify.listen(
      process.env.PORT || 8080,

      process.env.HOST || "0.0.0.0"
    );

    console.log(`Test Adserver API is listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
