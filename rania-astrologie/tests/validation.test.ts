import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingSchema, contactSchema, fieldErrors, looksLikeBot } from "../src/lib/validation.ts";

const validBooking = {
  offeringId: "1", slotId: "2", name: "Lina", email: "LINA@Example.com", phone: "+33 6 12 34 56 78", format: "video",
  birthDate: "1992-04-03", birthTime: "07:45", birthPlace: "Casablanca", partnerName: "", partnerBirthDate: "",
  partnerBirthTime: "", partnerBirthPlace: "", question: "", consent: "on",
};

test("valid booking parses and normalises", () => {
  const r = bookingSchema.safeParse(validBooking);
  assert.ok(r.success);
  assert.equal(r.data.email, "lina@example.com");
  assert.equal(r.data.partnerName, null);
});

test("booking rejects future birth dates, bad times and missing consent", () => {
  const r = bookingSchema.safeParse({ ...validBooking, birthDate: "2999-01-01", birthTime: "25:00", consent: "" });
  assert.equal(r.success, false);
  const e = fieldErrors(r.error!);
  assert.equal(e.birthDate, "date");
  assert.equal(e.birthTime, "date");
  assert.equal(e.consent, "consent");
});

test("contact rejects invalid email and short messages", () => {
  const r = contactSchema.safeParse({ name: "A", email: "nope", phone: "", subject: "other", message: "hi", consent: "on" });
  assert.equal(r.success, false);
  const e = fieldErrors(r.error!);
  assert.equal(e.email, "email");
  assert.equal(e.message, "required");
});

test("bot heuristics: honeypot and instant submits", () => {
  const fd = new FormData();
  fd.set("_t", String(Date.now()));
  assert.equal(looksLikeBot(fd), true);
  fd.set("_t", String(Date.now() - 10_000));
  assert.equal(looksLikeBot(fd), false);
  fd.set("website", "http://spam");
  assert.equal(looksLikeBot(fd), true);
});
