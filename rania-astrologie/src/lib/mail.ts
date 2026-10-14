import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Locale } from "@/i18n/config";
import { env } from "./env";
import type { Booking } from "./repo/bookings";
import { formatDateTime, formatPrice } from "./time";

let transporter: Transporter | null = null;
function transport(): Transporter | null {
  if (!env.smtp.host) return null;
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
  return transporter;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Strip CR/LF so user input can never inject e-mail headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 200);

function layout(body: string, dir: "ltr" | "rtl" = "ltr"): string {
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#0b0c16;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#efe7da">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#12131f;border:1px solid #2a2a3d;border-radius:14px">
  <tr><td style="padding:32px 32px 8px;text-align:center;letter-spacing:.3em;font-size:12px;color:#c9a96e">RANIA</td></tr>
  <tr><td style="padding:8px 32px 32px;font-size:16px;line-height:1.6">${body}</td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, replyTo?: string): Promise<void> {
  const t = transport();
  const msg = { from: env.mailFrom, to, subject: oneLine(subject), html, replyTo: replyTo ? oneLine(replyTo) : undefined };
  if (!t) {
    console.info(`[mail:dev] → ${to} · ${msg.subject}`);
    return;
  }
  try {
    await t.sendMail(msg);
  } catch (e) {
    // E-mail failures must never break the user flow — the data is already safely stored.
    console.error("[mail] send failed:", e instanceof Error ? e.message : e);
  }
}

const T = {
  fr: {
    receivedSubject: (ref: string) => `Votre demande de consultation (${ref})`,
    hello: (n: string) => `Bonjour ${n},`,
    received: "Merci pour votre confiance. Votre demande est bien enregistrée et votre créneau est réservé en attente de confirmation. Je reviens vers vous personnellement très prochainement.",
    confirmedSubject: (ref: string) => `Consultation confirmée (${ref})`,
    confirmed: "J'ai le plaisir de vous confirmer notre rendez-vous.",
    declinedSubject: (ref: string) => `Votre demande de consultation (${ref})`,
    declined: "Je suis désolée, ce créneau ne peut finalement pas être maintenu. N'hésitez pas à choisir une autre date sur le site ou à me répondre directement.",
    cancelledSubject: (ref: string) => `Annulation de votre demande (${ref})`,
    cancelled: "Votre demande a bien été annulée.",
    details: "Récapitulatif", consultation: "Consultation", date: "Date", price: "Tarif", ref: "Référence",
    manage: "Suivre ou gérer ma demande", note: "Message de Rania", sign: "Belle journée,<br>Rania",
    contactAckSubject: "Votre message a bien été reçu",
    contactAck: "Merci pour votre message. Je vous réponds personnellement dans les meilleurs délais.",
  },
  en: {
    receivedSubject: (ref: string) => `Your consultation request (${ref})`,
    hello: (n: string) => `Hello ${n},`,
    received: "Thank you for your trust. Your request has been recorded and your time slot is held pending confirmation. I will get back to you personally very soon.",
    confirmedSubject: (ref: string) => `Consultation confirmed (${ref})`,
    confirmed: "I am pleased to confirm our appointment.",
    declinedSubject: (ref: string) => `Your consultation request (${ref})`,
    declined: "I am sorry, this time slot cannot be kept after all. Feel free to choose another date on the website or reply to me directly.",
    cancelledSubject: (ref: string) => `Your request has been cancelled (${ref})`,
    cancelled: "Your request has been cancelled.",
    details: "Summary", consultation: "Consultation", date: "Date", price: "Fee", ref: "Reference",
    manage: "Track or manage my request", note: "Message from Rania", sign: "Warm wishes,<br>Rania",
    contactAckSubject: "Your message has been received",
    contactAck: "Thank you for your message. I will reply personally as soon as possible.",
  },
  ar: {
    receivedSubject: (ref: string) => `طلب استشارتك (${ref})`,
    hello: (n: string) => `مرحبًا ${n}،`,
    received: "شكرًا لثقتك. تمّ تسجيل طلبك وموعدك محجوز في انتظار التأكيد. سأتواصل معك شخصيًا قريبًا جدًا.",
    confirmedSubject: (ref: string) => `تأكيد الاستشارة (${ref})`,
    confirmed: "يسعدني أن أؤكّد لك موعدنا.",
    declinedSubject: (ref: string) => `طلب استشارتك (${ref})`,
    declined: "يؤسفني أنه تعذّر الإبقاء على هذا الموعد. يمكنك اختيار تاريخ آخر عبر الموقع أو الردّ عليّ مباشرة.",
    cancelledSubject: (ref: string) => `إلغاء طلبك (${ref})`,
    cancelled: "تمّ إلغاء طلبك.",
    details: "الملخّص", consultation: "الاستشارة", date: "الموعد", price: "السعر", ref: "المرجع",
    manage: "متابعة طلبي أو إدارته", note: "رسالة من رانيا", sign: "مع أطيب التمنيات،<br>رانيا",
    contactAckSubject: "تمّ استلام رسالتك",
    contactAck: "شكرًا لرسالتك. سأردّ عليك شخصيًا في أقرب وقت.",
  },
} satisfies Record<Locale, unknown>;

