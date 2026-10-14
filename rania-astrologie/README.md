# Rania · Astrologie — website

Multilingual (FR / EN / AR with full right-to-left support) website for Rania, certified astrologer — natal, psychological, relational and karmic astrology.

It's a complete product: the public site, an online booking system, a blog, a contact form, and a secure back-office where Rania manages everything herself.

> **Pour Rania :** la liste des informations à fournir est dans [`docs/INFOS-A-FOURNIR.md`](docs/INFOS-A-FOURNIR.md). Le guide d'utilisation de l'espace d'administration (en français) est dans [`docs/GUIDE-ADMIN.md`](docs/GUIDE-ADMIN.md). La proposition de réalisation (structure, étapes, délais, budget, maintenance) est dans [`docs/PROPOSITION.md`](docs/PROPOSITION.md).

---

## Highlights

**Experience**
- A real-time **WebGL cosmos** (three.js, hand-written shaders): a natal-chart astrolabe (360 degree ticks, houses, planets, aspect lines) that draws itself in. It sits on top of a twinkling starfield and a procedural nebula.
- **Scroll travel**: the camera flies through space as you scroll. Zodiac constellations draw in and procedural planets (a ringed gas giant, a cratered moon, an ice giant) drift past.
- **One scene per page**: two overlapping charts for synastry, the lunar-node axis for karmic astrology, a progression spiral, a close-up of the degree ring, healing pulses, and a glowing Moon for psychological astrology.
- An interactive **expertise constellation**, a **scroll-pinned method dial**, a ticker of exact planetary positions, a first-visit intro, smooth scrolling (Lenis), staggered text reveals and a cursor aura.
- Respects `prefers-reduced-motion`. Falls back to a static sky if WebGL is unavailable. Uses lower pixel ratio and fewer particles on phones.

**Features (from the brief)**
| Brief item | Where |
|---|---|
| Accueil, À propos, the 7 approaches, Tarifs & réservations, Contact | `/[locale]`, `/about`, `/consultations/[service]`, `/pricing`, `/contact` |
| FR / EN / AR + correct RTL | `src/i18n`, `src/content`, `dir="rtl"`, mirrored 3D scene |
| Online booking | 4-step wizard. Slots are shown in the visitor's time zone, birth data is collected (plus the partner's for synastry/composite), and the visitor gets a manage/cancel link by e-mail |
| Contact form + e-mail + WhatsApp | `/contact` and a floating WhatsApp button (number set in the admin) |
| Pricing | Stored in the database and edited in the admin |
| Articles | `/journal`, Markdown editor with preview, cover upload, translations linked across languages |
| Simple content management | `/admin` |
| Multilingual SEO | Per-page metadata, canonical + `hreflang`, `sitemap.xml`, `robots.txt`, Open Graph images on every page, visible breadcrumbs |
| AEO (answer engines) | FAQ on every consultation page plus a `/faq` page, written as short direct answers; a linked schema.org graph (WebSite, ProfessionalService, Person, Service with prices, FAQPage, BreadcrumbList, Article); `/llms.txt`; AI crawlers explicitly allowed |
| GDPR / secure data handling | Explicit consent, privacy policy + legal notice, retention purge, per-record deletion, no tracking cookies |

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`), **React 19**, **TypeScript**
- **Tailwind CSS 4**, self-hosted Google fonts (Cormorant Garamond, Manrope, Amiri, IBM Plex Sans Arabic)
- **three.js** (custom GLSL), **Lenis**
- **libSQL / SQLite** via `@libsql/client`: a local file in development, [Turso](https://turso.tech) in production (same code)
- **Zod** validation, **Nodemailer** (any SMTP provider), **marked** + **sanitize-html**

## Getting started (local)

Requires Node.js ≥ 22.6.

```bash
cd rania-astrologie
npm install
cp .env.example .env.local      # then edit: APP_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:seed -- --demo-slots # schema + 8 consultations + sample articles + admin + demo slots
npm run dev                     # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Without SMTP settings, e-mails are printed to the console instead of being sent.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint · TypeScript · unit tests (password hashing, validation, DST-safe time zones, markdown sanitisation, upload sniffing) |
| `npm run db:migrate` | Apply schema migrations (also runs automatically on first request) |
| `npm run db:seed` | Seed consultations, sample articles and the first admin. Only fills empty tables. Add `-- --demo-slots` for demo availability |
| `npm run admin:create` | Create an admin, or reset an admin's password, from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (signs out all of that admin's sessions) |

## Environment variables

See [`.env.example`](.env.example). Required in production:

| Variable | Notes |
|---|---|
| `SITE_URL` | Public URL, e.g. `https://rania-astrologie.com` (canonical URLs, sitemap, e-mail links) |
| `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | e.g. `libsql://rania-xxx.turso.io` + token |
| `APP_SECRET` | ≥ 32 random chars. Keys the HMAC for session and booking tokens. Rotating it signs everyone out and invalidates existing booking links |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASSWORD` `MAIL_FROM` | Transactional e-mail (Brevo, Resend SMTP, Mailjet, OVH, Gmail Workspace…) |
| `NOTIFY_EMAIL` | Where new bookings and messages are announced |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Only used by `db:seed` / `admin:create`. You can remove them afterwards |

## Client preview on Vercel (demo mode)

If the app runs on Vercel and `DATABASE_URL` is **not** set, it switches to **demo mode**:
- it uses a temporary SQLite file and seeds itself with the consultations, sample articles and a month of slots;
- it creates an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`;
- the admin shows a banner saying it is a demo;
- no e-mail is sent without SMTP settings.

