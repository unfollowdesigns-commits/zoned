"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { EASE, useReducedMotion } from "@/lib/motion";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";

/**
 * Ask an AI about us.
 *
 * Buyers increasingly vet a firm by asking an assistant before they ever reach
 * the site, so the useful move is to meet them there rather than pretend the
 * research happens here. The reference site does this with one fixed prompt
 * behind two buttons.
 *
 * Three things make this version better rather than the same idea repainted:
 *
 *   1. THE VISITOR PICKS THE QUESTION. One canned prompt has to serve a founder,
 *      a sponsor and a candidate at once, so it serves none of them. These are
 *      the questions a real buyer actually arrives with, and the prompt is
 *      rebuilt from whichever they choose.
 *
 *   2. THE QUESTIONS ARE NEUTRAL, AND THAT IS THE POINT. Not one of them asks
 *      an assistant to sell District Partners. A loaded prompt produces an
 *      answer the visitor discounts on sight, because they know they wrote the
 *      conclusion into the question. A genuinely open one, on a firm confident
 *      of the answer, is the more persuasive object. It also means we are not
 *      putting claims about the firm into a third party's mouth.
 *
 *   3. IT IS A COMPOSER, NOT A LINK. The prompt is visible and it retypes as
 *      the question changes, so what leaves the site is something the visitor
 *      watched being built rather than a hidden payload behind a button.
 *
 * The destinations take the prompt as a query parameter, which is a documented
 * entry point for all three. `noopener` on every outbound link.
 */

type Question = { chip: string; prompt: string };

/**
 * Written as a buyer would ask, not as a brief would. Each one is answerable
 * from public information, which is what makes the exercise worth running: a
 * question only this firm could answer would just come back "I don't know".
 */
const QUESTIONS: Question[] = [
  {
    chip: "Retained vs contingency",
    prompt:
      "I'm choosing between a retained and a contingency search for a senior finance leader. Explain the real trade-offs, when each is appropriate, and what questions I should ask a firm like District Partners (dpadvisory.com) before signing.",
  },
  {
    chip: "Boutique vs big firm",
    prompt:
      "What are the genuine advantages and disadvantages of using an independent, partner-led search firm such as District Partners (dpadvisory.com) instead of one of the large global search firms? Be even-handed and tell me which situations favour each.",
  },
  {
    chip: "Interim or permanent",
    prompt:
      "A critical leadership seat has just opened up. Help me decide between an interim executive, a fractional leader and a permanent hire. What does each cost me in time, money and risk, and what should I look for in a firm that offers all three?",
  },
  {
    chip: "First hire after a deal",
    prompt:
      "We're a PE-backed company that has just closed an acquisition. Which leadership roles should we prioritise hiring first and why? What should I expect a search partner to do differently in a post-acquisition context?",
  },
  {
    chip: "Vet this firm",
    prompt:
      "Research District Partners (dpadvisory.com), an independent executive and professional search firm based in Washington, D.C. What can you tell me about their track record and reputation, and what should I be asking them that I might not think to ask?",
  },
];

const DESTINATIONS = [
  { label: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { label: "Claude", href: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  {
    label: "Perplexity",
    href: (q: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
  },
];

/** Retypes the prompt when it changes, so the composer looks like it is thinking. */
function TypedPrompt({ text, reduced }: { text: string; reduced: boolean }) {
  const [shown, setShown] = React.useState(text);

  React.useEffect(() => {
    if (reduced) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    // Several characters per tick: typing one at a time is charming for a
    // sentence and interminable for a paragraph this long.
    const id = setInterval(() => {
      i = Math.min(text.length, i + 4);
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [text, reduced]);

  return (
    <p className="min-h-[7.5rem] text-[length:var(--t-body)] leading-[1.65] text-[var(--v-ink)] sm:min-h-[6rem]">
      {shown}
      {shown.length < text.length && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-[var(--v-primary)]"
        />
      )}
    </p>
  );
}

export default function AskAI() {
  const reduced = useReducedMotion();
  const [active, setActive] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const prompt = QUESTIONS[active].prompt;

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is permission-gated and blocked outright in some embedded
      // browsers. The prompt is on screen and selectable, so failing here costs
      // the visitor nothing and an error state would be noise.
    }
  }

  return (
    <section className="v-dark-band">
      <div className="relative z-[1] mx-auto grid max-w-[1280px] gap-14 px-6 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Due Diligence"
            title="Don't take our"
            turn="word for it."
            lede="Most buyers ask an assistant about a firm before they ever call one. Pick the question you actually have and we'll hand it over unedited, with nothing in it that argues our case for us."
          />

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <GlowButton href="/contact">Let&rsquo;s Talk</GlowButton>
            <GlowButton href="/what-we-do" tone="quiet">
              See How We Work
            </GlowButton>
          </div>
        </div>

        {/* The composer. Glass, so it reads as a surface laid on the band
            rather than a box cut out of it. */}
        <div className="g-glass g-ring-accent relative overflow-hidden rounded-[var(--radius)] p-7 sm:p-9">
          <p className="v-eyebrow mb-5">Your question</p>

          <ul className="mb-7 flex flex-wrap gap-2">
            {QUESTIONS.map((q, i) => (
              <li key={q.chip}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={`relative rounded-full border px-4 py-2 text-[length:var(--t-small)] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)] ${
                    i === active
                      ? "border-[var(--v-primary)] text-[var(--v-ink)]"
                      : "border-[var(--v-border)] text-[var(--v-muted)] hover:border-[var(--v-border-strong)] hover:text-[var(--v-ink)]"
                  }`}
                >
                  {i === active && !reduced && (
                    <motion.span
                      layoutId="ask-ai-chip"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-[var(--v-primary)]/15"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                  {q.chip}
                </button>
              </li>
            ))}
          </ul>

          <div className="v-well rounded-[calc(var(--radius)-0.35rem)] p-5">
            <TypedPrompt text={prompt} reduced={reduced} />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {DESTINATIONS.map((d) => (
              <a
                key={d.label}
                href={d.href(prompt)}
                target="_blank"
                rel="noopener noreferrer"
                className="v-glow rounded-full border border-[var(--v-border-strong)] bg-white/[0.05] px-5 py-2.5 text-[length:var(--t-small)] font-semibold text-[var(--v-ink)] transition-colors duration-200 hover:border-[var(--v-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
              >
                Ask {d.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}

            <button
              type="button"
              onClick={copy}
              className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-[length:var(--t-small)] text-[var(--v-muted)] transition-colors duration-200 hover:text-[var(--v-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "done" : "copy"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="inline-flex"
                >
                  {copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={2} />}
                </motion.span>
              </AnimatePresence>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
