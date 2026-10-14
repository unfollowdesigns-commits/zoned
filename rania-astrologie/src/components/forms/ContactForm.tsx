"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { submitContact, type FormState } from "@/app/actions/public";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { Check } from "@/components/Check";

const initialState: FormState = { status: "idle" };

export function ContactForm({ locale, t, errors, common }: { locale: Locale; t: Dictionary["contact"]; errors: Dictionary["forms"]["errors"]; common: Dictionary["common"] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, initialState);
  const [startedAt] = useState(() => Date.now());
  const fe = state.status === "error" ? state.fields ?? {} : {};
  const err = (k: string) => (fe[k] ? errors[fe[k] as keyof typeof errors] : null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  if (state.status === "success") {
    return (
      <div className="card p-10 text-center" role="status">
        <Check className="mx-auto h-14 w-14 text-gold-bright" />
        <p className="mt-6 font-display text-2xl text-ivory">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="_t" value={startedAt} />
      <div className="hp" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="field">
          <span className="field-label">{t.name}</span>
          <input className="input" name="name" required maxLength={100} autoComplete="name" aria-invalid={!!err("name")} />
          {err("name") && <span className="field-error">{err("name")}</span>}
        </label>
        <label className="field">
          <span className="field-label">{t.email}</span>
          <input className="input" name="email" type="email" required maxLength={160} autoComplete="email" dir="ltr" aria-invalid={!!err("email")} />
          {err("email") && <span className="field-error">{err("email")}</span>}
        </label>
        <label className="field">
          <span className="field-label">{t.phone} ({common.optional})</span>
          <input className="input" name="phone" type="tel" maxLength={40} autoComplete="tel" dir="ltr" aria-invalid={!!err("phone")} />
          {err("phone") && <span className="field-error">{err("phone")}</span>}
        </label>
        <label className="field">
          <span className="field-label">{t.subject}</span>
          <select className="input" name="subject" defaultValue="consultation">
            {(["consultation", "question", "other"] as const).map((s) => (
              <option key={s} value={s}>{t.subjects[s]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field-label">{t.message}</span>
        <textarea className="input" name="message" required minLength={10} maxLength={5000} aria-invalid={!!err("message")} />
        {err("message") && <span className="field-error">{err("message")}</span>}
      </label>
      <label className="flex items-start gap-3 text-sm text-mist">
        <input type="checkbox" name="consent" className="checkbox" required />
        <span>{t.consent}</span>
      </label>
      {err("consent") && <p className="field-error">{err("consent")}</p>}
      {state.status === "error" && (
        <p className="field-error" role="alert">{errors[state.error as "invalid" | "rateLimited" | "generic"] ?? errors.generic}</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? common.sending : common.send}
      </button>
    </form>
  );
}
