"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { EASE, EXIT, SPRING, useReducedMotion } from "@/lib/motion";

/**
 * The guided assistant.
 *
 * IT IS NOT A CHATBOT AND IT DOES NOT PRETEND TO BE ONE. There is no model
 * behind this, so it does not get a blinking caret, a "thinking" state, or a
 * free-text box that quietly discards what you type. Those are the things that
 * make a scripted widget feel like a bait and switch: a visitor types a real
 * question, gets a canned reply, and now distrusts the whole site. What this
 * does instead is state its nature in the header and answer with buttons.
 *
 * What it is: three questions that narrow a visitor to the one engagement that
 * fits, and a booking link that carries their answers with it. For the actual
 * job here, that is not a downgrade from a language model. Someone with an open
 * CFO seat does not want a conversation, they want to know within fifteen
 * seconds whether this firm does their kind of search and how to start it. A
 * decision tree answers that faster and more reliably than generated prose, and
 * it can never invent a service the firm does not offer or a timeline it cannot
 * meet, which is the failure mode that matters on a page selling trust.
 *
 * The recommendation is derived, not written per branch: each terminal answer
 * names a service by slug and the copy comes from one place, so it cannot drift
 * from what the site actually sells.
 */

type Answer = { label: string; next: string };
type Step = {
  /** What the assistant asks. */
  q: string;
  options: Answer[];
};
type Outcome = {
  /** The service being recommended, by route. */
  href: string;
  title: string;
  body: string;
};

const STEPS: Record<string, Step> = {
  start: {
    q: "What brings you here today?",
    options: [
      { label: "I need to hire a leader", next: "seniority" },
      { label: "I need cover or extra capacity", next: "duration" },
      { label: "I'm exploring my options", next: "explore" },
      { label: "I'm a candidate", next: "out-candidate" },
    ],
  },
  seniority: {
    q: "What level is the seat?",
    options: [
      { label: "C-suite or board", next: "urgency-exec" },
      { label: "VP or director", next: "urgency-exec" },
      { label: "Manager or individual contributor", next: "out-professional" },
    ],
  },
  "urgency-exec": {
    q: "How soon does it need to be filled?",
    options: [
      { label: "It's open now", next: "out-executive" },
      { label: "Within the next quarter", next: "out-executive" },
      { label: "We're planning ahead", next: "out-executive" },
    ],
  },
  duration: {
    q: "How long do you need the help for?",
    options: [
      { label: "A few weeks, urgently", next: "out-interim" },
      { label: "A defined project with an end date", next: "out-project" },
      { label: "Ongoing, but part-time", next: "out-fractional" },
    ],
  },
  explore: {
    q: "What would be most useful?",
    options: [
      { label: "Understanding how search works", next: "out-executive" },
      { label: "Seeing the functions you cover", next: "out-coverage" },
      { label: "Talking to a partner", next: "out-talk" },
    ],
  },
};

const OUTCOMES: Record<string, Outcome> = {
  "out-executive": {
    href: "/what-we-do/executive-search",
    title: "Executive Search",
    body: "Retained search for the seats where the wrong hire is expensive. Partner-led from the first call to the close, with a shortlist you can defend to a board.",
  },
  "out-professional": {
    href: "/what-we-do/professional-search",
    title: "Professional Search",
    body: "The layer beneath the executive team, where volume and speed both matter. Same partners, same process, sized to the role.",
  },
  "out-interim": {
    href: "/what-we-do/interim-solutions",
    title: "Interim Solutions",
    body: "An experienced operator in the seat while you run the permanent search, so the function does not stall in the meantime.",
  },
  "out-project": {
    href: "/what-we-do/project-support",
    title: "Project Support & Expertise",
    body: "Bounded work with a defined end: a system implementation, a close, a remediation. Scoped up front rather than open-ended.",
  },
  "out-fractional": {
    href: "/what-we-do/fractional",
    title: "Fractional",
    body: "Senior expertise at the fraction of the week you actually need it, for companies not yet ready to carry the seat full time.",
  },
  "out-coverage": {
    href: "/who-we-serve",
    title: "Who We Serve",
    body: "Four functions and eight industries, all covered by the same partners rather than handed between desks.",
  },
  "out-talk": {
    href: "/contact",
    title: "Talk to a partner",
    body: "No qualifying call with someone who then hands you off. You speak to the partner who would run the work.",
  },
  "out-candidate": {
    href: "/resources/current-opportunities",
    title: "Current Opportunities",
    body: "Open roles we're running now. If nothing fits, the resume builder is free and the partners still read what comes in.",
  },
};

