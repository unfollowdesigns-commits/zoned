import { createClient } from "@libsql/client";
import { MIGRATIONS } from "../src/lib/schema.ts";

export function connect() {
  const url = process.env.DATABASE_URL || "file:./db/rania.db";
  return createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
}

export async function migrate(c: ReturnType<typeof connect>) {
  await c.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)");
  const done = new Set((await c.execute("SELECT version FROM schema_migrations")).rows.map((r) => Number(r.version)));
  for (const m of MIGRATIONS) {
    if (done.has(m.version)) continue;
    await c.executeMultiple(m.sql);
    await c.execute({ sql: "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", args: [m.version, Date.now()] });
    console.log(`✓ migration ${m.version}`);
  }
}
