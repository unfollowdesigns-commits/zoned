"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, useReducedMotion } from "@/lib/motion";

type Fields = { name: string; email: string; company: string; role: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", company: "", role: "", message: "" };

const INTENTS = [
  "Executive Search",
  "Professional Search",
  "Interim Solutions",
  "Fractional",
  "Project Support & Expertise",
  "I'm a candidate",
] as const;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address, for example name@company.com.";
  }
  if (!values.message.trim()) errors.message = "Tell us what you're looking for.";
  return errors;
}

const fieldClass =
  "v-well w-full rounded-[10px] px-4 py-3 text-[length:var(--t-secondary)] text-[var(--v-ink)] placeholder:text-[var(--v-muted)]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]";

export default function ContactForm() {
  const [values, setValues] = React.useState<Fields>(EMPTY);
  const [intent, setIntent] = React.useState<string>(INTENTS[0]);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const reduced = useReducedMotion();
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the summary so a screen reader announces the problems.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE }}
        className="g-glass g-ring-accent p-8 sm:p-10"
        role="status"
      >
        <p className="v-eyebrow mb-3">Not yet connected</p>
        <h2 className="v-display text-[length:var(--t-heading)] leading-[1.3]">
          The form validates, but there is nowhere for it to send.
        </h2>
        <p className="mt-4 max-w-[62ch] text-[length:var(--t-secondary)] leading-[1.7] text-[var(--v-muted)]">
          Everything you typed passed validation. No message was transmitted, because no
          destination has been configured yet. Point this at an inbox, form service, or CRM
          endpoint and it will submit for real.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setValues(EMPTY);
            setErrors({});
          }}
          className="mt-7 rounded-full border border-[var(--v-border)] px-5 py-2.5 text-[length:var(--t-secondary)] font-medium transition-colors duration-200 hover:border-[var(--v-border-strong)]"
        >
          Start over
        </button>
      </motion.div>
    );
  }

  const errorList = (Object.keys(errors) as (keyof Fields)[]).filter((k) => errors[k]);

  return (
    <form onSubmit={onSubmit} noValidate className="g-glass p-6 sm:p-8">
      <AnimatePresence>
        {errorList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-6 rounded-[10px] border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-4"
            >
              <p className="text-[length:var(--t-secondary)] font-semibold text-[var(--v-ink)]">
                {errorList.length === 1
                  ? "There is 1 problem with this form"
                  : `There are ${errorList.length} problems with this form`}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {errorList.map((key) => (
                  <li key={key}>
                    <a
                      href={`#field-${key}`}
                      className="text-[length:var(--t-small)] text-[var(--v-muted)] underline underline-offset-2 hover:text-[var(--v-ink)]"
                    >
                      {errors[key]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <fieldset className="mb-7 border-0 p-0">
        <legend className="v-eyebrow mb-3">What do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((option) => {
            const active = intent === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setIntent(option)}
                className={`rounded-full border px-4 py-2 text-[length:var(--t-small)] transition-colors duration-200 ${
                  active
                    ? "border-[var(--v-primary)] bg-[var(--v-primary)]/15 text-[var(--v-ink)]"
                    : "border-[var(--v-border)] text-[var(--v-muted)] hover:border-[var(--v-border-strong)] hover:text-[var(--v-ink)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          required
          error={errors.name}
          value={values.name}
          onChange={set("name")}
          autoComplete="name"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          error={errors.email}
          value={values.email}
          onChange={set("email")}
          autoComplete="email"
        />
        <Field
          id="company"
          label="Company"
          optional
          value={values.company}
          onChange={set("company")}
          autoComplete="organization"
        />
        <Field
          id="role"
          label="Role you're hiring for"
          optional
          value={values.role}
          onChange={set("role")}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="field-message" className="mb-2 block text-[length:var(--t-small)] font-medium">
          What are you looking for?{" "}
          <span className="text-[var(--v-muted)]">(required)</span>
        </label>
        <textarea
          id="field-message"
          rows={5}
          value={values.message}
          onChange={set("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "error-message" : undefined}
          className={`${fieldClass} resize-y`}
        />
        {errors.message && (
          <p id="error-message" className="mt-2 text-[length:var(--t-small)] text-[#ff9b9b]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="mt-7 rounded-full bg-[var(--v-primary)] px-7 py-3.5 text-[length:var(--t-secondary)] font-semibold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--v-primary-deep)] active:scale-[0.98]"
      >
        Send
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  optional,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={`field-${id}`} className="mb-2 block text-[length:var(--t-small)] font-medium">
        {label}{" "}
        <span className="text-[var(--v-muted)]">{required ? "(required)" : optional ? "(optional)" : ""}</span>
      </label>
      <input
        id={`field-${id}`}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `error-${id}` : undefined}
        className={fieldClass}
      />
      {error && (
        <p id={`error-${id}`} className="mt-2 text-[length:var(--t-small)] text-[#ff9b9b]">
          {error}
        </p>
      )}
    </div>
  );
}
