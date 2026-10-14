import "server-only";
import { createClient, type Client, type InArgs, type Row } from "@libsql/client";
import { env } from "./env";
import { MIGRATIONS } from "./schema";

type Global = typeof globalThis & { __raniaDb?: Client; __raniaMigrated?: Promise<void> };
const g = globalThis as Global;

function client(): Client {
  if (!g.__raniaDb) {
    g.__raniaDb = createClient({ url: env.databaseUrl, authToken: env.databaseAuthToken });
  }
  return g.__raniaDb;
}

export async function migrate(c: Client = client()): Promise<void> {
  await c.execute(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)",
  );
  const done = new Set(
    (await c.execute("SELECT version FROM schema_migrations")).rows.map((r) => Number(r.version)),
  );
  for (const m of MIGRATIONS) {
    if (done.has(m.version)) continue;
    await c.executeMultiple(m.sql);
    await c.execute({
      sql: "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)",
      args: [m.version, Date.now()],
    });
  }
}

/** Returns a ready client; schema migrations run once per process on first use. */
export async function db(): Promise<Client> {
  const c = client();
  if (!g.__raniaMigrated) {
    g.__raniaMigrated = migrate(c).catch((e) => {
      g.__raniaMigrated = undefined;
      throw e;
    });
  }
  await g.__raniaMigrated;
  return c;
}

export async function all<T>(sql: string, args: InArgs = [], map: (r: Row) => T): Promise<T[]> {
  const rs = await (await db()).execute({ sql, args });
  return rs.rows.map(map);
}

export async function one<T>(sql: string, args: InArgs = [], map: (r: Row) => T): Promise<T | null> {
  const rs = await (await db()).execute({ sql, args });
  return rs.rows.length ? map(rs.rows[0]) : null;
}

export async function run(sql: string, args: InArgs = []) {
  return (await db()).execute({ sql, args });
}

export function isUniqueViolation(e: unknown): boolean {
  const msg = e instanceof Error ? `${e.message} ${(e as { code?: string }).code ?? ""}` : String(e);
  return /UNIQUE constraint failed|SQLITE_CONSTRAINT/i.test(msg);
}

export const str = (v: unknown): string => (v == null ? "" : String(v));
export const strOrNull = (v: unknown): string | null => (v == null ? null : String(v));
export const num = (v: unknown): number => Number(v ?? 0);
export const numOrNull = (v: unknown): number | null => (v == null ? null : Number(v));