Data is not durable (it resets when the function instance is recycled), so use this only for previews. For a preview, set only `APP_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, plus `SITE_URL` once the domain is known.

## Deployment (recommended: Vercel + Turso)

1. **Database:** create a Turso database (`turso db create rania`), then get the URL (`turso db show rania --url`) and a token (`turso db tokens create rania`).
2. **Hosting:** import the repository in Vercel and set **Root Directory** to `rania-astrologie`. Add every environment variable listed above. Note that Vercel's free Hobby plan is for non-commercial use, so a business site needs the Pro plan; any Node host works too (see below).
3. **First admin + content:** from your machine, run
   `DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed`
   (without `--demo-slots`). Rania then opens her real slots in the admin.
4. **Domain:** add the domain in Vercel. HTTPS is automatic. HSTS and `upgrade-insecure-requests` turn on once `SITE_URL` starts with `https://`.
5. **E-mail deliverability:** set up SPF, DKIM and DMARC for the sending domain with your SMTP provider.
6. Submit `https://<domain>/sitemap.xml` in Google Search Console.

**Self-hosting** (VPS, Docker, Render…): `npm ci && npm run build && npm start`. With `DATABASE_URL=file:/var/data/rania.db`, keep that file on a persistent disk and back it up. Put the app behind a reverse proxy that sets `X-Forwarded-For`, because rate limiting keys on it.

## Security

- **Strict CSP** with a per-request nonce (`src/proxy.ts`): no inline scripts, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`. Also HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, and no `X-Powered-By`.
- **Admin auth**:
  - Passwords are hashed with scrypt (N=2¹⁵), with a minimum strength policy.
  - Sessions are random 256-bit tokens. Only their HMAC is stored. The cookie is `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, with a 7-day sliding expiry.
  - Login is rate-limited per IP and per account. Timing is equalised for unknown accounts. Changing the password rotates sessions, and the settings page has a "sign out everywhere" button.
- **Every admin page and every admin Server Action** re-checks the session on the server. The redirect in `proxy.ts` is only an optimisation. Server Actions also get Next's built-in Origin check (CSRF).
- **Public forms**: Zod validation, a honeypot plus a time-trap against bots, DB-backed rate limits that also work on serverless, and CR/LF stripping on anything that goes into e-mail headers.
- **Bookings**:
  - Double booking is prevented atomically by a partial unique index.
  - Manage links carry a 256-bit token, stored hashed, and the manage page is `noindex` / `no-referrer`.
  - IP addresses are never stored in clear.
- **Content**: Markdown is sanitised server-side (admin content included). Uploads are type-checked by magic bytes (not the declared MIME type), size-capped, and served with `Content-Security-Policy: sandbox`.
- **SQL**: parameterised queries only.

## Project structure

```
src/
  proxy.ts                  locale negotiation, CSP nonce, admin gate
  app/
    [locale]/…              public site (root layout per locale: lang/dir, fonts, cosmos)
    admin/…                 back-office (separate root layout, noindex)
    actions/public.ts       contact, booking, cancellation (Server Actions)
    actions/admin.ts        all admin mutations (each calls requireAdmin)
    media/[id]/route.ts     uploaded images
    sitemap.ts robots.ts manifest.ts global-not-found.tsx
  components/cosmos/        three.js engine, scene modes per page, chart data
  components/home/          constellation, method dial, ticker
  components/forms/         booking wizard, contact, cancel
  content/services/{fr,en,ar}.ts   the seven approaches (long-form copy)
  content/legal.ts          privacy policy + legal notice (filled from settings)
  i18n/dictionaries/{fr,en,ar}.ts  UI copy
  lib/                      db, auth, security, rate limit, mail, settings, time, validation, repos
scripts/                    migrate, seed, create-admin
tests/                      node:test unit tests
docs/                       admin guide (FR) + project proposal (FR)
```

## Before launch: placeholders to replace

- [ ] **Legal identity**: name, address, SIRET, host. Edit in **Admin → Paramètres**; the legal pages update automatically.
- [ ] **Contact e-mail and WhatsApp number**: Admin → Paramètres. The defaults are placeholders.
- [ ] **Prices and durations**: Admin → Consultations & tarifs. The seeded prices are examples.
- [ ] **Time zone and cancellation window**: Admin → Paramètres (defaults: Europe/Paris, 48 h).
- [ ] **Rania's portrait**: the About page shows an engraved orbit illustration. Swap in a photo in `src/app/[locale]/about/page.tsx` if she wants one.
- [ ] Have a native speaker proofread the **Arabic** copy.
- [ ] Remove the demo slots and sample articles if you don't keep them.
