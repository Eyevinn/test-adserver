"use strict";

const fastifyServer = require("./app")({});
// MAKE IT LISTEN
const start = async () => {
  try {
    const address = await fastifyServer.listen(
      process.env.PORT || 8080,

      process.env.HOST || "0.0.0.0"
    );

    console.log(`Test Adserver API is listening at ${address}`);
  } catch (err) {
    fastifyServer.log.error(err);
    process.exit(1);
  }
};
start();
