// Usage: ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create   (creates or resets the password)
import { hashPassword, passwordPolicyError } from "../src/lib/password.ts";
import { connect, migrate } from "./_db.ts";

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  process.exit(1);
}
const policy = passwordPolicyError(password);
if (policy) {
  console.error(policy);
  process.exit(1);
}
const c = connect();
await migrate(c);
const hash = await hashPassword(password);
await c.execute({
  sql: `INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`,
  args: [email, hash, Date.now()],
});
await c.execute({ sql: "DELETE FROM sessions WHERE admin_id = (SELECT id FROM admins WHERE email = ?)", args: [email] });
console.log(`✓ Admin account ready: ${email}`);
