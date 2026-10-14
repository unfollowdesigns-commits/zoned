"use server";

import { isLocale, type Locale } from "@/i18n/config";
import { sendBookingReceived, sendBookingStatus, sendCancellationNotice, sendContactNotifications } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { createBooking, getBookingByToken, setBookingStatus } from "@/lib/repo/bookings";
import { createMessage } from "@/lib/repo/messages";
import { getOffering } from "@/lib/repo/offerings";
import { clientFingerprint } from "@/lib/security";
import { getSettings } from "@/lib/settings";
import { bookingSchema, contactSchema, fieldErrors, formObject, looksLikeBot, type FieldErrors } from "@/lib/validation";

export type FormState =
  | { status: "idle" }
  | { status: "error"; error: "invalid" | "rateLimited" | "generic" | "slotTaken"; fields?: FieldErrors }
  | { status: "success"; ref?: string; manageUrl?: string };

const localeOf = (fd: FormData): Locale => {
  const l = fd.get("locale");
  return isLocale(l) ? l : "fr";
};

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  // Bots get a fake success so they learn nothing.
  if (looksLikeBot(fd)) return { status: "success" };
  if (!(await rateLimit(`contact:${await clientFingerprint()}`, 5, 60 * 60 * 1000)))
    return { status: "error", error: "rateLimited" };

  const parsed = contactSchema.safeParse(formObject(fd));
  if (!parsed.success) return { status: "error", error: "invalid", fields: fieldErrors(parsed.error) };

  const locale = localeOf(fd);
  const d = parsed.data;
  try {
    await createMessage({ name: d.name, email: d.email, phone: d.phone, subject: d.subject, body: d.message, locale });
    await sendContactNotifications({ name: d.name, email: d.email, phone: d.phone, subject: d.subject, body: d.message, locale });
    return { status: "success" };
  } catch (e) {
    console.error("[contact]", e);
    return { status: "error", error: "generic" };
  }
}

export async function submitBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  if (looksLikeBot(fd)) return { status: "success", ref: "RA-0000-0000" };
  if (!(await rateLimit(`booking:${await clientFingerprint()}`, 6, 60 * 60 * 1000)))
    return { status: "error", error: "rateLimited" };

  const raw = formObject(fd);
  if (raw.birthTimeUnknown === "on") raw.birthTime = "";
  if (raw.partnerBirthTimeUnknown === "on") raw.partnerBirthTime = "";
  for (const k of ["phone", "partnerName", "partnerBirthDate", "partnerBirthTime", "partnerBirthPlace", "question", "birthTime"])
    raw[k] ??= "";

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", error: "invalid", fields: fieldErrors(parsed.error) };
  const d = parsed.data;

  const offering = await getOffering(d.offeringId);
  if (!offering || !offering.active) return { status: "error", error: "invalid", fields: { offeringId: "offering" } };

  if (offering.requiresPartner) {
    const missing: FieldErrors = {};
    if (!d.partnerName) missing.partnerName = "required";
    if (!d.partnerBirthDate) missing.partnerBirthDate = "required";
    if (!d.partnerBirthPlace) missing.partnerBirthPlace = "required";
    if (Object.keys(missing).length) return { status: "error", error: "invalid", fields: missing };
  }

  const locale = localeOf(fd);
  try {
    const res = await createBooking({
      slotId: d.slotId,
      offeringId: offering.id,
      offeringName: offering.name[locale],
      priceCents: offering.priceCents,
      currency: offering.currency,
      locale,
      format: d.format,
      name: d.name,
      email: d.email,
      phone: d.phone,
      birthDate: d.birthDate,
      birthTime: d.birthTime,
      birthPlace: d.birthPlace,
      partnerName: offering.requiresPartner ? d.partnerName : null,
      partnerBirthDate: offering.requiresPartner ? d.partnerBirthDate : null,
      partnerBirthTime: offering.requiresPartner ? d.partnerBirthTime : null,
      partnerBirthPlace: offering.requiresPartner ? d.partnerBirthPlace : null,
      question: d.question,
    });
    if (!res.ok) return { status: "error", error: "slotTaken", fields: { slotId: "slot" } };
    const settings = await getSettings();
    await sendBookingReceived(res.booking, res.token, settings.timezone);
    return { status: "success", ref: res.booking.ref, manageUrl: `/${locale}/reservation/${res.token}` };
  } catch (e) {
    console.error("[booking]", e);
    return { status: "error", error: "generic" };
  }
}

export type CancelState = { status: "idle" | "cancelled" | "tooLate" | "invalid" | "rateLimited" };

export async function cancelBookingByToken(_prev: CancelState, fd: FormData): Promise<CancelState> {
  if (!(await rateLimit(`cancel:${await clientFingerprint()}`, 10, 60 * 60 * 1000))) return { status: "rateLimited" };
  const token = String(fd.get("token") ?? "");
  const booking = await getBookingByToken(token);
  if (!booking || !["pending", "confirmed"].includes(booking.status)) return { status: "invalid" };
  const settings = await getSettings();
  const hours = Number(settings.cancellation_hours) || 48;
  if (booking.startsAt && booking.startsAt - Date.now() < hours * 3600 * 1000) return { status: "tooLate" };
  await setBookingStatus(booking.id, "cancelled");
  const updated = { ...booking, status: "cancelled" as const };
  await Promise.all([sendBookingStatus(updated, settings.timezone), sendCancellationNotice(updated, settings.timezone)]);
  return { status: "cancelled" };
}
