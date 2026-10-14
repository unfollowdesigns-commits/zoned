import { connect, migrate } from "./_db.ts";

const c = connect();
await migrate(c);
console.log("Database schema is up to date.");
