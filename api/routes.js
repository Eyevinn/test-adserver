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

const BadRequestSchema = (exampleMsg) => ({
  description: "Bad request error description",
  type: "object",
  properties: {
    message: { type: "string", description: "Reason of the error" },
  },
  example: {
    message: exampleMsg,
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
        description: "The ID for the session. ",
      },
    },
    response: {
      200: SessionSchema(),
      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
    security: [{ apiKey: [] }],
  },
  "DELETE/sessions/:sessionId": {
    description: "Deletes the given session",
    tags: ["sessions"],
    params: {
      sessionId: {
        type: "string",
        description: "The ID for the session to delete",
      },
    },
    security: [{ apiKey: [] }],
    response: {
      204: {},
      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
  },
  // == NEW ==
  "GET/sessions/:sessionId/tracking": {
    description: "Gets the tracking data from client using the VAST",
    tags: ["sessions"],

    params: {
      sessionId: {
        type: "string",
        description: "The ID for the session. ",
      },
    },
    query: {
      type: "object",
      properties: {
        adId: {
          type: "string",
          description: "The ID for the Ad. ",
          example: "adid-123",
        },
        progress: {
          type: "string",
          description: "The watch-time percent reached on the Ad.",
          example: "75",
        },
      },
      required: ["adId", "progress"],
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
      400: {
        description: "Bad request error, Invalid request syntax",
        type: "object",
        properties: {
          message: { type: "string", description: "Reason of the error" },
        },
        example: {
          message: "querystring should have required property 'adId'",
        },
      },
      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/users/:userId": {
    description: "Get a list of test sessions for a specific userId",
    tags: ["users"],
    params: {
      userId: {
        type: "string",
        description: "The User ID a session should match.",
      },
    },
    response: {
      200: {
        description: "On success returns an array of sessions",
        type: "array",
        items: SessionSchema(),
      },
      404: BadRequestSchema("Sessions with User-ID: 'xxx-xxx' were not found"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/vast": {
    description:
      "Send a VAST response, then create a new session for the given User ID",
    tags: ["vast"],
    produces: ["application/xml", "application/json"],
    query: {
      type: "object",
      properties: {
        c: {
          type: "string",
          description: "Consent check.",
          example: "true",
        },
        dur: {
          type: "string",
          description: "Desired duration.",
          example: "60",
        },
        uid: {
          type: "string",
          description: "User ID.",
          example: "asbc-242-fsdv-123",
        },
        os: {
          type: "string",
          description: "User OS.",
          example: "ios",
        },
        dt: {
          type: "string",
          description: "Device type.",
          example: "mobile",
        },
        ss: {
          type: "string",
          description: "Screen size.",
          example: "1920x1080",
        },
        uip: {
          type: "string",
          description: "Client IP.",
          example: "192.168.1.200",
        },
      },
      required: ["c", "dur", "uid", "os", "dt", "ss", "uip"],
    },
    response: {
      200: vastResponseSchema(),
      400: {
        description: "Bad request error description",
        type: "object",
        properties: {
          message: { type: "string", description: "Reason of the error" },
        },
        example: {
          message: "querystring should have required property 'uid'",
        },
        xml: {
          name: "xml",
        },
      },
      404: BadRequestSchema("Error creating VAST response object"),
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
        reply.code(200).send(dummySessionList);
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
          // Send Session Object
          reply.send(dumm);
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

        // debugging
        console.log(
          `Cool! Session:${sessionId}, on AD:${adID}, has been watched to ${viewProgress}%`
        );

        // Check if session exists.
        const sessionObj = await controller.getSession(sessionId);
        if (!sessionObj) {
          reply.code(404).send({
            message: `Session with ID ${sessionId} was not found`,
          });
        } else {
          // "...it will output on the console log a
          // JSON object that is parse:able by Cloudwatch"
          // ^ This by getting the session object with session Id.
          // ---

          // Reply with 200 OK and acknowledgment message.
          reply.code(200).send({
            message: `Tracking Data Recieved [ ADID:${adID}, PROGRESS:${viewProgress} ]`,
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
        // And then map/filter out sessions that don't have matching userID
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
   * 1) Create and Send a VAST response.
   * 2) Create new Session with query params & time stamp.
   */
  // Vast - routes
  fastify.get(
    "/vast",
    { schema: schemas["GET/vast"] },
    async (request, reply) => {
      try {
        // Create a VAST.
        const vast_xml = vastBuilder({
          adserverHostname: `${process.env.HOST || "127.0.0.1"}:${
            process.env.PORT || "8080"
          }`,
          sessionId: request.query.uid, // Need to use some SessionId generator instead.
        });
        // Create a new test session. HERE like, let res = Session(opt);??
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
