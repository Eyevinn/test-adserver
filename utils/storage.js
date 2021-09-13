const MemoryDBAdapter = require("../controllers/memory-db-adapter");
const PsqlDBAdapter = require("../controllers/psql-db-adapter");


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

let DBAdapter = null;
console.log("HELLO:::: NOW LETS CHOOOSE STORE::::")
if (process.env.APP_DB_PSQL_URL) {
    console.log("RUNNING IN PSQL-MODE")
    DBAdapter = new PsqlDBAdapter();
} else {
    console.log("RUNNING IN MEMORY-MODE")
    DBAdapter = new MemoryDBAdapter();
}

module.exports = DBAdapter;