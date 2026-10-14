import "server-only";
import type { Row } from "@libsql/client";
import { all, isUniqueViolation, num, numOrNull, one, run, str, strOrNull } from "../db";
import { bookingRef, hashToken, randomToken } from "../security";

export const bookingStatuses = ["pending", "confirmed", "declined", "cancelled", "completed"] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export type Booking = {
  id: number;
  ref: string;
  slotId: number | null;
  startsAt: number | null;
  offeringId: number | null;
  offeringName: string;
  priceCents: number;
  currency: string;
  status: BookingStatus;
  locale: "fr" | "en" | "ar";
  format: string;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string;
  birthTime: string | null;
  birthPlace: string;
  partnerName: string | null;
  partnerBirthDate: string | null;
  partnerBirthTime: string | null;
  partnerBirthPlace: string | null;
  question: string | null;
  adminNote: string | null;
  createdAt: number;
  updatedAt: number;
};

const map = (r: Row): Booking => ({
  id: num(r.id),
  ref: str(r.ref),
  slotId: numOrNull(r.slot_id),
  startsAt: numOrNull(r.slot_starts_at),
  offeringId: numOrNull(r.offering_id),
  offeringName: str(r.offering_name),
  priceCents: num(r.price_cents),
  currency: str(r.currency),
  status: str(r.status) as BookingStatus,
  locale: str(r.locale) as Booking["locale"],
  format: str(r.format),
  name: str(r.name),
  email: str(r.email),
  phone: strOrNull(r.phone),
  birthDate: str(r.birth_date),
  birthTime: strOrNull(r.birth_time),
  birthPlace: str(r.birth_place),
  partnerName: strOrNull(r.partner_name),
  partnerBirthDate: strOrNull(r.partner_birth_date),
  partnerBirthTime: strOrNull(r.partner_birth_time),
  partnerBirthPlace: strOrNull(r.partner_birth_place),
  question: strOrNull(r.question),
  adminNote: strOrNull(r.admin_note),
  createdAt: num(r.created_at),
  updatedAt: num(r.updated_at),
});

export type NewBooking = Omit<
  Booking,
  "id" | "ref" | "status" | "adminNote" | "createdAt" | "updatedAt" | "startsAt"
> & { slotId: number };

export type CreateResult = { ok: true; booking: Booking; token: string } | { ok: false; reason: "slot_taken" };

export async function createBooking(b: NewBooking): Promise<CreateResult> {
  const slot = await one(
    "SELECT starts_at FROM slots WHERE id = ? AND starts_at > ?",
    [b.slotId, Date.now()],
    (r) => num(r.starts_at),
  );
  if (slot == null) return { ok: false, reason: "slot_taken" };
  const token = randomToken(32);
  const now = Date.now();
  try {
    const rs = await run(
      `INSERT INTO bookings (ref, token_hash, slot_id, slot_starts_at, offering_id, offering_name, price_cents, currency,
        status, locale, format, name, email, phone, birth_date, birth_time, birth_place,
        partner_name, partner_birth_date, partner_birth_time, partner_birth_place, question, consent_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,'pending',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING *`,
      [
        bookingRef(), hashToken(token), b.slotId, slot, b.offeringId, b.offeringName, b.priceCents, b.currency,
        b.locale, b.format, b.name, b.email, b.phone, b.birthDate, b.birthTime, b.birthPlace,
        b.partnerName, b.partnerBirthDate, b.partnerBirthTime, b.partnerBirthPlace, b.question, now, now, now,
      ],
    );
    return { ok: true, booking: map(rs.rows[0]), token };
  } catch (e) {
    // The partial unique index on live bookings per slot rejects double booking atomically.
    if (isUniqueViolation(e)) return { ok: false, reason: "slot_taken" };
    throw e;
  }
}

export const getBookingByToken = (token: string) =>
  token.length > 100 ? Promise.resolve(null) : one("SELECT * FROM bookings WHERE token_hash = ?", [hashToken(token)], map);

export const getBooking = (id: number) => one("SELECT * FROM bookings WHERE id = ?", [id], map);

export async function listBookings(status?: BookingStatus): Promise<Booking[]> {
  return status
    ? all("SELECT * FROM bookings WHERE status = ? ORDER BY COALESCE(slot_starts_at, created_at) DESC LIMIT 500", [status], map)
    : all("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500", [], map);
}

export const listUpcomingConfirmed = () =>
  all(
    "SELECT * FROM bookings WHERE status IN ('pending','confirmed') AND slot_starts_at > ? ORDER BY slot_starts_at LIMIT 20",
    [Date.now() - 1000 * 60 * 60 * 3],
    map,
  );

export const countByStatus = () =>
  all("SELECT status, COUNT(*) AS n FROM bookings GROUP BY status", [], (r) => [str(r.status), num(r.n)] as const);

export async function setBookingStatus(id: number, status: BookingStatus, adminNote?: string | null): Promise<void> {
  if (adminNote === undefined) {
    await run("UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?", [status, Date.now(), id]);
  } else {
    await run("UPDATE bookings SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?", [status, adminNote, Date.now(), id]);
  }
}

export async function setBookingNote(id: number, note: string | null): Promise<void> {
  await run("UPDATE bookings SET admin_note = ?, updated_at = ? WHERE id = ?", [note, Date.now(), id]);
}

export async function deleteBooking(id: number): Promise<void> {
  await run("DELETE FROM bookings WHERE id = ?", [id]);
}

/** GDPR retention: purge closed bookings and messages older than N months. */
export async function purgeOlderThan(months: number): Promise<{ bookings: number; messages: number }> {
  const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
  const b = await run(
    "DELETE FROM bookings WHERE updated_at < ? AND (slot_starts_at IS NULL OR slot_starts_at < ?)",
    [cutoff, cutoff],
  );
  const m = await run("DELETE FROM messages WHERE created_at < ?", [cutoff]);
  return { bookings: b.rowsAffected, messages: m.rowsAffected };
}
