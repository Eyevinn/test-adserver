const MemoryDBAdapter = require("../controllers/memory-db-adapter");
const PsqlDBAdapter = require("../controllers/psql-db-adapter");


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

let DBAdapter = null;
if (process.env.APP_DB_PSQL_URL) {
<<<<<<< HEAD
    console.log("Test-Adserver using PSQL storage...")
    DBAdapter = new PsqlDBAdapter();
} else {
    console.log("Test-Adserver using MEMORY storage...")
=======
    console.log("RUNNING IN PSQL-MODE")
    DBAdapter = new PsqlDBAdapter();
} else {
    console.log("RUNNING IN MEMORY-MODE")
>>>>>>> 2d133a4 (rebase:)
    DBAdapter = new MemoryDBAdapter();
}

module.exports = DBAdapter;