function summary(b: Booking, tz: string, manageUrl?: string): string {
  const t = T[b.locale];
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#a49c8f;width:40%">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`;
  return `<p style="margin:24px 0 8px;color:#c9a96e;font-size:13px;letter-spacing:.15em;text-transform:uppercase">${t.details}</p>
  <table role="presentation" width="100%" style="font-size:15px;border-top:1px solid #2a2a3d">
  ${row(t.ref, b.ref)}${row(t.consultation, b.offeringName)}
  ${b.startsAt ? row(t.date, `${formatDateTime(b.startsAt, b.locale, tz)} (${tz})`) : ""}
  ${row(t.price, formatPrice(b.priceCents, b.currency, b.locale))}</table>
  ${manageUrl ? `<p style="margin:28px 0 0;text-align:center"><a href="${esc(manageUrl)}" style="display:inline-block;padding:12px 22px;border:1px solid #c9a96e;border-radius:999px;color:#efe7da;text-decoration:none">${t.manage}</a></p>` : ""}`;
}

const dir = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

export async function sendBookingReceived(b: Booking, token: string, tz: string) {
  const t = T[b.locale];
  const url = `${env.siteUrl}/${b.locale}/reservation/${token}`;
  await send(b.email, t.receivedSubject(b.ref),
    layout(`<p>${t.hello(esc(b.name))}</p><p>${t.received}</p>${summary(b, tz, url)}<p style="margin-top:28px">${t.sign}</p>`, dir(b.locale)));
  if (env.notifyEmail) {
    const lines = [
      ["Client", `${b.name} <${b.email}>${b.phone ? ` · ${b.phone}` : ""}`],
      ["Consultation", b.offeringName],
      ["Date", b.startsAt ? formatDateTime(b.startsAt, "fr", tz) : "—"],
      ["Format", b.format],
      ["Naissance", `${b.birthDate} ${b.birthTime ?? "(heure inconnue)"} — ${b.birthPlace}`],
      ...(b.partnerName ? [["Partenaire", `${b.partnerName} · ${b.partnerBirthDate ?? ""} ${b.partnerBirthTime ?? "(heure inconnue)"} — ${b.partnerBirthPlace ?? ""}`]] : []),
      ["Question", b.question ?? "—"],
    ];
    await send(env.notifyEmail, `Nouvelle demande · ${b.offeringName} · ${b.ref}`,
      layout(`<p>Nouvelle demande de consultation.</p><table style="font-size:14px">${lines
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#a49c8f;vertical-align:top">${k}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
        .join("")}</table><p><a style="color:#c9a96e" href="${env.siteUrl}/admin/reservations/${b.id}">Ouvrir dans l'administration</a></p>`),
      b.email);
  }
}

export async function sendBookingStatus(b: Booking, tz: string, note?: string | null) {
  const t = T[b.locale];
  const text = b.status === "confirmed" ? t.confirmed : b.status === "declined" ? t.declined : t.cancelled;
  const subject = b.status === "confirmed" ? t.confirmedSubject(b.ref) : b.status === "declined" ? t.declinedSubject(b.ref) : t.cancelledSubject(b.ref);
  const noteHtml = note ? `<p style="margin-top:20px;padding:16px;border-inline-start:2px solid #c9a96e;background:#0f1019;white-space:pre-wrap"><span style="color:#c9a96e;font-size:13px">${t.note}</span><br>${esc(note)}</p>` : "";
  await send(b.email, subject, layout(`<p>${t.hello(esc(b.name))}</p><p>${text}</p>${noteHtml}${summary(b, tz)}<p style="margin-top:28px">${t.sign}</p>`, dir(b.locale)));
}

export async function sendCancellationNotice(b: Booking, tz: string) {
  if (!env.notifyEmail) return;
  await send(env.notifyEmail, `Annulation client · ${b.ref}`,
    layout(`<p>${esc(b.name)} a annulé sa demande « ${esc(b.offeringName)} »${b.startsAt ? ` du ${esc(formatDateTime(b.startsAt, "fr", tz))}` : ""}. Le créneau est de nouveau disponible.</p>`));
}

export async function sendContactNotifications(m: { name: string; email: string; phone: string | null; subject: string; body: string; locale: Locale }) {
  if (env.notifyEmail) {
    await send(env.notifyEmail, `Nouveau message · ${m.subject}`,
      layout(`<p><strong>${esc(m.name)}</strong> &lt;${esc(m.email)}&gt;${m.phone ? ` · ${esc(m.phone)}` : ""}</p><p style="white-space:pre-wrap">${esc(m.body)}</p>`),
      m.email);
  }
  const t = T[m.locale];
  await send(m.email, t.contactAckSubject, layout(`<p>${t.hello(esc(m.name))}</p><p>${t.contactAck}</p><p style="margin-top:28px">${t.sign}</p>`, dir(m.locale)));
}
