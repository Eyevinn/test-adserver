const DBAdapter = require("../controllers/memory-db-adapter");
const logger = require("../utils/logger.js");
const { PaginateMemoryDB, Transform } = require("../utils/utilities");
const Session = require("./Session.js");

/**
 * - First Schemas
 * - Then the different Routes
 */

const EMPTY_VAST_MSG = `.--------------- WARNING ---------------.
|     Empty VAST-XML Sent To Client     |
'---------------------------------------'\n`;
const EMPTY_VAST_STR = `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<VAST version=\"4.0\"/>`;

const VastResponseSchema = () => ({
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
    adBreakDuration: { type: "string" },
    clientRequest: {
      type: "object",
      additionalProperties: true,
    },
    response: { type: "string" },
  },
  example: {
    sessionId: "asbc-24220210419100240",
    userId: "asbc-242",
    created: "2021-04-19T10:02:40Z",
    adBreakDuration: "40",
    clientRequest: {
      c: "true",
      dur: "60",
      uid: "asbc-242",
      os: "ios",
      dt: "mobile",
      ss: "1920x1080",
      uip: "192.168.1.20",
      userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
      acceptLang: "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7",
      host: "192.168.1.20:8000",
      min: "10",
      max: "45",
      ps: "4"

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
    query: {
      type: "object",
      properties: {
        page: {
          type: "string",
          description: "Page number.",
          example: "1",
        },
        limit: {
          type: "string",
          description: "Limit of sessions on each page.",
          example: "10",
        },
      },
    },
    response: {
      200: {
        description: "On success return a pagination object",
        type: "object",
        properties: {
          previousPage: { example: "null",},
          currentPage: {example: "1",},
          nextPage: {example: "2",},
          totalPages: {example: "2",},
          limit: {example: "5",},
          totalItems: {example: "10",},
          data: {
            description: "On success returns an array of sessions",
            type: "array",
            items: SessionSchema(),
          },
        },
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
  "GET/sessions/:sessionId/events": {
    description:
      "Gets a collection of all tracking events recieved from a specific session",
    tags: ["sessions"],
    params: {
      sessionId: {
        type: "string",
        description: "The ID for the session. ",
      },
    },
    response: {
      200: {
        description:
          "JSON object containing a list of items detailing a recieved event.",
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                issuedAt: { type: "string" },
                onAd: { type: "string" },
                userAgent: { type: "string" },
              },
            },
          },
        },
        example: {
          events: [
            {
              type: "start",
              issuedAt: "2020-05-26T10:43:02Z",
              onAd: "sample_ad_2",
              userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
            {
              type: "firstQuartile",
              issuedAt: "2020-05-26T10:44:02Z",
              onAd: "sample_ad_2",
              userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
            {
              type: "midpoint",
              issuedAt: "2020-05-26T10:44:02Z",
              onAd: "sample_ad_2",
              userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
          ],
        },
      },

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
      404: BadRequestSchema("Sessions under User-ID: 'xxx-xxx' were not found"),
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
          description: "Desired duration in seconds.",
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
        min: {
          type: "string",
          description: "Minimum Ad Pod duration in seconds.",
          example: "10",
        },
        max: {
          type: "string",
          description: "Maximum Ad Pod duration in seconds.",
          example: "30",
        },
        ps: {
          type: "string",
          description: "Desired Pod size in numbers of Ads.",
          example: "3",
        },
        userAgent: {
          type: "string",
          description: "Client's user agent",
          example: "Mozilla/5.0",
        },
      },
    },
    response: {
      200: VastResponseSchema(),
      404: BadRequestSchema("Error creating VAST response object"),
    },
    security: [{ apiKey: [] }],
  },
}; // End of dict

// ======================
// ====  API ROUTES  ====
// ======================
module.exports = (fastify, opt, next) => {
  fastify.get(
    "/sessions",
    { schema: schemas["GET/sessions"] },
    async (req, reply) => {
      try {
        const options = {
          page: req.query.page,
          limit: req.query.limit,
          targetHost: req.headers['host']
        };
        
        const sessionList = await DBAdapter.getAllSessions(options);
        reply.code(200).send(sessionList);
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'] });
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
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          const payload = {
            sessionId: session.sessionId,
            userId: session.getUser(),
            created: session.created,
            adBreakDuration: session.adBreakDuration,
            clientRequest: session.getClientRequest(),
            response: session.getVastXml().toString(),
          };
          reply.code(200).send(payload);
        }
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'], sessionId: req.params.sessionId });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.delete(
    "/sessions/:sessionId",
    { schema: schemas["DELETE/sessions/:sessionId"] },
    async (req, reply) => {
      try {
        const sessionId = req.params.sessionId;
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          await DBAdapter.DeleteSession(sessionId);
          reply.send(204);
        }
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'], sessionId: req.params.sessionId });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/tracking",
    { schema: schemas["GET/sessions/:sessionId/tracking"] },
    async (req, reply) => {
      try {        
        // Get path parameters and query parameters.
        const sessionId = req.params.sessionId;
        const adId = req.query.adId;
        const viewProgress = req.query.progress;
        const userAgent = req.headers['user-agent'] || "Not Found";
        const eventNames = {
          0: "start",
          25: "firstQuartile",
          50: "midpoint",
          75: "thirdQuartile",
          100: "complete",
        };

        // Check if session exists.
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          logger.info(`Session with ID: '${sessionId}' was not found`, { label: req.headers['host'], sessionId: sessionId });
          reply.code(404).send({message: `Session with ID: '${sessionId}' was not found`});
        } else {
          // [LOG]: data to console with special format.
          const logMsg = {
            host: req.headers['host'],
            event: eventNames[viewProgress],
            adId: adId,
            time: new Date().toISOString()
          };
          logger.info(logMsg, { label: req.headers['host'], sessionId: sessionId });

          // Store event info in session.
          const newEvent = {
            type: logMsg.event,
            issuedAt: logMsg.time,
            onAd: adId,
            userAgent: userAgent,
          };
          session.AddTrackedEvent(newEvent);
          // Update session in storage
          await DBAdapter.AddSessionToStorage(session);

          // Reply with 200 OK and acknowledgment message.
          reply.code(200).send({
            message: `Tracking Data Recieved [ ADID:${adId}, PROGRESS:${viewProgress} ]`,
          });
        }
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'], sessionId: req.params.sessionId });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/events",
    { schema: schemas["GET/sessions/:sessionId/events"] },
    async (req, reply) => {
      try {
        // Get path parameters and query parameters.
        const sessionId = req.params.sessionId;

        // Check if session exists.
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          // Get the List of tracked events from session.
          const eventsList = session.getTrackedEvents();
          // Reply with 200 OK and acknowledgment message. Client Ignores this?
          reply.code(200).send(eventsList);
        }
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'], sessionId: req.params.sessionId });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  // Users - routes
  fastify.get(
    "/users/:userId",
    { schema: schemas["GET/users/:userId"] },
    async (req, reply) => {
      try {
        // Get Session List via db-controller function.
        let sessionList = await DBAdapter.getSessionsByUserId(
          req.params.userId
        );

        // Check if List is null, If so assume no sessions with that user ID exists.
        if (!sessionList) {
          logger.info(`Sessions under User-ID: '${req.params.userId}' were not found`, { label: req.headers['host'] });
          reply.code(404).send({
            message: `Sessions under User-ID: '${req.params.userId}' were not found`,
          });
        } else {
          // Send Array of: items -> containing all session information.
          sessionList = sessionList.map((session) => {
            return {
              sessionId: session.sessionId,
              userId: session.getUser(),
              created: session.created,
              adBreakDuration: session.adBreakDuration,
              clientRequest: session.getClientRequest(),
              response: session.getVastXml().toString(),
            };
          });
          reply.code(200).send(sessionList);
        }
      } catch (exc) {
        logger.error(exc.message, { label: req.headers['host'] });
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
  fastify.get("/vast", { schema: schemas["GET/vast"] }, async (req, reply) => {
    let session;
    try {
      // [LOG]: requested query parameters with a timestamp.
      logger.info(req.query, { label: req.headers['host'] });

      // If client didn't send IP as query, then use IP in header
      if (!req.query['uip']) {
        const parseIp = (req => {
          if (req.headers['x-forwarded-for']) {
            return req.headers['x-forwarded-for'].split(',').shift();
          } else if (req.socket) {
            return req.socket.remoteAddress;
          } else {
            return "Not found";
          }
        });
        req.query['uip'] = parseIp(req);
      }

      // If client didn't send user-agent as query, then read from header
      if (!req.query['userAgent']) {
        req.query['userAgent'] = req.headers['user-agent'] || "Not Found";
      }
      // Parse browser language, and host from request header
      const acceptLanguage = req.headers['accept-language'] || "Not Found";
      const host = req.headers['host'];

      const params = Object.assign(req.query, { acceptLang: acceptLanguage, host: host });
      // Create new session, then add to session DB.
      session = new Session(params);
      const result = await DBAdapter.AddSessionToStorage(session);
      if (!result) {
        logger.error("Could not store new session", { label: host, sessionId: session.sessionId })
        reply.code(404).send({ message: "Could not store new session" });
      }
      // Respond with session's VAST
      vast_xml = session.getVastXml();
      if (!vast_xml) {
        logger.error("VAST not found", { label: host, sessionId: session.sessionId })
        reply.code(404).send({
          message: `VAST not found`,
        });
      } else {
        logger.debug(vast_xml.toString(), { label: host, sessionId: session.sessionId });
        if (vast_xml.toString() === EMPTY_VAST_STR) {
          logger.info("Empty VAST returned", { label: host });
        } else {
          logger.info("Returned VAST and created a session", { label: req.headers['host'], sessionId: session.sessionId });
        }

        reply.header("Content-Type", "application/xml; charset=utf-8");
        reply.code(200).send(vast_xml);
      }
    } catch (exc) {
      logger.error(exc.message, { label: req.headers['host'], sessionId: session.sessionId });
      reply.code(500).send({ message: exc.message });
    }
  });

  next();
};
