const controller = require("../controllers/api-controller");

const SessionSchema = () => ({
  description: "Sessions description",
  type: "object",
  properties: {
    id: { type: "string" },
    data: { type: "string" },
  },
});

const BadRequestSchema = () => ({
  description: "Bad request error description",
  type: "object",
  properties: {
    message: { type: "string", description: "Reason of the error" },
  },
});

const ForbiddenSchema = () => ({
  description:
    "Request is not allowed either because not authorized or resource not ready",
  type: "object",
  properties: {
    message: { type: "string", description: "Reason of refusal" },
  },
});

const schemas = {
  "GET/sessions": {
    description: "Gets all sessions",
    response: {
      200: {
        description: "On success returns an array of sessions",
        type: "array",
        item: SessionSchema(),
      },
    },
    security: [{ apiKey: [] }],
  },
  "GET/sessions/:sessionId": {
    description: "Gets the information on the specified session",
    params: {
      sessionId: {
        type: "string",
        description: "The id for the session.",
      },
    },
    response: {
      200: SessionSchema(),
      404: BadRequestSchema(),
    },
    security: [{ apiKey: [] }],
  },
};

module.exports = (fastify, opts, next) => {
  fastify.get(
    "/sessions/:sessionId",
    { schema: schemas["GET/sessions/:sessionId"] },
    async (req, reply) => {
      try {
        const sessionId = req.params.sessionId;
        const data = await controller.get(sessionId);
        if (!data) {
          reply.code(404).send({
            message: `Stream with ID ${request.params.sessionId} was not found`,
          });
        } else {
          reply.send(data);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions",
    { schema: schemas["GET/sessions"] },
    async (req, reply) => {
      try {
        const sessionList = await controller.getSessions();
        reply.send(sessionList);
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  next();
};
