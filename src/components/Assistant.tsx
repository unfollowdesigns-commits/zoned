"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { EASE, EXIT, SPRING, useReducedMotion } from "@/lib/motion";
import { answer, WELCOME, type Reply } from "@/lib/assistant-answers";

/**
 * The guided assistant.
 *
 * IT TAKES TYPED QUESTIONS, AND THEY ACTUALLY WORK. The earlier version had
 * buttons only, on the argument that a free-text box which quietly discards
 * what you type is a bait and switch. That argument is still right, so the box
 * was added by making it real rather than by faking it: what you type is
 * matched against the site's own content and answered from it. See
 * lib/assistant-answers.
 *
 * THERE IS STILL NO MODEL BEHIND IT, AND THAT IS DELIBERATE. This page sells
 * judgement about people. A generated reply that invents a service the firm
 * does not offer, a fee it has not quoted or a timeline it cannot meet does
 * more damage than no widget at all, and it is exactly the failure mode a
 * language model has here. Retrieval over the firm's own pages cannot invent,
 * and when it does not know it says so and offers a partner, which is a real
 * answer where a confident guess is not.
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

type Turn = { role: "you" | "dp"; text: string; links?: Reply["links"] };

export default function Assistant() {
  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<string[]>(["start"]);
  /* The typed conversation, kept alongside the guided path rather than
     replacing it: the buttons are still the fastest route for someone who
     just wants the right page, and the box is there for everyone else. */
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const reduced = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const logRef = React.useRef<HTMLDivElement>(null);

  const here = path[path.length - 1];
  const step = STEPS[here];
  const outcome = OUTCOMES[here];
  const chatting = turns.length > 0;

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    const a = answer(q);
    setTurns((t) => [...t, { role: "you", text: q }, { role: "dp", ...a }]);
    setDraft("");
  }

  /* Keep the newest turn in view. A transcript that grows off the bottom of
     its own box is the most common way a chat panel feels broken. */
  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [turns]);

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
    if (open) {
      panelRef.current?.focus();
      /* Opens on a greeting rather than straight into an interrogation. It is
         seeded here rather than held as a constant first turn so that closing
         and reopening genuinely starts over: a panel that reopens mid-
         conversation is confusing, and one that reopens with yesterday's
         answers still in it is worse. */
      setTurns([{ role: "dp", text: WELCOME }]);
    } else {
      setPath(["start"]);
      setTurns([]);
      setDraft("");
    }
  }, [open]);

  return (
    <>
      {/* Launcher, bottom right: the corner people reach for an assistant in.
          The earlier argument for the left was that the right is crowded with
          accessibility and chat widgets, which is true of sites that have them
          and not of this one, and putting a control where nobody looks for it to
          win an argument about clutter is the wrong trade. */}
      {/* The fixed positioning lives on a wrapper, NOT on the button.
          `.v-edge` and `.v-glass` both declare `position: relative`, and the
          kit stylesheet is imported after Tailwind, so those class rules win
          against Tailwind's `fixed` at equal specificity. Put both on one
          element and the control silently lays out in document flow: this one
          ended up six thousand pixels down the page. */}
      <div className="fixed bottom-6 right-6 z-[60]">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="dp-assistant"
        /* A DISC ON A PHONE, A PILL ON A DESKTOP, and that is a bug fix
           rather than a preference. The label makes this 182 units wide, and
           it is fixed to the bottom right corner of every page, so on a 390px
           screen it covered nearly half the line it happened to be sitting
           over. Swept across six routes it was printing over body copy,
           headlines and card titles at almost every scroll position: 18 of
           the 27 collisions found on mobile were this one control.

           The label is what does not fit, so the label is what goes. The
           question mark and the affordance survive at 44px, which is also the
           minimum comfortable touch target, and the accessible name is
           carried by aria-label so nothing is lost to a screen reader. */
        aria-label={open ? "Close the assistant" : "Where do I start?"}
        className="v-ios flex h-11 w-11 items-center justify-center rounded-full text-[length:var(--t-small)] font-semibold text-white outline-none transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--v-ring)] sm:h-auto sm:w-auto sm:justify-start sm:gap-3 sm:py-2.5 sm:pl-2.5 sm:pr-5"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.1 }}
      >
        <span
          aria-hidden="true"
          className="relative grid h-7 w-7 place-items-center rounded-full bg-[var(--v-primary)]/15 text-[length:var(--t-small)] font-bold text-[var(--v-ring)] sm:h-8 sm:w-8"
        >
          ?
        </span>
        <span className="relative hidden sm:inline">{open ? "Close" : "Where do I start?"}</span>
      </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed bottom-24 right-6 z-[60]">
          <motion.div
            // Same reason as the launcher: `.v-glass` sets position: relative,
            // so the fixed placement goes on this wrapper instead.
            id="dp-assistant"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-label="Find the right engagement"
            className="v-ios v-ios-panel w-[min(24rem,calc(100vw-3rem))] overflow-hidden rounded-[26px] outline-none"
            /* ORIGIN-AWARE. The panel is anchored to a launcher in the
               bottom-right corner, so it has to grow OUT of that corner. Scaling
               from the centre, which is the default and what this did first,
               makes the panel appear to arrive from somewhere the visitor was
               not looking, and no amount of tuning the curve fixes a wrong
               origin. This is the single highest-leverage detail on any popover
               and the one most often skipped. */
            style={{ transformOrigin: "100% 100%" }}
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
                <p className="v-eyebrow mb-1.5">District Partners</p>
                {/* Says what it is, in the header, unprompted. Answering from
                    the site rather than from a model is a feature worth
                    stating: it is why this thing cannot make something up. */}
                <p className="text-[length:var(--t-small)] leading-[1.5] text-[var(--v-muted)]">
                  Ask a question or pick a path. Answers come from this site, so nothing here
                  is invented.
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
              {/* THE TRANSCRIPT. Only present once something has been asked, so
                  a visitor who just wants the guided path never sees an empty
                  chat box waiting to be filled. */}
              {chatting && (
                <div
                  ref={logRef}
                  className="mb-4 flex max-h-[15rem] flex-col gap-3 overflow-y-auto pr-1"
                  aria-live="polite"
                >
                  {turns.map((t, i) => (
                    <div
                      key={i}
                      className={
                        t.role === "you"
                          ? "self-end rounded-[14px] rounded-br-[4px] bg-[var(--v-primary)] px-3.5 py-2.5 text-[length:var(--t-small)] leading-[1.5] text-white"
                          : "self-start rounded-[14px] rounded-bl-[4px] bg-white/[0.06] px-3.5 py-2.5 text-[length:var(--t-small)] leading-[1.6] text-[var(--v-ink)]/90"
                      }
                      style={{ maxWidth: "92%" }}
                    >
                      {t.text}
                      {t.links && t.links.length > 0 && (
                        <span className="mt-2.5 flex flex-wrap gap-1.5">
                          {t.links.map((l) =>
                            l.external ? (
                              <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-[var(--v-border)] px-2.5 py-1 text-[length:var(--t-label)] font-medium text-[var(--v-ring)] transition-colors hover:border-[var(--v-primary)] hover:bg-[var(--v-primary)]/10"
                              >
                                {l.label}
                              </a>
                            ) : (
                              <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="rounded-full border border-[var(--v-border)] px-2.5 py-1 text-[length:var(--t-label)] font-medium text-[var(--v-ring)] transition-colors hover:border-[var(--v-primary)] hover:bg-[var(--v-primary)]/10"
                              >
                                {l.label}
                              </Link>
                            ),
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

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

              {/* THE BOX. `form` rather than a bare input so Enter submits and
                  a mobile keyboard shows a Go key, both of which people expect
                  and neither of which a click handler on a button provides. */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(draft);
                }}
                className="mt-4 flex items-center gap-2 border-t border-[var(--v-border)] pt-4"
              >
                <label htmlFor="dp-assistant-input" className="sr-only">
                  Ask District Partners a question
                </label>
                <input
                  id="dp-assistant-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask a question"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-full border border-[var(--v-border)] bg-white/[0.04] px-4 py-2.5 text-[length:var(--t-small)] text-[var(--v-ink)] outline-none transition-colors placeholder:text-[var(--v-muted)] focus:border-[var(--v-primary)] focus-visible:ring-2 focus-visible:ring-[var(--v-ring)]"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!draft.trim()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--v-primary)] text-white transition-[opacity,background-color] hover:bg-[var(--v-primary-deep)] disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
                >
                  <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
