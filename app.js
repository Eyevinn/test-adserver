// IMPORT MODULES
const Fastify = require("fastify");
const { version } = require("./package.json");

function builder() {
  const fastify = Fastify({ 
    ignoreTrailingSlash: true,
    ajv: {
      customOptions: {
        strict: false,
        validateFormats: false
      }
    }
  });
  // Homepage route? Replace later.
  fastify.get("/", async () => {
    return {
      Test: "This is working fine. Try Endpoint '/api/docs/static/index.html' ;-) ",
    };
  });

  // SET UP Swagger
  fastify.register(require("@fastify/swagger"), {
    routePrefix: "/api/docs",
    swagger: {
      info: {
        title: "Test Adserver API",
        description: "Lightweight test ad server to validate ad tracking.",
        version: version,
      },
      tags: [
        { name: "sessions", description: "Session related end-points" },
        { name: "users", description: "User related end-points" },
        { name: "vast", description: "VAST related end-points" },
        { name: "vmap", description: "VMAP related end-points" },
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

  fastify.register(require("@fastify/cors"), {});

  fastify.ready((err) => {
    if (err) throw err;
    fastify.swagger();
  });

  return fastify;
}

module.exports = builder;
