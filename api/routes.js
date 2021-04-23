const controller = require("../controllers/api-controller");

/* === Dummy Session Object === */
const dummySessionObj = {
  sessionId: "session-123",
  userId: "user-123",
  created: "time-stamp-here",
  request: {
    c: "request.query.c",
    dur: "request.query.dur",
    uid: "request.query.uid",
    os: "request.query.os",
    dt: "request.query.dt",
    ss: "request.query.ss",
    uip: "request.query.uip",
  },
  response: "<VAST XML>",
};
/* === Dummy Session Object Creator Func === */
const dummy = (id) => {
  const sessionObj = {
    sessionId: "session-" + id,
    userId: "user-" + id,
    created: "time-stamp-here",
    request: {
      c: "Ok",
      dur: "30",
      uid: "abc-999",
      os: "iOS",
      dt: "iPhone",
      ss: "750x1334",
      uip: "123.123.123.123",
    },
    response: "<VAST XML>",
  };
  return sessionObj;
};
// Create fake list of sessions.
const dummySessionList = [dummy("123"), dummy("456"), dummy("789")];
/* ======= ========= ======= ========== ======= */

const SessionSchema = () => ({
  description: "Sessions description",
  type: "object",
  properties: {
    sessionId: { type: "string" },
    userId: { type: "string" },
    created: { type: "string" },
    request: {
      type: "object",
      properties: {
        c: { type: "string" },
        dur: { type: "string" },
        uid: { type: "string" },
        os: { type: "string" },
        dt: { type: "string" },
        ss: { type: "string" },
        uip: { type: "string" },
      },
    },
    response: { type: "string" },
  },
});

const BadRequestSchema = () => ({
  description: "Bad request error description",
  type: "object",
  properties: {
    message: { type: "string", description: "Reason of the error" },
  },
});

const schemas = {
  "GET/sessions": {
    description: "Gets all sessions",
    tags: ["sessions"],
    response: {
      200: {
        description: "On success returns an array of sessions",
        type: "array",
        items: SessionSchema(),
      },
    },
    security: [{ apiKey: [] }],
  },
  "GET/sessions/:sessionId": {
    description: "Gets the information on the specified session",
    tags: ["sessions"],
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
    tags: ["sessions"],
    params: {
      sessionId: { type: "string", description: "The id for the session to delete" },
    },
    security: [{ apiKey: [] }],
    response: {
      204: {},
      404: BadRequestSchema(),
    },
  },
  "GET/users/:userId": {
    description: "Get a list of test sessions for a specific userId",
    tags: ["users"],
    params: {
      userId: {
        type: "string",
        description: "The id for the user of sessions.",
      },
    },
    response: {
      200: {
        description: "On success returns an array of sessions",
        type: "array",
        items: SessionSchema(),
      },
      404: BadRequestSchema(),
    },
    security: [{ apiKey: [] }],
  },
  "GET/vast": {
    description: "Get a list of test sessions for a specific userId",
    tags: ["vast"],
    query: {
      c: {
        type: "string",
        description: "Consent check.",
      },
      dur: {
        type: "string",
        description: "Desired duration.",
      },
      uid: {
        type: "string",
        description: "User ID.",
      },
      os: {
        type: "string",
        description: "User OS.",
      },
      dt: {
        type: "string",
        description: "Device type.",
      },
      ss: {
        type: "string",
        description: "Screen size.",
      },
      uip: {
        type: "string",
        description: "Client IP.",
      },
    },
    response: {
      201: {
        description: "Status of Session creation attempt",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      404: BadRequestSchema(),
    },
    security: [{ apiKey: [] }],
  },
}; // End of dict

module.exports = (fastify, opts, next) => {
  fastify.get(
    "/sessions",
    { schema: schemas["GET/sessions"] },
    async (req, reply) => {
      try {
        const sessionList = await controller.getSessionsList();
        // Send Array[{...},{...},{...}]
        //reply.send(sessionList);
        reply.send(dummySessionList);
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
            message: `Session with ID ${sessionId} was not found`,
          });
        } else {
          // Temp Dummy response.
          dummySessionObj.sessionId = req.params.sessionId;
          reply.send(dummySessionObj);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message }); // ex. when a reply comes with wrong schema
      }
    }
  );

  fastify.delete(
    "/sessions/:sessionId",
    { schema: schemas["DELETE/sessions/:sessionId"] },
    async (request, reply) => {
      try {
        let sessionObj = await controller.getSession(request.params.sessionId);
        // Give dummy response object - so the session in question is "always found" atm.
        sessionObj = dummy("1337");
        if (!sessionObj) {
          reply.code(404).send({
            message: `Session with ID ${request.params.sessionId} was not found`,
          });
        } else {
          await controller.deleteSession(request.params.sessionId);
          reply.code(204).send({});
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  // Users - routes
  fastify.get(
    "/users/:userId",
    { schema: schemas["GET/users/:userId"] },
    async (request, reply) => {
      try {
        // GET via api-controller function. This is dummy reply
        const listOfTestSessions = [
          {
            sessionId: "session-888",
            userId: request.params.userId,
            created: "2021-04-23",
            request: {
              c: "Ok",
              dur: "30",
              uid: "abc-999",
              os: "iOS",
              dt: "iPhone",
              ss: "750x1334",
              uip: "123.123.123.123",
            },
            response: "<VAST XML>",
          },
          {
            sessionId: "session-999",
            userId: request.params.userId,
            created: "2021-04-23",
            request: {
              c: "Ok",
              dur: "30",
              uid: "abc-999",
              os: "iOS",
              dt: "iPhone",
              ss: "750x1334",
              uip: "123.123.123.123",
            },
            response: "<VAST XML>",
          },
        ];
        if (!listOfTestSessions) {
          reply.code(404).send({
            message: `User with ID->: ${request.params.userId} was not found`,
          });
        } else {
          // Do the REAL function call. HERE
          reply.code(200).send(listOfTestSessions);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  // Vast - routes
  fastify.get(
    "/vast",
    { schema: schemas["GET/vast"] },
    async (request, reply) => {
      try {
        // Create a new test session.
        const newDummySession = {
          sessionId: "session-XXX",
          userId: "user-XXX",
          created: "time-stamp-here",
          request: {
            c: request.query.c,
            dur: request.query.dur,
            uid: request.query.uid,
            os: request.query.os,
            dt: request.query.dt,
            ss: request.query.ss,
            uip: request.query.uip,
          },
          response: "<VAST XML>",
        };
        const success = true;
        if (!success) {
          reply.code(404).send({
            message: `Could not make a session`,
          });
        } else {
          reply
            .code(201)
            .send({ message: "Creation of New Session Succsessful." });
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  next();
};
