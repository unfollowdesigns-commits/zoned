// Database migrations — append-only. Never edit a migration that has shipped;
// add a new entry instead. Kept free of imports so Node scripts can load it directly.

export const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS sessions_admin ON sessions(admin_id);

CREATE TABLE IF NOT EXISTS offerings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  service_key TEXT NOT NULL,
  name_fr TEXT NOT NULL, name_en TEXT NOT NULL, name_ar TEXT NOT NULL,
  summary_fr TEXT NOT NULL DEFAULT '', summary_en TEXT NOT NULL DEFAULT '', summary_ar TEXT NOT NULL DEFAULT '',
  duration_min INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  requires_partner INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  starts_at INTEGER NOT NULL UNIQUE,
  duration_min INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS slots_starts ON slots(starts_at);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  slot_id INTEGER REFERENCES slots(id) ON DELETE SET NULL,
  slot_starts_at INTEGER,
  offering_id INTEGER REFERENCES offerings(id) ON DELETE SET NULL,
  offering_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','declined','cancelled','completed')),
  locale TEXT NOT NULL,
  format TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date TEXT NOT NULL,
  birth_time TEXT,
  birth_place TEXT NOT NULL,
  partner_name TEXT,
  partner_birth_date TEXT,
  partner_birth_time TEXT,
  partner_birth_place TEXT,
  question TEXT,
  admin_note TEXT,
  consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
-- A slot can only be held by one live booking at a time.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_live_slot
  ON bookings(slot_id) WHERE status IN ('pending','confirmed') AND slot_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bookings_status ON bookings(status, created_at);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  locale TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BLOB NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('fr','en','ar')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content_md TEXT NOT NULL DEFAULT '',
  cover_media_id TEXT REFERENCES media(id) ON DELETE SET NULL,
  cover_alt TEXT NOT NULL DEFAULT '',
  group_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (locale, slug)
);
CREATE INDEX IF NOT EXISTS articles_pub ON articles(locale, status, published_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
`,
  },
];
