import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidTimeZone, utcToZonedParts, zonedToUtc } from "../src/lib/time.ts";

test("wall-clock ↔ UTC round-trips, including across DST", () => {
  for (const [date, time] of [["2026-01-15", "10:00"], ["2026-07-15", "17:30"], ["2026-03-29", "09:00"], ["2026-10-25", "14:00"]]) {
    const ts = zonedToUtc(date, time, "Europe/Paris");
    const back = utcToZonedParts(ts, "Europe/Paris");
    assert.equal(back.date, date);
    assert.equal(back.time, time);
  }
  // Paris is UTC+1 in winter, UTC+2 in summer.
  assert.equal(new Date(zonedToUtc("2026-01-15", "10:00", "Europe/Paris")).toISOString(), "2026-01-15T09:00:00.000Z");
  assert.equal(new Date(zonedToUtc("2026-07-15", "10:00", "Europe/Paris")).toISOString(), "2026-07-15T08:00:00.000Z");
});

test("time zone validation", () => {
  assert.equal(isValidTimeZone("Africa/Casablanca"), true);
  assert.equal(isValidTimeZone("Mars/Olympus"), false);
});
