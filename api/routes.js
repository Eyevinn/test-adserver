const DBAdapter = require("../controllers/memory-db-adapter");
const logger = require("../utils/logger.js");
const {
  PaginateMemoryDB,
  Transform,
  CloudWatchLog,
  TENANT_CACHE,
  UpdateCache,
} = require("../utils/utilities");
const Session = require("./Session.js");
const {
  EMPTY_VAST_STR,
  EMPTY_VMAP_STR,
  RESPONSE_FORMATS,
} = require("../utils/constants");

const CACHE_MAX_AGE = process.env.CACHE_MAX_AGE || 5 * 60 * 1000;

/**
 * - First Schemas
 * - Then the different Routes
 */

const XmlResponseSchema = (vmapOrVast) => ({
  xml: {
    name: vmapOrVast,
  },
  description: `On Success, a ${vmapOrVast} file in XML format is Returned`,
  type: "object",
  properties: vmapOrVast === "VAST" ? vastSchema() : vmapSchema(),
});

const vmapSchema = () => ({
  "vmap:AdBreak": {
    type: "object",
    properties: {
      breakId: {
        type: "string",
        example: "preroll.ad",
        xml: { attribute: true },
      },
      breakType: {
        type: "string",
        example: "linear",
        xml: { attribute: true },
      },
      timeOffset: {
        type: "string",
        example: "start",
        xml: { attribute: true },
      },
      "vmap:AdSource": {
        type: "object",
        properties: {
          allowMultipleAds: {
            type: "string",
            example: "true",
            xml: { attribute: true },
          },
          followRedirects: {
            type: "string",
            example: "true",
            xml: { attribute: true },
          },
          id: {
            type: "string",
            example: "1",
            xml: { attribute: true },
          },
          "vmap:VASTAdData": {
            type: "object",
            properties: {
              VAST: {
                type: "object",
                properties: vastSchema(),
              },
            },
          },
        },
      },
    },
  },
});
const vastSchema = () => ({
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
          AdTitle: {
            type: "string",
            example: "Movie Ad #6",
          },
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
          AdServingId: {
            type: "string",
            example: "mock-ad-server-id",
          },
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
                      skipoffset: {
                        type: "string",
                        example: "00:00:05",
                        xml: { attribute: true },
                      },
                      Duration: {
                        type: "string",
                        example: "00:00:30",
                      },
                      TrackingEvents: {
                        type: "object",
                        properties: {
                          Tracking: {
                            type: "object",
                            properties: {
                              event: {
                                type: "string",
                                example: "complete",
                                xml: {
                                  attribute: true,
                                },
                              },
                              " ": {
                                type: "string",
                                example:
                                  "[CDATA[http://example.com/api/v1/sessions/SID/tracking?adId=ADID&progress=100]]",
                                xml: {
                                  wrapper: false,
                                },
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
                                xml: {
                                  attribute: true,
                                },
                              },
                              delivery: {
                                type: "string",
                                example: "progressive",
                                xml: {
                                  attribute: true,
                                },
                              },
                              type: {
                                type: "string",
                                example: "video/mp4",
                                xml: {
                                  attribute: true,
                                },
                              },
                              bitrate: {
                                type: "string",
                                example: "2000",
                                xml: {
                                  attribute: true,
                                },
                              },
                              width: {
                                type: "string",
                                example: "1280",
                                xml: {
                                  attribute: true,
                                },
                              },
                              height: {
                                type: "string",
                                example: "720",
                                xml: {
                                  attribute: true,
                                },
                              },
                              codec: {
                                type: "string",
                                example: "H.264",
                                xml: {
                                  attribute: true,
                                },
                              },
                              " ": {
                                type: "string",
                                example:
                                  "[CDATA[http://example.com/video-server/mortal-kombat-trailer.mp4]]",
                                xml: {
                                  wrapper: false,
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
      userAgent:
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
      acceptLang: "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7",
      host: "192.168.1.20:8000",
      min: "10",
      max: "45",
      ps: "4",
      v: "4",
    },
    response: "<VAST XML>",
  },
});

const BadRequestSchema = (exampleMsg) => ({
  description: "Bad request error description",
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Reason of the error",
    },
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
          previousPage: { example: "null" },
          currentPage: { example: "1" },
          nextPage: { example: "2" },
          totalPages: { example: "2" },
          limit: { example: "5" },
          totalItems: { example: "10" },
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
          description: "The ID for the Ad (if VAST v4.0)",
          example: "adid-123",
        },
        adID: {
          type: "string",
          description: "The ID for the Ad (if VAST v2.0 or v3.0)",
          example: "adid-123",
        },
        progress: {
          type: "string",
          description: "The watch-time percent reached on the Ad.",
          example: "75",
        },
      },
      oneOf: [
        {
          required: ["adId", "progress"],
        },
        {
          required: ["adID", "progress"],
        },
      ],
    },
    response: {
      200: {
        description: "A message acknowledging tracking data has been recieved.",
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Simple acknowledgment",
          },
        },
        example: {
          message: "Tracking Data Recieved",
        },
      },
      400: {
        description: "Bad request error, Invalid request syntax",
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Reason of the error",
          },
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
              userAgent:
                "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
            {
              type: "firstQuartile",
              issuedAt: "2020-05-26T10:44:02Z",
              onAd: "sample_ad_2",
              userAgent:
                "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
            {
              type: "midpoint",
              issuedAt: "2020-05-26T10:44:02Z",
              onAd: "sample_ad_2",
              userAgent:
                "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            },
          ],
        },
      },

      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/sessions/:sessionId/vast": {
    description: "Gets the VAST XML created for a specific session",
    tags: ["sessions"],
    params: {
      sessionId: {
        type: "string",
        description: "The ID for the session. ",
      },
    },
    response: {
      200: {
        description: "VAST XML",
        type: "string",
      },

      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
  },
  "GET/sessions/:sessionId/vmap": {
    description: "Gets the VMAP XML created for a specific session",
    tags: ["sessions"],
    params: {
      sessionId: {
        type: "string",
        description: "The ID for the session. ",
      },
    },
    response: {
      200: {
        description: "VMAP XML",
        type: "string",
      },

      404: BadRequestSchema("Session with ID: 'xxx-xxx-xxx-xxx' was not found"),
    },
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
        skip: {
          type: "string",
          description: "Skipoffset in seconds or percentage.",
          example: "5 or 25%",
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
        v: {
          type: "string",
          description:
            "VAST version to use. Default is 4. Supported values are 2, 3 and 4",
          example: "3",
        },
        userAgent: {
          type: "string",
          description: "Client's user agent",
          example: "Mozilla/5.0",
        },
        coll: {
          type: "string",
          description: "A way to target the call to a specific collection of ads. The ads can be stored in an MRSS file on MRSS_ORIGIN named '{coll}.mrss'",
          example: "my-cat-ads",
        }
      },
    },
    response: {
      200: XmlResponseSchema("VAST"),
      404: BadRequestSchema("Error creating VAST response object"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/pause-ad": {
    description: "Send a VAST response for a Pause Ad and create a new session for the given User ID",
    tags: ["vast"],
    produces: ["application/xml"],
    query: {
      type: "object",
      properties: {
        uid: {
          type: "string",
          description: "User ID.",
          example: "asbc-242-fsdv-123",
        },
        v: {
          type: "string",
          description: "VAST version to use. Default is 4. Supported values are 2, 3 and 4",
          example: "4",
        },
        width: {
          type: "integer",
          description: "Width of the pause ad image. Default is 300.",
          example: 400,
        },
        height: {
          type: "integer",
          description: "Height of the pause ad image. Default is 167.",
          example: 225,
        },
      },
    },
    response: {
      200: XmlResponseSchema("VAST"),
      404: BadRequestSchema("Error creating VAST response for Pause Ad"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/vmap": {
    description:
      "Send a VMAP response, then create a new session for the given User ID",
    tags: ["vmap"],
    produces: ["application/xml", "application/json"],
    query: {
      type: "object",
      properties: {
        c: {
          type: "string",
          description: "Consent check.",
          example: "true",
        },
        bp: {
          type: "string",
          description:
            "Comma seperated string representing VMAP Ad breakpoints",
          example: "300,900,1500",
        },
        prr: {
          type: "string",
          description: "To include 15s preroll ad break ",
          example: "true",
        },
        por: {
          type: "string",
          description: "To include 15s postroll ad break",
          example: "true",
        },
        dur: {
          type: "string",
          description: "Desired duration for midroll ad break, in seconds.",
          example: "60",
        },
        skip: {
          type: "string",
          description: "Skipoffset in seconds or percentage.",
          example: "5 or 25%",
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
          description:
            "Minimum Ad Pod duration in midroll adbreak, in seconds.",
          example: "10",
        },
        max: {
          type: "string",
          description:
            "Maximum Ad Pod duration in midroll adbreak, in seconds.",
          example: "30",
        },
        ps: {
          type: "string",
          description:
            "Desired Pod size in midroll adbreak, in numbers of Ads.",
          example: "3",
        },
        v: {
          type: "string",
          description:
            "VAST version to use. Default is 4. Supported values are 2, 3 and 4.",
          example: "3",
        },
        userAgent: {
          type: "string",
          description: "Client's user agent",
          example: "Mozilla/5.0",
        },
        coll: {
          type: "string",
          description: "A way to target the call to a specific collection of ads. The ads can be stored in an MRSS file on MRSS_ORIGIN named '{coll}.mrss'",
          example: "my-cat-ads",
        }
      },
    },
    response: {
      200: XmlResponseSchema("vmap:VMAP"),
      404: BadRequestSchema("Error creating VMAP response object"),
    },
    security: [{ apiKey: [] }],
  },
  "GET/ads": {
    description: "Send either a VAST or VMAP response based on rt parameter",
    tags: ["ads"],
    produces: ["application/xml", "application/json"],
    query: {
      type: "object",
      properties: {
        // Common parameters
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
        skip: {
          type: "string",
          description: "Skipoffset in seconds or percentage.",
          example: "5 or 25%",
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
        v: {
          type: "string",
          description: "VAST version to use. Default is 4. Supported values are 2, 3 and 4",
          example: "3",
        },
        userAgent: {
          type: "string",
          description: "Client's user agent",
          example: "Mozilla/5.0",
        },
        coll: {
          type: "string",
          description: "A way to target the call to a specific collection of ads.",
          example: "my-cat-ads",
        },
        // VMAP specific parameters
        bp: {
          type: "string",
          description: "Comma seperated string representing VMAP Ad breakpoints",
          example: "300,900,1500",
        },
        prr: {
          type: "string",
          description: "To include 15s preroll ad break",
          example: "true",
        },
        por: {
          type: "string",
          description: "To include 15s postroll ad break",
          example: "true",
        },
        rt: {
          type: "string",
          description: "Type of response to return (vast or vmap). Defaults to vast if not specified",
          enum: ["vast", "vmap"],
          example: "vast",
        },
      },
    },
    response: {
      200: XmlResponseSchema("VAST"),
      400: BadRequestSchema("Invalid rt (return type) specified"),
      404: BadRequestSchema("Error creating response object"),
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
          targetHost: req.headers["host"],
        };

        const sessionList = await DBAdapter.getAllSessions(options);
        reply.code(200).send(sessionList);
      } catch (exc) {
        logger.error(exc, {
          label: req.headers["host"],
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId",
    {
      schema: schemas["GET/sessions/:sessionId"],
    },
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
            response: session.getXmlResponse().toString(),
          };
          reply.code(200).send(payload);
        }
      } catch (exc) {
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.delete(
    "/sessions/:sessionId",
    {
      schema: schemas["DELETE/sessions/:sessionId"],
    },
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
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/tracking",
    {
      schema: schemas["GET/sessions/:sessionId/tracking"],
    },
    async (req, reply) => {
      try {
        // Get path parameters and query parameters.
        const sessionId = req.params.sessionId;
        const adId = req.query.adId || req.query.adID;
        const viewProgress = req.query.progress || null;
        const userAgent = req.headers["user-agent"] || "Not Found";
        const eventNames = {
          0: "start",
          25: "firstQuartile",
          50: "midpoint",
          75: "thirdQuartile",
          100: "complete",
          vmap: "vmap:breakStart",
          vast: "vast:adImpression",
          e: "error",
        };

        // Check if session exists.
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          logger.info(`Session with ID: '${sessionId}' was not found`, {
            label: req.headers["host"],
            sessionId: sessionId,
          });
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          // [LOG]: data to console with special format.
          let eventName = "";
          if (viewProgress) {
            eventName = eventNames[viewProgress];
          }
          const logMsg = {
            host: req.headers["host"],
            event: eventName,
            adId: adId,
            time: new Date().toISOString(),
          };
          logger.info(logMsg, {
            label: req.headers["host"],
            sessionId: sessionId,
          });

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
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/events",
    {
      schema: schemas["GET/sessions/:sessionId/events"],
    },
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
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/vast",
    {
      schema: schemas["GET/sessions/:sessionId/vast"],
    },
    async (req, reply) => {
      const sessionId = req.params.sessionId;
      try {
        // Check if session exists.
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          vast_xml = session.getVastXml();
          reply.headers({
            "Content-Type": "application/xml;charset=UTF-8",
          });
          reply.code(200).send(vast_xml);
        }
      } catch (exc) {
        console.error(exc);
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  fastify.get(
    "/sessions/:sessionId/vmap",
    {
      schema: schemas["GET/sessions/:sessionId/vmap"],
    },
    async (req, reply) => {
      const sessionId = req.params.sessionId;
      try {
        // Check if session exists.
        const session = await DBAdapter.getSession(sessionId);
        if (!session) {
          reply.code(404).send({
            message: `Session with ID: '${sessionId}' was not found`,
          });
        } else {
          vmap_xml = session.getVmapXml();
          reply.headers({
            "Content-Type": "application/xml;charset=UTF-8",
          });
          reply.code(200).send(vmap_xml);
        }
      } catch (exc) {
        console.error(exc);
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: sessionId,
        });
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
          logger.info(
            `Sessions under User-ID: '${req.params.userId}' were not found`,
            { label: req.headers["host"] }
          );
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
              response: session.getXmlResponse().toString(),
            };
          });
          reply.code(200).send(sessionList);
        }
      } catch (exc) {
        logger.error(exc, {
          label: req.headers["host"],
        });
        reply.code(500).send({ message: exc.message });
      }
    }
  );

  const handleAdRequest = async (req, reply, type) => {
    try {
      // [LOG]: requested query parameters with a timestamp.
      logger.info(req.query, {
        label: req.headers["host"],
      });
      CloudWatchLog("ADS_REQUESTED", req.headers["host"], {
        dur: req.query["dur"],
      });

      // If client didn't send IP as query, then use IP in header
      if (!req.query["uip"]) {
        const parseIp = (req) => {
          if (req.headers["x-forwarded-for"]) {
            return req.headers["x-forwarded-for"].split(",").shift();
          } else if (req.socket) {
            return req.socket.remoteAddress;
          } else {
            return "Not found";
          }
        };
        req.query["uip"] = parseIp(req);
      }

      // If client didn't send user-agent as query, then read from header
      if (!req.query["userAgent"]) {
        req.query["userAgent"] = req.headers["user-agent"] || "Not Found";
      }
      
      // Parse browser language, and host from request header
      const acceptLanguage = req.headers["accept-language"] || "Not Found";
      const host = req.headers["host"];

      const params = Object.assign(req.query, {
        acceptLang: acceptLanguage,
        host: host,
        ...(type === "vmap" && { rf: RESPONSE_FORMATS.VMAP }),
      });

      // Use Ads from mRSS if origin is specified
      if (process.env.MRSS_ORIGIN) {
        const collection = req.query['coll'] || host
        const feedUri = `${process.env.MRSS_ORIGIN}${collection}.mrss`;

        if (!TENANT_CACHE[collection]) {
          await UpdateCache(collection, feedUri, TENANT_CACHE);
        } else {
          const age = Date.now() - TENANT_CACHE[collection].lastUpdated;
          if (age >= CACHE_MAX_AGE) {
            await UpdateCache(collection, feedUri, TENANT_CACHE);
          }
        }
      }

      // Create new session, then add to session DB.
      const session = new Session(params);
      const result = await DBAdapter.AddSessionToStorage(session);
      if (!result) {
        logger.error("Could not store new session", {
          label: host,
          sessionId: session.sessionId,
        });
        reply.code(404).send({
          message: "Could not store new session",
        });
        return;
      }

      // Get appropriate XML response based on type
      const xml = type === "vmap" ? session.getVmapXml() : session.getVastXml();
      const emptyStr = type === "vmap" ? EMPTY_VMAP_STR : EMPTY_VAST_STR;
      
      if (!xml) {
        logger.error(`${type.toUpperCase()} not found`, {
          label: host,
          sessionId: session.sessionId,
        });
        reply.code(404).send({
          message: `${type.toUpperCase()} not found`,
        });
      }

      logger.debug(xml.toString(), {
        label: host,
        sessionId: session.sessionId,
      });

      if (xml.toString() === emptyStr) {
        logger.info(`Empty ${type.toUpperCase()} returned`, {
          label: host,
        });
      } else {
        logger.info(`Returned ${type.toUpperCase()} and created a session`, {
          label: req.headers["host"],
          sessionId: session.sessionId,
        });
        CloudWatchLog("ADS_RETURNED", req.headers["host"], {
          dur: type === "vmap" ? session.adBreakDurations : session.adBreakDuration,
          session: session.sessionId,
        });
      }

      reply.header("Content-Type", "application/xml; charset=utf-8");
      reply.code(200).send(xml);

    } catch (exc) {
      if (session) {
        logger.error(exc, {
          label: req.headers["host"],
          sessionId: session.sessionId,
        });
      } else {
        logger.error(exc, {
          label: req.headers["host"],
        });
      }
      reply.code(500).send({ message: exc.message });
    }
  };

  fastify.get("/vast", { schema: schemas["GET/vast"] }, (req, reply) => 
    handleAdRequest(req, reply, "vast"));

  fastify.get("/vmap", { schema: schemas["GET/vmap"] }, (req, reply) => 
    handleAdRequest(req, reply, "vmap"));

  fastify.get("/ads", { schema: schemas["GET/ads"] }, async (req, reply) => {
    const type = (req.query.rt || 'vast').toLowerCase();
    if (type !== "vast" && type !== "vmap") {
      reply.code(400).send({
        message: "rt must be either 'vast' or 'vmap'"
      });
      return;
    }
    return handleAdRequest(req, reply, type);
  });

  /**
  * GET endpoint to retrieve VAST XML for Pause Ads.
  */
  fastify.get("/pause-ad", { schema: schemas["GET/pause-ad"] }, async (req, reply) => {
    try {
      logger.info(req.query, {
        label: req.headers["host"],
      });
      CloudWatchLog("PAUSE_AD_REQUESTED", req.headers["host"], {});
  
      const params = Object.assign(req.query, {
        acceptLang: req.headers["accept-language"] || "Not Found",
        host: req.headers["host"],
        userAgent: req.headers["user-agent"] || "Not Found",
        uip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Not Found",
        rf: RESPONSE_FORMATS.PAUSE_AD,
        width: req.query.width ? parseInt(req.query.width) : undefined,
        height: req.query.height ? parseInt(req.query.height) : undefined,
      });

      const session = new Session(params);
      const result = await DBAdapter.AddSessionToStorage(session);
      if (!result) {
        logger.error("Could not store new session", {
          label: params.host,
          sessionId: session.sessionId,
        });
        reply.code(404).send({
          message: "Could not store new session",
        });
        return;
      }
  
      const pauseAdVast = session.getPauseAdVast();
      if (!pauseAdVast) {
        logger.error("Pause Ad VAST not found", {
          label: params.host,
          sessionId: session.sessionId,
        });
        reply.code(404).send({
          message: "Pause Ad VAST not found",
        });
        return;
      }
  
      logger.info("Returned Pause Ad VAST and created a session", {
        label: req.headers["host"],
        sessionId: session.sessionId,
      });
      CloudWatchLog("PAUSE_AD_RETURNED", req.headers["host"], {
        session: session.sessionId,
      });
  
      reply.header("Content-Type", "application/xml; charset=utf-8");
      reply.code(200).send(pauseAdVast);
    } catch (exc) {
      logger.error(exc, {
        label: req.headers["host"],
      });
      reply.code(500).send({ message: exc.message });
    }
  });

  next();
};