export default function Assistant() {
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<string[]>(["start"]);
  const reduced = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);

  const here = path[path.length - 1];
  const step = STEPS[here];
  const outcome = OUTCOMES[here];

  // Escape closes, which people expect of anything that floats over a page.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  // Focus moves into the panel on open so a keyboard user is not left behind
  // at the launcher, and the trail resets so a reopened panel starts fresh.
  React.useEffect(() => {
    if (open) panelRef.current?.focus();
    else setPath(["start"]);
  }, [open]);

  return (
    <>
      {/* Launcher. Bottom-left, deliberately: the bottom-right corner is where
          every accessibility widget, cookie banner and live-chat bubble already
          lives, and a third thing stacked there is the reason people learn to
          ignore that corner entirely. */}
      {/* The fixed positioning lives on a wrapper, NOT on the button.
          `.v-edge` and `.v-glass` both declare `position: relative`, and the
          kit stylesheet is imported after Tailwind, so those class rules win
          against Tailwind's `fixed` at equal specificity. Put both on one
          element and the control silently lays out in document flow: this one
          ended up six thousand pixels down the page. */}
      <div className="fixed bottom-6 left-6 z-[60]">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="dp-assistant"
        className="v-edge flex items-center gap-3 rounded-full py-3 pl-3 pr-5 text-[length:var(--t-small)] font-semibold text-[var(--v-ink)] outline-none backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-[var(--v-ring)]"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.1 }}
      >
        <span aria-hidden="true" className="v-edge-glow">
          <i />
        </span>
        <span aria-hidden="true" className="v-edge-ring">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </span>
        <span
          aria-hidden="true"
          className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--v-primary)]/15 text-[length:var(--t-small)] font-bold text-[var(--v-ring)]"
        >
          ?
        </span>
        <span className="relative">{open ? "Close" : "Where do I start?"}</span>
      </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed bottom-24 left-6 z-[60]">
          <motion.div
            // Same reason as the launcher: `.v-glass` sets position: relative,
            // so the fixed placement goes on this wrapper instead.
            id="dp-assistant"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-label="Find the right engagement"
            className="v-glass v-glass-panel w-[min(24rem,calc(100vw-3rem))] overflow-hidden outline-none"
            /* ORIGIN-AWARE. The panel is anchored to a launcher in the
               bottom-left corner, so it has to grow OUT of that corner. Scaling
               from the centre, which is the default and what this did first,
               makes the panel appear to arrive from somewhere the visitor was
               not looking, and no amount of tuning the curve fixes a wrong
               origin. This is the single highest-leverage detail on any popover
               and the one most often skipped. */
            style={{ transformOrigin: "0% 100%" }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
            /* A spring on the way in, a short ease on the way out. Springs read
               as physical, which is right for something the visitor summoned;
               but a spring on exit means the panel is still settling while it
               disappears, so dismissal feels sluggish. Exit is also FASTER than
               enter, always: waiting to leave is the most annoying thing an
               interface can do. */
            transition={reduced ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.16 } }}
          >
            <div className="relative z-[2] flex items-start justify-between gap-4 border-b border-[var(--v-border)] p-5">
              <div>
                <p className="v-eyebrow mb-1.5">Find your starting point</p>
                {/* Says what it is, in the header, unprompted. A scripted widget
                    that lets you assume it is an AI has already lost the trust
                    it was built to earn. */}
                <p className="text-[length:var(--t-small)] leading-[1.5] text-[var(--v-muted)]">
                  A few questions, not a chatbot. Answers go straight to a partner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-[var(--v-muted)] transition-colors hover:text-[var(--v-ink)] focus-visible:outline-2 focus-visible:outline-[var(--v-ring)]"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="relative z-[2] p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={here}
                  /* Steps slide in the direction of travel, so going forward
                     and going Back are visibly different moves rather than the
                     same fade twice. Kept short: this fires on every tap, and
                     motion the visitor triggers repeatedly has to get out of
                     the way faster than motion they see once. */
                  initial={reduced ? false : { opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -14 }}
                  transition={reduced ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.14 } }}
                >
                  {step ? (
                    <>
                      <p className="mb-4 text-[length:var(--t-body)] leading-[1.5] text-[var(--v-ink)]">
                        {step.q}
                      </p>
                      <ul className="flex flex-col gap-2">
                        {step.options.map((o) => (
                          <li key={o.label}>
                            <button
                              type="button"
                              onClick={() => setPath((p) => [...p, o.next])}
                              className="group flex w-full items-center justify-between gap-3 rounded-[calc(var(--radius)-0.4rem)] border border-[var(--v-border)] bg-white/[0.03] px-4 py-3 text-left text-[length:var(--t-small)] text-[var(--v-ink)]/85 transition-colors duration-200 hover:border-[var(--v-primary)] hover:bg-[var(--v-primary)]/10 hover:text-[var(--v-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                            >
                              {o.label}
                              <ArrowRight
                                size={14}
                                strokeWidth={2}
                                aria-hidden="true"
                                className="shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : outcome ? (
                    <>
                      <p className="v-eyebrow mb-2">Sounds like</p>
                      <p className="v-display mb-3 text-[length:var(--t-heading)] leading-[1.2]">
                        {outcome.title}
                      </p>
                      <p className="mb-5 text-[length:var(--t-small)] leading-[1.65] text-[var(--v-muted)]">
                        {outcome.body}
                      </p>
                      <div className="flex flex-col gap-2">
                        {/* The booking link carries the trail, so whoever picks
                            it up already knows what was asked and answered
                            rather than starting the conversation over. */}
                        <Link
                          href={`/contact?path=${encodeURIComponent(path.join(">"))}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,var(--v-primary),var(--v-primary-deep))] px-5 py-3 text-[length:var(--t-small)] font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                          onClick={() => setOpen(false)}
                        >
                          Book a call
                          <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
                        </Link>
                        <Link
                          href={outcome.href}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--v-border-strong)] px-5 py-3 text-[length:var(--t-small)] font-medium text-[var(--v-ink)]/85 transition-colors duration-200 hover:border-[var(--v-primary)] hover:text-[var(--v-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                        >
                          Read more first
                        </Link>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {path.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPath((p) => p.slice(0, -1))}
                  className="mt-4 text-[length:var(--t-small)] text-[var(--v-muted)] underline-offset-4 transition-colors hover:text-[var(--v-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--v-ring)]"
                >
                  Back
                </button>
              )}
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
