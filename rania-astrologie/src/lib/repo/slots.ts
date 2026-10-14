import "server-only";
import { all, db, num, run } from "../db";

export type Slot = { id: number; startsAt: number; durationMin: number; booked: boolean };

/** Future slots that no live booking holds. `minLeadMs` keeps a buffer before the session. */
export async function listOpenSlots(minLeadMs = 1000 * 60 * 60 * 12): Promise<Slot[]> {
  return all(
    `SELECT s.id, s.starts_at, s.duration_min FROM slots s
     WHERE s.starts_at > ? AND NOT EXISTS (
       SELECT 1 FROM bookings b WHERE b.slot_id = s.id AND b.status IN ('pending','confirmed'))
     ORDER BY s.starts_at LIMIT 300`,
    [Date.now() + minLeadMs],
    (r) => ({ id: num(r.id), startsAt: num(r.starts_at), durationMin: num(r.duration_min), booked: false }),
  );
}

export async function listUpcomingSlots(): Promise<Slot[]> {
  return all(
    `SELECT s.id, s.starts_at, s.duration_min,
       EXISTS (SELECT 1 FROM bookings b WHERE b.slot_id = s.id AND b.status IN ('pending','confirmed')) AS booked
     FROM slots s WHERE s.starts_at > ? ORDER BY s.starts_at LIMIT 500`,
    [Date.now() - 1000 * 60 * 60 * 24],
    (r) => ({ id: num(r.id), startsAt: num(r.starts_at), durationMin: num(r.duration_min), booked: num(r.booked) === 1 }),
  );
}

export async function addSlots(starts: number[], durationMin: number): Promise<number> {
  if (!starts.length) return 0;
  const c = await db();
  const now = Date.now();
  const rs = await c.batch(
    starts.map((s) => ({
      sql: "INSERT OR IGNORE INTO slots (starts_at, duration_min, created_at) VALUES (?, ?, ?)",
      args: [s, durationMin, now],
    })),
    "write",
  );
  return rs.reduce((n, r) => n + r.rowsAffected, 0);
}

/** Only slots without a live booking can be removed. */
export async function deleteSlot(id: number): Promise<boolean> {
  const rs = await run(
    `DELETE FROM slots WHERE id = ? AND NOT EXISTS (
       SELECT 1 FROM bookings b WHERE b.slot_id = slots.id AND b.status IN ('pending','confirmed'))`,
    [id],
  );
  return rs.rowsAffected > 0;
}

export async function deletePastSlots(): Promise<void> {
  await run(
    `DELETE FROM slots WHERE starts_at < ? AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.slot_id = slots.id)`,
    [Date.now()],
  );
}
