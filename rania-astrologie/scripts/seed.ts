// Seeds initial content. Idempotent: only fills empty tables.
//   npm run db:seed                 → consultations, sample articles, admin (from env)
//   npm run db:seed -- --demo-slots → also opens demo time slots for the next weeks
import { hashPassword, passwordPolicyError } from "../src/lib/password.ts";
import { seedContent } from "../src/lib/seed-data.ts";
import { connect, migrate } from "./_db.ts";

const c = connect();
await migrate(c);

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
let admin: { email: string; passwordHash: string } | undefined;
if (email && password) {
  const policy = passwordPolicyError(password);
  if (policy) console.error(`✗ Admin not created: ${policy}`);
  else admin = { email, passwordHash: await hashPassword(password) };
}

const log = await seedContent(c, { admin, demoSlots: process.argv.includes("--demo-slots") });
for (const line of log) console.log(`✓ ${line}`);
console.log("Seed complete.");
