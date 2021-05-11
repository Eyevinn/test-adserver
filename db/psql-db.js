const db = require("knex")({
    client: "pg",
    connection: {
      host: process.env.APP_DB_HOST || "127.0.0.1",
      user: process.env.APP_DB_USER || "eyevinn",
      password: process.env.APP_DB_PASSWORD || "very-secret-stuff",
      database: process.env.APP_DB_NAME || "session_db_dev",
    }, //connection:"postgresql://postgres:very-secret-stuff@localhost:5432/session_db_dev"
  });
  
  module.exports = db;
  