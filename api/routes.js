const controller = require("../controllers/api-controller");
const fs = require("fs");
const { vastBuilder } = require("../utils/vast_maker");

/* === Dummy Session Object Creator Func === */
const dummy = (id) => {
  const sessionObj = {
    sessionId: "session-" + id,
    userId: "user-" + id,
    created: "time-stamp-here",
    request: {
      c: "true",
      dur: "30",
      uid: "session-" + id,
      os: "ios",
      dt: "mobile",
      ss: "1920x1080",
      uip: "“192.168.1.20",
    },
    response: "<VAST XML>",
  };
  return sessionObj;
};
/* ======= ========= ======= ========== ======= */

/**
 * - First Schemas
 * - Then the different Routes
 */

const vastResponseSchema = () => ({
  description: "On Success, a VAST file in XML format is Returned",
  type: "object",
  properties: {
    Ad: {
      type: "object",
      properties: {
        id: {
          type: "string",
          example: "ad-123",
          xml: { attribute: true },
        },
        InLine: {
          type: "object",
          properties: {
            AdTitle: { type: "string", example: "Movie Ad #6" },
            Impression: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  example: "imp-234",
                  xml: { attribute: true },
                },
                " ": {
                  type: "string",
                  example: "http://example.com/track/impression",
                  xml: { tags: false },
                },
              },
            },
            AdServingId: { type: "string", example: "mock-ad-server-id" },
            Creatives: {
              type: "object",
              properties: {
                Creative: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "cre-345",
                      xml: { attribute: true },
                    },
                    adid: {
                      type: "string",
                      example: "uaid-456",
                      xml: { attribute: true },
                    },
                    sequence: {
                      type: "string",
                      example: "1",
                      xml: { attribute: true },
                    },
                    Linear: {
                      type: "object",
                      properties: {
                        Duration: { type: "string", example: "00:00:30" },
                        TrackingEvents: {
                          type: "object",
                          properties: {
                            Tracking: {
                              type: "object",
                              properties: {
                                event: {
                                  type: "string",
                                  example: "complete",
                                  xml: { attribute: true },
                                },
                                " ": {
                                  type: "string",
                                  example:
                                    "[CDATA[http://example.com/api/v1/sessions/SID/tracking?adId=ADID&progress=100]]",
                                  xml: { wrapper: false },
                                },
                              },
                            },
                          },
                        },
                        MediaFiles: {
                          type: "object",
                          properties: {
                            MediaFile: {
                              type: "object",
                              properties: {
                                id: {
                                  type: "string",
                                  example: "media-567",
                                  xml: { attribute: true },
                                },
                                delivery: {
                                  type: "string",
                                  example: "progressive",
                                  xml: { attribute: true },
                                },
                                type: {
                                  type: "string",
                                  example: "video/mp4",
                                  xml: { attribute: true },
                                },
                                bitrate: {
                                  type: "string",
                                  example: "2000",
                                  xml: { attribute: true },
                                },
                                width: {
                                  type: "string",
                                  example: "1280",
                                  xml: { attribute: true },
                                },
                                height: {
                                  type: "string",
                                  example: "720",
                                  xml: { attribute: true },
                                },
                                codec: {
                                  type: "string",
                                  example: "H.264",
                                  xml: { attribute: true },
                                },
                                " ": {
                                  type: "string",
                                  example:
                                    "[CDATA[http://example.com/video-server/mortal-kombat-trailer.mp4]]",
                                  xml: { wrapper: false },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  xml: {
    name: "VAST",
  },
});

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
  example: {
    sessionId: "asbc-242-fsdv-123",
    userId: "141412",
    created: "2021-04-19T10:02:40Z",
    request: {
      c: "true",
      dur: "30",
      uid: "asbc-242-fsdv-123",
      os: "ios",
      dt: "mobile",
      ss: "1920x1080",
      uip: "“192.168.1.20",
    },
    response: "<VAST XML>",
  },
});

const BadRequestSchema = () => ({
  description: "Bad request error description",
  type: "object",
  properties: {
    message: { type: "string", description: "Reason of the error" },
  },
  example: {
    message: "Error due to reasons",
  },
  xml: {
    name: "xml",
  },
});

// Dictionary of Schemas.
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
        description: "The id for the session. ",
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
      sessionId: {
        type: "string",
        description: "The id for the session to delete",
      },
    },
    security: [{ apiKey: [] }],
    response: {
      204: {},
      404: BadRequestSchema(),
    },
  },
  // == NEW ==
  "GET/sessions/:sessionId/tracking": {
    description: "Gets the tracking data from client using the VAST",
    tags: ["sessions"],
    params: {
      sessionId: {
        type: "string",
        description: "The id for the session. ",
      },
    },
    query: {
      adId: { type: "string", description: "The ID for the Ad. " },
      progress: {
        type: "string",
        description: "The quartile reached on the ad. (ex: 75)",
      },
    },
    response: {
      200: {
        description: "A message acknowledging tracking data has been recieved.",
        type: "object",
        properties: {
          message: { type: "string", description: "Simple acknowledgment" },
        },
        example: {
          message: "Tracking Data Recieved",
        },
      },
      404: BadRequestSchema(),
    },
    security: [{ apiKey: [] }],
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
    description:
      "Send VAST response, then create a new session for given User ID",
    tags: ["vast"],
    produces: ["application/xml", "application/json"],
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
      200: vastResponseSchema(), // TODO, add XML example response Swagger schema.
      404: BadRequestSchema(),
    },
    security: [{ apiKey: [] }],
  },
}; // End of dict

// === SERVER ROUTES ===
module.exports = (fastify, opts, next) => {
  fastify.get(
    "/sessions",
    { schema: schemas["GET/sessions"] },
    async (req, reply) => {
      try {
        const sessionList = await controller.getSessionsList();
        // Send Array[{...},{...},{...}]
        //reply.send(sessionList);
        // This is a Fake list of sessions.
        const dummySessionList = [dummy("123"), dummy("456"), dummy("789")];
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
        const sessionObj = await controller.getSession(sessionId);
        if (!sessionObj) {
          reply.code(404).send({
            message: `Session with ID ${sessionId} was not found`,
          });
        } else {
          //**Temp Dummy response**.
          const dummyData = dummy("1");
          dummyData["sessionId"] = req.params.sessionId;
          reply.send(dummyData);
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

  // == NEW ==
  fastify.get(
    "/sessions/:sessionId/tracking",
    { schema: schemas["GET/sessions/:sessionId/tracking"] },
    async (req, reply) => {
      try {
        // Get path parameters and query parameters.
        const sessionId = req.params.sessionId;
        const adID = req.query.adId;
        const viewProgress = req.query.progress;
        console.log(
          `Cool! Session:${sessionId}, on AD:${adID}, has been watched to ${viewProgress}%`
        );
        // Check if session exists.
        const data = await controller.getSession(sessionId);
        if (!data) {
          reply.code(404).send({
            message: `Session with ID ${sessionId} was not found`,
          });
        } else {
          // Store tracking-data for the specific session... Somewhere
          // ---

          // Reply with 200 OK and acknowledgment message.
          reply.code(200).send({
            message: `Tracking Data Recieved [ADID:${adID}, PROGRESS:${viewProgress}]`,
          });
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message }); // ex. when a reply comes with wrong schema
      }
    }
  );

  // Users - routes
  fastify.get(
    "/users/:userId",
    { schema: schemas["GET/users/:userId"] },
    async (request, reply) => {
      try {
        // Get Session List via api-controller function.
        // And filter/map out sessions that don't have matching userID
        // ---

        // This is dummy reply made to kinda look legit.
        const dummyListOfSessions = [dummy("1"), dummy("2"), dummy("3")];
        dummyListOfSessions.map((sess) => {
          sess.userId = request.params.userId;
        });
        // Check if List is empty, If so assume no sessions with that user ID exists.
        if (!dummyListOfSessions) {
          reply.code(404).send({
            message: `Sessions with User-ID->: ${request.params.userId} were not found`,
          });
        } else {
          reply.code(200).send(dummyListOfSessions);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  /**
   * Planned to do two things:
   * 1) Send a VAST response.
   * 2) Create new Session with query params & time stamp.
   */
  // Vast - routes
  fastify.get(
    "/vast",
    { schema: schemas["GET/vast"] },
    async (request, reply) => {
      try {
        // Read Static VAST XML-file. maybe use 'package vast-xml' instead.
        //const vast_xml = fs.readFileSync("./test_vast.xml", "utf8");
        const vast_xml = vastBuilder({
          adserverHostname: request.hostname,
          sessionId: request.query.uid,
        });
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
          response: vast_xml,
        };

        if (!vast_xml) {
          reply.code(404).send({
            message: `Could not send VAST`,
          });
        } else {
          reply.header("Content-Type", "application/xml; charset=utf-8");
          //reply.code(200).send({ message: `cheers: ${request.query.c},${request.query.dur},${request.query.uid},${request.query.os}, ${request.query.dt},${request.query.ss},${request.query.uip} [END]`,});
          reply.code(200).send(vast_xml);
        }
      } catch (exc) {
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  next();
};
