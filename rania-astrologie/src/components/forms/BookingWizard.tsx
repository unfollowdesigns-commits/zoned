"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { submitBooking, type FormState } from "@/app/actions/public";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { Check } from "@/components/Check";

export type WizardOffering = { id: number; name: string; summary: string; duration: number; price: string; requiresPartner: boolean };
export type WizardSlot = { id: number; startsAt: number; durationMin: number };

type Props = {
  locale: Locale;
  t: Dictionary["booking"];
  errors: Dictionary["forms"]["errors"];
  common: Dictionary["common"];
  offerings: WizardOffering[];
  slots: WizardSlot[];
  initialOfferingId?: number;
  contactHref: string;
};

const intlLocale = { fr: "fr-FR", en: "en-GB", ar: "ar" } as const;
const noopSubscribe = () => () => {};
const initialState: FormState = { status: "idle" };

export function BookingWizard({ locale, t, errors, common, offerings, slots, initialOfferingId, contactHref }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitBooking, initialState);
  const [step, setStep] = useState(initialOfferingId && offerings.some((o) => o.id === initialOfferingId) ? 1 : 0);
  const [offeringId, setOfferingId] = useState<number | null>(
    initialOfferingId && offerings.some((o) => o.id === initialOfferingId) ? initialOfferingId : offerings[0]?.id ?? null,
  );
  const [slotId, setSlotId] = useState<number | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const topRef = useRef<HTMLDivElement>(null);
  const stepChanged = useRef(false);

  // Slot times depend on the visitor's time zone, so they render on the client only.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const offering = offerings.find((o) => o.id === offeringId) ?? null;
  const fe = state.status === "error" ? state.fields ?? {} : {};
  const err = (k: string) => (fe[k] ? errors[fe[k] as keyof typeof errors] : null);

  // Server said the slot was taken → send the visitor back to pick another one.
  const [handled, setHandled] = useState<FormState>(initialState);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "error" && state.error === "slotTaken") {
      setSlotId(null);
      setStep(1);
    } else if (state.status === "error" && (fe.offeringId || fe.slotId)) {
      setStep(fe.offeringId ? 0 : 1);
    } else if (state.status === "success") {
      setStep(3);
    }
  }

  useEffect(() => {
    // Skip the initial render so arriving on the page doesn't jump to the form.
    if (!stepChanged.current) {
      stepChanged.current = true;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }, [step]);

  const tz = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const byDay = useMemo(() => {
    if (!mounted) return [] as { key: string; label: string; items: WizardSlot[] }[];
    const fmtDay = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", day: "numeric", month: "short", numberingSystem: "latn" });
    const keyFmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
    const map = new Map<string, { key: string; label: string; items: WizardSlot[] }>();
    for (const s of slots) {
      const d = new Date(s.startsAt);
      const key = keyFmt.format(d);
      if (!map.has(key)) map.set(key, { key, label: fmtDay.format(d), items: [] });
      map.get(key)!.items.push(s);
    }
    return [...map.values()];
  }, [slots, locale, mounted]);
  const activeDay = day ?? byDay[0]?.key ?? null;
  const fmtTime = (ts: number) =>
    new Intl.DateTimeFormat(intlLocale[locale], { hour: "2-digit", minute: "2-digit", numberingSystem: "latn" }).format(new Date(ts));
  const fmtFull = (ts: number) =>
    new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", numberingSystem: "latn" }).format(new Date(ts));
  const slot = slots.find((s) => s.id === slotId) ?? null;

  const next = () => {
    setLocalError(null);
    if (step === 0 && !offeringId) return setLocalError(errors.offering);
    if (step === 1 && !slotId) return setLocalError(errors.slot);
    setStep((s) => Math.min(2, s + 1));
  };

  if (state.status === "success") {
    return (
      <div ref={topRef} className="card scroll-mt-32 p-8 text-center md:p-14" aria-live="polite">
        <Check className="mx-auto h-16 w-16 text-gold-bright" />
        <h3 className="t-2 mt-8 text-ivory">{t.successTitle}</h3>
        <p className="lede mx-auto mt-5 max-w-xl">{t.successBody}</p>
        {state.ref && (
          <p className="mt-8 text-sm text-mist">
            {t.reference} · <span className="font-display text-xl tracking-wider text-gold-bright" dir="ltr">{state.ref}</span>
          </p>
        )}
        {state.manageUrl && (
          <Link href={state.manageUrl} className="btn btn-ghost mt-8">
            {t.manageLink}
          </Link>
        )}
      </div>
    );
  }

  // Submit via a transition instead of <form action>, so React does not reset the
  // visitor's input when the server returns validation errors.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  const stepClass = (i: number) => (i === step ? "block" : "hidden");

  return (
    <div ref={topRef} className="scroll-mt-32">
      {/* Progress */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label={t.title}>
        {t.steps.map((label, i) => (
          <li key={label} className="flex flex-col gap-3" aria-current={i === step ? "step" : undefined}>
            <span className={`h-px transition-colors duration-700 ${i <= step ? "bg-gold" : "bg-line"}`} />
            <span className={`text-[0.72rem] tracking-[0.14em] uppercase transition-colors [html[lang=ar]_&]:tracking-normal ${i === step ? "text-gold-bright" : "text-faint"}`}>
              <span className="font-display text-sm">{String(i + 1).padStart(2, "0")}</span> <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} className="relative">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="_t" value={startedAt} />
        <input type="hidden" name="offeringId" value={offeringId ?? ""} />
        <input type="hidden" name="slotId" value={slotId ?? ""} />
        <div className="hp" aria-hidden="true">
          <label>
            Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Step 1 — consultation */}
        <fieldset className={stepClass(0)}>
          <legend className="t-3 mb-6 text-ivory">{t.chooseOffering}</legend>
          <div className="grid gap-3">
            {offerings.map((o) => {
              const on = o.id === offeringId;
              return (
                <label
                  key={o.id}
                  className={`card flex cursor-pointer items-start gap-5 p-6 ${on ? "!border-gold/60 bg-gold/[0.05]" : ""}`}
                >
                  <input type="radio" name="_offering" className="sr-only" checked={on} onChange={() => setOfferingId(o.id)} />
                  <span className={`mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-gold" : "border-line"}`}>
                    <span className={`h-2.5 w-2.5 rounded-full bg-gold transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} />
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="font-display text-xl text-ivory">{o.name}</span>
                      <span className="font-display text-xl text-gold-bright">
                        {o.price} <span className="text-xs text-mist">· {o.duration} {common.minutes}</span>
                      </span>
                    </span>
                    {o.summary && <span className="mt-1 block text-sm text-mist">{o.summary}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Step 2 — slot */}
        <fieldset className={stepClass(1)}>
          <legend className="t-3 mb-2 text-ivory">{t.chooseSlot}</legend>
          {mounted && <p className="mb-6 text-sm text-mist">{t.timezoneNote.replace("{tz}", tz)}</p>}
          {state.status === "error" && state.error === "slotTaken" && <p className="field-error mb-4" role="alert">{t.slotTaken}</p>}
          {!mounted ? (
            <p className="text-mist">{common.loading}</p>
          ) : byDay.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-mist">{t.noSlots}</p>
              <Link href={contactHref} className="btn btn-ghost mt-6">{common.writeToMe}</Link>
            </div>
          ) : (
            <>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3" data-lenis-prevent>
                {byDay.map((d) => (
                  <button
                    type="button"
                    key={d.key}
                    onClick={() => setDay(d.key)}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      d.key === activeDay ? "border-gold bg-gold/10 text-gold-bright" : "border-line text-ivory/80 hover:border-gold/40"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {byDay
                  .find((d) => d.key === activeDay)
                  ?.items.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSlotId(s.id)}
                      aria-pressed={s.id === slotId}
                      className={`rounded-xl border py-3 text-sm transition-colors ${
                        s.id === slotId ? "border-gold bg-gold text-ink" : "border-line text-ivory hover:border-gold/50"
                      }`}
                      dir="ltr"
                    >
                      {fmtTime(s.startsAt)}
                    </button>
                  ))}
              </div>
            </>
          )}
        </fieldset>

        {/* Step 3 — details */}
        <fieldset className={`${stepClass(2)} space-y-6`}>
          <legend className="t-3 mb-2 text-ivory">{t.yourDetails}</legend>
          {offering && slot && (
            <p className="rounded-2xl border border-line bg-ink/40 p-4 text-sm text-mist">
              {offering.name} · {fmtFull(slot.startsAt)} · {offering.price}
            </p>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t.name} error={err("name")}>
              <input className="input" name="name" required maxLength={100} autoComplete="name" aria-invalid={!!err("name")} />
            </Field>
            <Field label={t.email} error={err("email")}>
              <input className="input" name="email" type="email" required maxLength={160} autoComplete="email" aria-invalid={!!err("email")} dir="ltr" />
            </Field>
            <Field label={`${t.phone} (${common.optional})`} error={err("phone")}>
              <input className="input" name="phone" type="tel" maxLength={40} autoComplete="tel" aria-invalid={!!err("phone")} dir="ltr" />
            </Field>
            <Field label={t.format} error={err("format")}>
              <select className="input" name="format" defaultValue="video" aria-invalid={!!err("format")}>
                {(["video", "phone", "whatsapp"] as const).map((f) => (
                  <option key={f} value={f}>{t.formats[f]}</option>
                ))}
              </select>
            </Field>
          </div>

          <BirthBlock t={t} err={err} prefix="" unknown={timeUnknown} setUnknown={setTimeUnknown} />

          {offering?.requiresPartner && (
            <div className="space-y-5 rounded-3xl border border-line p-6">
              <p className="font-display text-xl text-gold-bright">{t.partnerDetails}</p>
              <Field label={t.partnerName} error={err("partnerName")}>
                <input className="input" name="partnerName" required maxLength={100} aria-invalid={!!err("partnerName")} />
              </Field>
              <BirthBlock t={t} err={err} prefix="partner" unknown={partnerTimeUnknown} setUnknown={setPartnerTimeUnknown} />
            </div>
          )}

          <Field label={`${t.question} (${common.optional})`} error={err("question")}>
            <textarea className="input" name="question" maxLength={3000} placeholder={t.questionHint} />
          </Field>

          <label className="flex items-start gap-3 text-sm text-mist">
            <input type="checkbox" name="consent" className="checkbox" required aria-invalid={!!err("consent")} />
            <span>{t.consent}</span>
          </label>
          {err("consent") && <p className="field-error">{err("consent")}</p>}
        </fieldset>

        {(localError || (state.status === "error" && state.error !== "slotTaken")) && (
          <p className="field-error mt-6" role="alert">
            {localError ?? (state.status === "error" ? errors[state.error as "invalid" | "rateLimited" | "generic"] : "")}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-8">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              <span className="rtl-flip">←</span> {t.prev}
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={next} disabled={step === 1 && byDay.length === 0}>
              {t.next} <span className="rtl-flip">→</span>
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? common.sending : t.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function BirthBlock({
  t,
  err,
  prefix,
  unknown,
  setUnknown,
}: {
  t: Dictionary["booking"];
  err: (k: string) => string | null;
  prefix: "" | "partner";
  unknown: boolean;
  setUnknown: (v: boolean) => void;
}) {
  const n = (k: string) => (prefix ? `partner${k[0].toUpperCase()}${k.slice(1)}` : k);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Field label={t.birthDate} error={err(n("birthDate"))}>
        <input className="input" type="date" name={n("birthDate")} required min="1900-01-01" max={today} aria-invalid={!!err(n("birthDate"))} />
      </Field>
      <Field label={t.birthTime} error={err(n("birthTime"))}>
        <input className="input" type="time" name={n("birthTime")} disabled={unknown} required={!unknown} aria-invalid={!!err(n("birthTime"))} />
        <span className="mt-1 flex items-center gap-2 text-xs text-mist">
          <input type="checkbox" className="checkbox !mt-0 !h-4 !w-4" name={n("birthTimeUnknown")} checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />
          {t.birthTimeUnknown}
        </span>
      </Field>
      <Field label={t.birthPlace} error={err(n("birthPlace"))}>
        <input className="input" name={n("birthPlace")} required maxLength={120} aria-invalid={!!err(n("birthPlace"))} />
      </Field>
    </div>
  );
}
