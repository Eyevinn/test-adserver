
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let db = null;
if (process.env.APP_DB_PSQL_URL) {
  try {
    db = require("knex")({
      client: "pg",
      connection: process.env.APP_DB_PSQL_URL
    });
  } catch (err) {
    console.error("Problem Connecting to Postgresql Database");
    throw new Error(err);
  }
}


module.exports = db;
