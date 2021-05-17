// IMPORT MODULES
const Fastify = require("fastify");

function builder() {
  const fastify = Fastify({ ignoreTrailingSlash: true });
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

  fastify.register(require("fastify-cors"), {});

  fastify.ready((err) => {
    if (err) throw err;
    fastify.swagger();
  });

  return fastify;
}

module.exports = builder;
