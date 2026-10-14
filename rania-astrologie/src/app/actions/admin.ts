"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroyAllSessions, destroySession, requireAdmin } from "@/lib/auth";
import { one, run, num, str } from "@/lib/db";
import { sendBookingStatus } from "@/lib/mail";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/password";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { saveArticle, deleteArticle as removeArticle, getArticle, slugify } from "@/lib/repo/articles";
import { bookingStatuses, deleteBooking as removeBooking, getBooking, purgeOlderThan, setBookingNote, setBookingStatus } from "@/lib/repo/bookings";
import { deleteMedia, saveMedia } from "@/lib/repo/media";
import { deleteMessage as removeMessage, setMessageRead } from "@/lib/repo/messages";
import { deleteOffering as removeOffering, saveOffering } from "@/lib/repo/offerings";
import { addSlots, deletePastSlots, deleteSlot as removeSlot } from "@/lib/repo/slots";
import { clientFingerprint } from "@/lib/security";
import { getSettings, saveSettings, settingDefaults, type SettingKey } from "@/lib/settings";
import { isValidTimeZone, zonedToUtc } from "@/lib/time";
import { serviceKeys } from "@/content/services/types";

const id = (fd: FormData, key = "id") => {
  const n = Number(fd.get(key));
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
};
const s = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const done = (path: string, query = "ok=1"): never => {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}${query}`);
};

// ───────────────────────── Auth ─────────────────────────

export type LoginState = { error?: string };

// A real scrypt hash of a random value: used to keep timing identical for unknown e-mails.
const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$" + "A".repeat(86);

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = s(fd, "email").toLowerCase().slice(0, 160);
  const password = String(fd.get("password") ?? "").slice(0, 256);
  const ipKey = `login:ip:${await clientFingerprint()}`;
  const emailKey = `login:email:${email}`;
  const [ipOk, emailOk] = await Promise.all([rateLimit(ipKey, 10, 15 * 60_000), rateLimit(emailKey, 6, 15 * 60_000)]);
  if (!ipOk || !emailOk) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };

  const admin = await one("SELECT id, password_hash FROM admins WHERE email = ?", [email], (r) => ({
    id: num(r.id),
    hash: str(r.password_hash),
  }));
  const valid = await verifyPassword(password, admin?.hash ?? DUMMY_HASH).catch(() => false);
  if (!admin || !valid) return { error: "Identifiants incorrects." };

  await resetRateLimit(emailKey);
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(fd: FormData) {
  const admin = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const row = await one("SELECT password_hash FROM admins WHERE id = ?", [admin.id], (r) => str(r.password_hash));
  if (!row || !(await verifyPassword(current, row))) done("/admin/parametres", "error=current");
  if (next !== confirm) done("/admin/parametres", "error=confirm");
  const policy = passwordPolicyError(next);
  if (policy) done("/admin/parametres", `error=${encodeURIComponent(policy)}`);
  await run("UPDATE admins SET password_hash = ? WHERE id = ?", [await hashPassword(next), admin.id]);
  // Invalidate every other session, then start a fresh one here.
  await destroyAllSessions(admin.id);
  await createSession(admin.id);
  done("/admin/parametres", "ok=password");
}

export async function logoutEverywhere() {
  const admin = await requireAdmin();
  await destroyAllSessions(admin.id);
  redirect("/admin/login");
}

// ───────────────────────── Bookings ─────────────────────────

export async function updateBookingStatus(fd: FormData) {
  await requireAdmin();
  const bookingId = id(fd);
  const status = s(fd, "status");
  if (!(bookingStatuses as readonly string[]).includes(status)) throw new Error("Invalid status");
  const note = s(fd, "note").slice(0, 3000) || null;
  const notify = fd.get("notify") === "on";
  const booking = await getBooking(bookingId);
  if (!booking) done("/admin/reservations", "error=notfound");
  await setBookingStatus(bookingId, status as (typeof bookingStatuses)[number], note);
  if (notify && ["confirmed", "declined", "cancelled"].includes(status)) {
    const settings = await getSettings();
    await sendBookingStatus({ ...booking!, status: status as "confirmed" }, settings.timezone, note);
  }
  done(`/admin/reservations/${bookingId}`);
}

export async function saveBookingNote(fd: FormData) {
  await requireAdmin();
  const bookingId = id(fd);
  await setBookingNote(bookingId, s(fd, "note").slice(0, 3000) || null);
  done(`/admin/reservations/${bookingId}`);
}

export async function deleteBooking(fd: FormData) {
  await requireAdmin();
  await removeBooking(id(fd));
  done("/admin/reservations", "ok=deleted");
}

// ───────────────────────── Slots ─────────────────────────

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export async function addSingleSlot(fd: FormData) {
  await requireAdmin();
  const date = s(fd, "date");
  const time = s(fd, "time");
  const duration = Math.min(480, Math.max(15, Number(fd.get("duration")) || 90));
  if (!dateRe.test(date) || !timeRe.test(time)) done("/admin/creneaux", "error=format");
  const { timezone } = await getSettings();
  const ts = zonedToUtc(date, time, timezone);
  if (ts < Date.now()) done("/admin/creneaux", "error=past");
  const n = await addSlots([ts], duration);
  done("/admin/creneaux", `ok=${n}`);
}

export async function generateSlots(fd: FormData) {
  await requireAdmin();
  const from = s(fd, "from");
  const to = s(fd, "to");
  const days = fd.getAll("days").map(Number).filter((d) => d >= 0 && d <= 6);
  const times = s(fd, "times").split(/[,\s;]+/).filter(Boolean);
  const duration = Math.min(480, Math.max(15, Number(fd.get("duration")) || 90));
  if (!dateRe.test(from) || !dateRe.test(to) || !days.length || !times.length || times.some((t) => !timeRe.test(t)))
    done("/admin/creneaux", "error=format");
  const { timezone } = await getSettings();
  const start = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (spanDays < 0 || spanDays > 180) done("/admin/creneaux", "error=range");
  const stamps: number[] = [];
  for (let i = 0; i <= spanDays; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    if (!days.includes(d.getUTCDay())) continue;
    const date = d.toISOString().slice(0, 10);
    for (const t of times) {
      const ts = zonedToUtc(date, t, timezone);
      if (ts > Date.now()) stamps.push(ts);
    }
  }
  const n = await addSlots(stamps.slice(0, 1000), duration);
  done("/admin/creneaux", `ok=${n}`);
}

export async function deleteSlot(fd: FormData) {
  await requireAdmin();
  const ok = await removeSlot(id(fd));
  done("/admin/creneaux", ok ? "ok=deleted" : "error=booked");
}

export async function cleanPastSlots() {
  await requireAdmin();
  await deletePastSlots();
  done("/admin/creneaux", "ok=cleaned");
}

// ───────────────────────── Offerings ─────────────────────────

const offeringSchema = z.object({
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/),
  serviceKey: z.enum(serviceKeys),
  name_fr: z.string().trim().min(2).max(120),
  name_en: z.string().trim().min(2).max(120),
  name_ar: z.string().trim().min(2).max(120),
  summary_fr: z.string().trim().max(400),
  summary_en: z.string().trim().max(400),
  summary_ar: z.string().trim().max(400),
  duration: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().min(0).max(100000),
  currency: z.string().trim().regex(/^[A-Z]{3}$/),
  sort: z.coerce.number().int().min(0).max(999),
});

export async function upsertOffering(fd: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = offeringSchema.safeParse(raw);
  if (!parsed.success) done("/admin/consultations", `error=${encodeURIComponent(parsed.error.issues[0]?.path.join(".") ?? "form")}`);
  const d = parsed.data!;
  const existing = fd.get("id") ? id(fd) : null;
  try {
    await saveOffering(existing, {
      slug: d.slug,
      serviceKey: d.serviceKey,
      name: { fr: d.name_fr, en: d.name_en, ar: d.name_ar },
      summary: { fr: d.summary_fr, en: d.summary_en, ar: d.summary_ar },
      durationMin: d.duration,
      priceCents: Math.round(d.price * 100),
      currency: d.currency,
      requiresPartner: fd.get("requiresPartner") === "on",
      active: fd.get("active") === "on",
      sort: d.sort,
    });
  } catch {
    done("/admin/consultations", "error=slug");
  }
  done("/admin/consultations");
}

export async function deleteOffering(fd: FormData) {
  await requireAdmin();
  await removeOffering(id(fd));
  done("/admin/consultations", "ok=deleted");
}

// ───────────────────────── Articles ─────────────────────────

const articleSchema = z.object({
  locale: z.enum(["fr", "en", "ar"]),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(90),
  excerpt: z.string().trim().max(600),
  content: z.string().max(100_000),
  coverAlt: z.string().trim().max(200),
  groupKey: z.string().trim().max(60),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().trim(),
});

export async function upsertArticle(fd: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = articleSchema.safeParse(raw);
  const existingId = fd.get("id") ? id(fd) : null;
  const back = existingId ? `/admin/articles/${existingId}` : "/admin/articles/new";
  if (!parsed.success) done(back, `error=${encodeURIComponent(parsed.error.issues[0]?.path.join(".") ?? "form")}`);
  const d = parsed.data!;

  const existing = existingId ? await getArticle(existingId) : null;
  let coverMediaId = existing?.coverMediaId ?? null;
  const file = fd.get("cover");
  if (file instanceof File && file.size > 0) {
    const saved = await saveMedia(file);
    if ("error" in saved) done(back, `error=${encodeURIComponent(saved.error)}`);
    if (coverMediaId) await deleteMedia(coverMediaId);
    coverMediaId = (saved as { id: string }).id;
  }
  if (fd.get("removeCover") === "on" && coverMediaId) {
    await deleteMedia(coverMediaId);
    coverMediaId = null;
  }

  const slug = slugify(d.slug || d.title) || `article-${Date.now()}`;
  let publishedAt: number | null = existing?.publishedAt ?? null;
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(d.publishedAt);
  if (m) publishedAt = zonedToUtc(m[1], m[2], (await getSettings()).timezone);
  if (d.status === "published" && !publishedAt) publishedAt = Date.now();

  const res = await saveArticle(existingId, {
    locale: d.locale,
    slug,
    title: d.title,
    excerpt: d.excerpt,
    contentMd: d.content,
    coverMediaId,
    coverAlt: d.coverAlt,
    groupKey: d.groupKey ? slugify(d.groupKey) : null,
    status: d.status,
    publishedAt,
  });
  if (!res.ok) done(back, "error=slug");
  done(`/admin/articles/${(res as { id: number }).id}`);
}

export async function deleteArticle(fd: FormData) {
  await requireAdmin();
  const articleId = id(fd);
  const a = await getArticle(articleId);
  if (a?.coverMediaId) await deleteMedia(a.coverMediaId);
  await removeArticle(articleId);
  done("/admin/articles", "ok=deleted");
}

// ───────────────────────── Messages ─────────────────────────

export async function toggleMessageRead(fd: FormData) {
  await requireAdmin();
  await setMessageRead(id(fd), fd.get("read") === "1");
  done("/admin/messages");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  await removeMessage(id(fd));
  done("/admin/messages", "ok=deleted");
}

// ───────────────────────── Settings ─────────────────────────

export async function updateSettings(fd: FormData) {
  await requireAdmin();
  const values: Partial<Record<SettingKey, string>> = {};
  for (const key of Object.keys(settingDefaults) as SettingKey[]) {
    const v = fd.get(key);
    if (typeof v === "string") values[key] = v.trim().slice(0, 500);
  }
  if (values.timezone && !isValidTimeZone(values.timezone)) done("/admin/parametres", "error=timezone");
  if (values.contact_email && !z.email().safeParse(values.contact_email).success) done("/admin/parametres", "error=email");
  if (values.whatsapp) values.whatsapp = values.whatsapp.replace(/[^\d]/g, "");
  for (const k of ["cancellation_hours", "retention_months"] as const)
    if (values[k] && !/^\d{1,4}$/.test(values[k]!)) done("/admin/parametres", `error=${k}`);
  await saveSettings(values);
  done("/admin/parametres");
}

export async function purgeOldData() {
  await requireAdmin();
  const { retention_months } = await getSettings();
  const r = await purgeOlderThan(Number(retention_months) || 24);
  done("/admin/parametres", `ok=purged&b=${r.bookings}&m=${r.messages}`);
}
