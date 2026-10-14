import "server-only";
import { db, num } from "./db";

/**
 * Fixed-window rate limiter backed by the database, so it holds across
 * serverless instances. Returns true when the action is allowed.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const c = await db();
  const now = Date.now();
  const rs = await c.execute({
    sql: `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
          RETURNING count`,
    args: [key, now + windowMs, now, now],
  });
  // Opportunistic cleanup of stale windows.
  if (Math.random() < 0.02) await c.execute({ sql: "DELETE FROM rate_limits WHERE reset_at < ?", args: [now] });
  return num(rs.rows[0]?.count) <= limit;
}

export async function resetRateLimit(key: string): Promise<void> {
  await (await db()).execute({ sql: "DELETE FROM rate_limits WHERE key = ?", args: [key] });
}
