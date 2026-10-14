import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, num, one, run, str } from "./db";
import { env } from "./env";
import { hashToken, randomToken } from "./security";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const REFRESH_AFTER_MS = 1000 * 60 * 60 * 24; // slide expiry at most once a day

/** `__Host-` prefix pins the cookie to this exact origin over HTTPS (production only). */
export const SESSION_COOKIE = env.isProd ? "__Host-rania_admin" : "rania_admin";

export type Admin = { id: number; email: string };

export async function createSession(adminId: number): Promise<void> {
  const token = randomToken(32);
  const now = Date.now();
  const ua = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  await run("INSERT INTO sessions (id, admin_id, expires_at, created_at, user_agent) VALUES (?, ?, ?, ?, ?)", [
    hashToken(token),
    adminId,
    now + SESSION_TTL_MS,
    now,
    ua,
  ]);
  await run("DELETE FROM sessions WHERE expires_at < ?", [now]);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export const currentAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = hashToken(token);
  const row = await one(
    `SELECT s.expires_at, s.created_at, a.id, a.email FROM sessions s
     JOIN admins a ON a.id = s.admin_id WHERE s.id = ?`,
    [id],
    (r) => ({ expiresAt: num(r.expires_at), adminId: num(r.id), email: str(r.email) }),
  );
  if (!row) return null;
  const now = Date.now();
  if (row.expiresAt < now) {
    await run("DELETE FROM sessions WHERE id = ?", [id]);
    return null;
  }
  if (row.expiresAt - now < SESSION_TTL_MS - REFRESH_AFTER_MS) {
    await run("UPDATE sessions SET expires_at = ? WHERE id = ?", [now + SESSION_TTL_MS, id]);
  }
  return { id: row.adminId, email: row.email };
});

/** Guard for every admin page and server action. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(adminId: number): Promise<void> {
  await (await db()).execute({ sql: "DELETE FROM sessions WHERE admin_id = ?", args: [adminId] });
}
