import { z } from "zod";

// Messages are error *codes*, translated client-side via dictionary.forms.errors.
export type ErrorCode = "required" | "email" | "tooLong" | "date" | "consent" | "slot" | "offering";

const text = (min: number, max: number) =>
  z.string().trim().min(min, "required").max(max, "tooLong");

const optionalText = (max: number) =>
  z.string().trim().max(max, "tooLong").transform((v) => (v === "" ? null : v));

const phone = z
  .string()
  .trim()
  .max(40, "tooLong")
  .regex(/^[+0-9 ().-]*$/, "required")
  .transform((v) => (v === "" ? null : v));

const email = z.string().trim().max(160, "tooLong").pipe(z.email("email")).transform((v) => v.toLowerCase());

const birthDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.getUTCFullYear() >= 1900 && d.getTime() <= Date.now();
  }, "date");

const birthTime = z
  .string()
  .trim()
  .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, "date")
  .transform((v) => (v === "" ? null : v));

const consent = z.literal("on", { error: "consent" });

export const contactSchema = z.object({
  name: text(2, 100),
  email,
  phone,
  subject: z.enum(["consultation", "question", "other"], { error: "required" }),
  message: text(10, 5000),
  consent,
});

export const bookingSchema = z
  .object({
    offeringId: z.coerce.number({ error: "offering" }).int().positive("offering"),
    slotId: z.coerce.number({ error: "slot" }).int().positive("slot"),
    name: text(2, 100),
    email,
    phone,
    format: z.enum(["video", "phone", "whatsapp"], { error: "required" }),
    birthDate,
    birthTime,
    birthPlace: text(2, 120),
    partnerName: optionalText(100),
    partnerBirthDate: z.string().trim().transform((v) => (v === "" ? null : v)),
    partnerBirthTime: birthTime,
    partnerBirthPlace: optionalText(120),
    question: optionalText(3000),
    consent,
  })
  .superRefine((v, ctx) => {
    if (v.partnerBirthDate !== null && !birthDate.safeParse(v.partnerBirthDate).success) {
      ctx.addIssue({ code: "custom", path: ["partnerBirthDate"], message: "date" });
    }
  });

export type FieldErrors = Partial<Record<string, ErrorCode>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = (issue.message as ErrorCode) ?? "required";
  }
  return out;
}

/** Reads a FormData into a plain object of strings (files ignored). */
export function formObject(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") o[k] = v;
  return o;
}

/** Spam heuristics: hidden honeypot must stay empty, form must not be submitted instantly. */
export function looksLikeBot(fd: FormData): boolean {
  const honeypot = fd.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  const started = Number(fd.get("_t"));
  if (!Number.isFinite(started) || Date.now() - started < 2500) return true;
  return false;
}
