const controller = require("../../controllers/api-controller");

module.exports = function (fastify, opts, done) {
  fastify.get("sessions/:sessionId", async (req, reply) => {
    const sessionId = req.params.sessionId;
    const data = await controller.get(sessionId);
    if (!data) {
      return reply.code(404).send();
    }
    reply
      .header("Cache-Control", "public, no-cache")
      .code(200)
      .send(data);
  });
  done();
};
