import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { env } from "./env";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Keyed hash for tokens stored at rest (sessions, booking links). */
export function hashToken(token: string): string {
  return createHmac("sha256", env.appSecret).update(token).digest("base64url");
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Human-friendly booking reference, e.g. RA-7K3Q-M9PX (no ambiguous chars). */
export function bookingRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return `RA-${out.slice(0, 4)}-${out.slice(4)}`;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** IPs are only ever stored hashed (rate-limit keys), never in clear. */
export async function clientFingerprint(): Promise<string> {
  return sha256(`${await clientIp()}|${env.appSecret}`).slice(0, 32);
}
