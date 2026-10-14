import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, passwordPolicyError, verifyPassword } from "../src/lib/password.ts";

test("hashes are salted and verify correctly", async () => {
  const a = await hashPassword("Correct-Horse-42");
  const b = await hashPassword("Correct-Horse-42");
  assert.notEqual(a, b);
  assert.ok(a.startsWith("scrypt$"));
  assert.equal(await verifyPassword("Correct-Horse-42", a), true);
  assert.equal(await verifyPassword("correct-horse-42", a), false);
  assert.equal(await verifyPassword("anything", "not-a-hash"), false);
});

test("password policy", () => {
  assert.ok(passwordPolicyError("short"));
  assert.ok(passwordPolicyError("alllowercaseletters"));
  assert.equal(passwordPolicyError("Etoile-Polaire-2026!"), null);
});
