const controller = require("../controllers/api-controller");

const SessionSchema = () => ({
  description: "Sessions description",
  type: "object",
  properties: {
    sessionId: { type: "string" },
    userId: { type: "string" },
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
  "DELETE/sessions/:sessionId": {
    description: "Deletes the given session",
    params: {
      sessionId: { type: "string", description: "The id for the session" },
    },
    security: [{ apiKey: [] }],
    response: {
      204: {},
      404: BadRequestSchema(),
    },
  },
}; // End of dict

module.exports = (fastify, opts, next) => {
  fastify.get(
    "/sessions",
    { schema: schemas["GET/sessions"] },
    async (req, reply) => {
      try {
        const sessionList = await controller.getSessionsList();
        reply.send(sessionList);
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId",
    { schema: schemas["GET/sessions/:sessionId"] },
    async (req, reply) => {
      try {
        const sessionId = req.params.sessionId;
        const data = await controller.getSession(sessionId);
        if (!data) {
          reply.code(404).send({
            message: `Session with ID ${request.params.sessionId} was not found`,
          });
        } else {
          reply.send(data);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.delete(
    "/sessions/:sessionId",
    { schema: schemas["DELETE/sessions/:sessionId"] },
    async (request, reply) => {
      try {
        const sessionId = await controller.getSession(request.params.sessionId);
        if (!sessionId) {
          reply.code(404).send({
            message: `Session with ID ${request.params.sessionId} was not found`,
          });
        } else {
          await controller.deleteSession(sessionId);
          reply.send(204);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );
  next();
};
