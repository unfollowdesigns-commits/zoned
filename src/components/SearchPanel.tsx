"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A search running, as an instrument.
 *
 * WHAT IT IS FOR. The right half of the hero was field and nothing else, and
 * the headline's claim ("our talent is finding yours") was being asserted
 * rather than shown. This shows it: the five stages of a search, and the
 * narrowing that happens across them, advancing continuously.
 *
 * IT PLOTS NO NUMBERS, AND THAT IS DELIBERATE. A funnel with counts on it
 * ("2,400 sourced, 38 screened") would be a performance claim invented for a
 * real firm, and it is the kind of thing nobody ever goes back and corrects.
 * What is drawn is the SHAPE of a search: many, fewer, few, one. The shape is
 * a design statement about how the work goes, which the firm can correct in a
 * sentence, rather than a statistic presented as measured.
 *
 * THE STAGE NAMES ARE THE FIRM'S OWN. They are the five steps already in
 * lib/services.ts, imported rather than retyped, so the hero and the service
 * pages can never disagree about what the process is.
 *
 * ONE INTERVAL, NOT A KEYFRAME PHASE PER ELEMENT. The stage is a number in
 * React state and everything else is CSS reacting to `data-stage` on the root.
 * The alternative, giving every node its own delay on a shared keyframe, is
 * what the nav visuals do and it is right there because those have no state to
 * hold. Here there IS a state, five discrete steps, and driving discrete steps
 * from phased keyframes means the figure can never be told to hold, reverse,
 * or start from a particular stage. One timer is cheaper to run and far
 * cheaper to reason about.
 */

/** The five stages, in the firm's own words. See lib/services.ts. */
const STAGES = [
  "Define the mandate",
  "Build the strategy",
  "Identify and evaluate",
  "Coordinate the process",
  "Secure and support",
] as const;

/**
 * The narrowing, as counts of drawn nodes.
 *
 * These are how many marks appear in each band, not how many people are in
 * one: a diagram of a funnel needs enough dots in the top row to read as "a
 * lot" and exactly one in the last to read as "the seat". Chosen to look
 * right, which is all a shape is allowed to claim.
 */
const BANDS = [
  { label: "The market", n: 28, from: 0 },
  { label: "Evaluated", n: 14, from: 1 },
  { label: "Shortlist", n: 5, from: 2 },
  { label: "The seat", n: 1, from: 3 },
] as const;

/** Milliseconds per stage. Slow enough to read the name before it changes. */
const STEP_MS = 2600;

export default function SearchPanel() {
  const reduced = useReducedMotion();
  /* Starts at the last stage so the very first paint is the finished figure
     rather than an empty one: a panel that begins blank reads as broken for
     the two and a half seconds before it fills. */
  const [stage, setStage] = React.useState(STAGES.length - 1);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), STEP_MS);
    return () => clearInterval(id);
  }, [reduced]);

  /* One index past the last stage is a deliberate beat of rest before the
     figure resets, so the loop has a breath in it rather than snapping from
     "placed" straight back to "the market". */
  const active = Math.min(stage, STAGES.length - 1);

  return (
    <div
      data-stage={active}
      aria-hidden="true"
      className="dp-sp w-full max-w-[380px] rounded-[20px] border border-white/[0.09] bg-white/[0.04] p-6 backdrop-blur-xl"
    >
      <p className="v-eyebrow text-[var(--v-primary)]">How a search runs</p>

      {/* The stage rail. A filled node is the stage under way, and the ones
          behind it stay filled, because a process that un-completes its own
          steps as it advances is not a process. */}
      <ol className="mt-5 flex items-center gap-1.5">
        {STAGES.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-1.5">
            <span className="dp-sp-step" data-on={i <= active || undefined} />
            {i < STAGES.length - 1 && <span className="dp-sp-rail" data-on={i < active || undefined} />}
          </li>
        ))}
      </ol>

      <p className="dp-sp-name mt-4 text-[length:var(--t-body)] font-semibold text-white">
        {STAGES[active]}
      </p>

      {/* The narrowing. Each band is a row of seats, and a band lights only
          once the stage that produces it has been reached. */}
      <div className="mt-7 flex flex-col gap-4">
        {BANDS.map((band) => (
          <div key={band.label} data-on={active >= band.from || undefined} className="dp-sp-band">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[length:var(--t-small)] font-medium text-[var(--v-ink)]/80">
                {band.label}
              </span>
              {/* A rule whose LENGTH is the narrowing, so the figure reads even
                  at a glance where the dots do not. */}
              <span
                className="dp-sp-bar"
                style={{ ["--w" as string]: `${(band.n / BANDS[0].n) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-[5px]">
              {Array.from({ length: band.n }, (_, i) => (
                <span
                  key={i}
                  className={band.n === 1 ? "dp-sp-node is-seat" : "dp-sp-node"}
                  style={{ ["--i" as string]: i }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 border-t border-white/[0.08] pt-4 text-[length:var(--t-small)] leading-[1.55] text-[var(--v-muted)]">
        Experienced partners run your search from initiation through onboarding.
      </p>
    </div>
  );
}
