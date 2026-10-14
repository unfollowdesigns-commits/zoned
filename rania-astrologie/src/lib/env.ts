import "server-only";

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  siteUrl: (read("SITE_URL") ?? "http://localhost:3000").replace(/\/+$/, ""),
  databaseUrl: read("DATABASE_URL") ?? "file:./db/rania.db",
  databaseAuthToken: read("DATABASE_AUTH_TOKEN"),
  get appSecret(): string {
    const s = read("APP_SECRET");
    if (!s || s.length < 32) {
      if (isProd && process.env.NEXT_PHASE !== "phase-production-build") {
        throw new Error("APP_SECRET must be set (32+ characters) in production.");
      }
      return "dev-only-insecure-secret-dev-only-insecure-secret";
    }
    return s;
  },
  smtp: {
    host: read("SMTP_HOST"),
    port: Number(read("SMTP_PORT") ?? 465),
    user: read("SMTP_USER"),
    password: read("SMTP_PASSWORD"),
  },
  mailFrom: read("MAIL_FROM") ?? "Rania Astrologie <no-reply@localhost>",
  notifyEmail: read("NOTIFY_EMAIL"),
};
