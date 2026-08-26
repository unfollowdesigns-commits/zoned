"use client";

import * as React from "react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ProcessStep } from "@/lib/services";

/**
 * The process, as one figure that accumulates rather than five that swap.
 *
 * THE WHOLE IDEA IS THAT THE DIAGRAM NEVER RESETS. The reference this follows
 * keeps a single picture on screen and changes its STATE at each step: the
 * nodes never move, a connection goes from dotted to solid, a dot travels, a
 * seat fills. Every step is visibly built on the one before it, which is what
 * makes it read as a process rather than as four illustrations of four things.
 * Five separate images would say "here are five stages"; one evolving figure
 * says "here is what happens to your search", and only the second is an
 * argument.
 *
 * It is the same grammar as everything else on this site: rules are the
 * structure of an organisation, nodes are seats and candidates, and a filled
 * node is the placement. See ui/Mark.tsx. Nothing new is invented here, which
 * is why the section belongs to the site rather than sitting on it.
 *
 * WHAT EACH STEP DOES TO THE FIGURE:
 *
 *   0  The mandate. The structure, with one seat dashed and empty. Nothing else
 *      exists yet, because nothing else has been decided.
 *   1  The strategy. The market appears beside it: every candidate, undivided.
 *   2  Identify and evaluate. Most of the market recedes and a short list
 *      resolves out of it.
 *   3  Coordinate. One of the short list is chosen and a line reaches from it
 *      toward the vacancy, drawn rather than simply appearing.
 *   4  Secure. The candidate travels the line and seats, and the structure is
 *      complete.
 *
 * STATE IS DERIVED FROM ONE NUMBER. Every element reads `step` and decides its
 * own opacity and position, so there is no sequence to keep in order and no way
 * for two elements to disagree about which stage the figure is in. Going
 * backwards works for free, which a timeline of queued animations never does.
 */

/* The figure's coordinate space. */
const W = 560;
const H = 380;

/** The vacancy at the top of the structure, and the target of the whole figure. */
const SEAT = { x: 428, y: 138 };

/**
 * The market: every candidate, before anything is known about them.
 *
 * Hand placed rather than gridded. A market is not a lattice, and a regular
 * grid of candidates reads as a spreadsheet; scattered but evenly weighted
 * reads as a population. Fixed coordinates rather than random ones so the
 * figure is identical on the server, on the client and in review.
 */
const MARKET = [
  [66, 128], [122, 112], [176, 134], [228, 118],
  [48, 178], [106, 168], [162, 184], [222, 170],
  [74, 228], [130, 216], [186, 236], [236, 220],
  [58, 280], [116, 268], [172, 286], [230, 272],
];
/** Indices that survive the short list, and the one that is chosen. */
const SHORTLIST = new Set([5, 6, 9, 10]);
const CHOSEN = 6;

export default function ProcessScene({
  heading,
  steps,
}: {
  heading: string;
  steps: ProcessStep[];
}) {
  const [step, setStep] = React.useState(0);
  const tabs = React.useRef<Array<HTMLButtonElement | null>>([]);

  /* Arrow keys move between tabs, which is the behaviour the tab role promises
     and the reason it is worth using the role at all. */
  function onKeyDown(e: React.KeyboardEvent) {
    const last = steps.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = step === last ? 0 : step + 1;
    if (e.key === "ArrowLeft") next = step === 0 ? last : step - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setStep(next);
    tabs.current[next]?.focus();
  }

  const active = steps[step];

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20 sm:py-24">
      <SectionHeading title={heading} />

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
        {/* ---- The steps, as a ledger ------------------------------------
            A VERTICAL LIST, NOT A ROW OF TABS. The reference gets four tabs on
            one line because its steps are single words: Source, Platform,
            Intro, Close. These are five phrases, and forced into a row they
            wrapped onto three lines and stopped reading as a sequence at all.
            Stacked, the length is an asset: the whole process is legible at
            once, and it matches the ruled ledger used elsewhere on the site
            rather than introducing a fifth way of listing things. */}
        <div
          role="tablist"
          aria-label={heading}
          onKeyDown={onKeyDown}
          className="border-t border-[var(--v-ink)]/[0.14]"
        >
          {steps.map((s, i) => {
            const on = i === step;
            return (
              <button
                key={s.title}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`ps-tab-${i}`}
                aria-selected={on}
                aria-controls="ps-panel"
                /* Only the selected tab is in the tab order; arrow keys move
                   within the set. Five items, one tab stop. */
                tabIndex={on ? 0 : -1}
                onClick={() => setStep(i)}
                className="group relative flex w-full items-baseline gap-5 rounded-[10px] border-b border-[var(--v-ink)]/[0.14] py-5 pl-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--v-primary)]"
              >
                {/* The progress rule. It marks the active step by filling its
                    row's underline rather than by drawing anything new. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left bg-[var(--v-primary)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <span
                  className={`text-[length:var(--t-small)] font-semibold tabular-nums transition-colors duration-300 ${
                    on ? "text-[var(--v-primary)]" : "text-[var(--v-muted)]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`v-display text-[length:clamp(19px,1.7vw,26px)] leading-[1.2] tracking-[-0.02em] transition-colors duration-300 ${
                    on ? "text-[var(--v-ink)]" : "text-[var(--v-muted)] group-hover:text-[var(--v-ink)]"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---- The figure -------------------------------------------------- */}
        <div id="ps-panel" role="tabpanel" aria-labelledby={`ps-tab-${step}`}>
          <Reveal>
            <Figure step={step} />
          </Reveal>
          {active.body && (
            <p
              key={active.title}
              className="v-serif dp-ps-in mt-8 max-w-[52ch] text-[length:var(--t-secondary)] leading-[1.7] text-[var(--v-muted)]"
            >
              {active.body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Figure({ step }: { step: number }) {
  /* Read once, here, rather than scattered through the markup: what each stage
     means is a fact about the process and belongs in one place. */
  const marketOn = step >= 1;
  const shortlisted = step >= 2;
  const linked = step >= 3;
  const seated = step >= 4;

  const chosen = MARKET[CHOSEN];
  /* The chosen candidate travels the line at the last step. Its position is
     interpolated rather than animated, so going backwards is exact. */
  const cx = seated ? SEAT.x : chosen[0];
  const cy = seated ? SEAT.y : chosen[1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="dp-ps w-full"
      role="img"
      aria-label="A vacancy in an organisation, a market of candidates, and the one who is placed into it."
    >
      <defs>
        <radialGradient id="ps-glow">
          <stop offset="0%" stopColor="var(--v-primary)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--v-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ONE GROUND, NOT TWO PANELS.

          The first version boxed the market and the organisation separately,
          and two boxes side by side are two cards: nothing said they were the
          same picture, and at the first step one of them sat empty with a
          single stray mark in it. A search is a relationship BETWEEN those two
          places, so they share one space and are told apart by where they sit
          in it and by a caption, the way the reference names its actors rather
          than framing them. */}
      <rect className="dp-ps-ground" x={14} y={58} width={532} height={272} rx={18} />

      {/* ---- The structure. Present from the first step. ------------------ */}
      <g className="dp-ps-struct">
        <path d="M398 130h64M364 208h136M332 286h200" />
      </g>
      <g className="dp-ps-seats">
        {[[398, 208], [432, 208], [466, 208], [354, 286], [406, 286], [458, 286], [510, 286]].map(
          ([x, y]) => (
            <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width={12} height={12} rx={2.5} />
          ),
        )}
      </g>

      {/* The vacancy. Dashed while empty, gone once the seat is taken. */}
      <rect
        className="dp-ps-vacancy"
        x={SEAT.x - 11}
        y={SEAT.y - 11}
        width={22}
        height={22}
        rx={4}
        data-filled={seated ? "true" : undefined}
      />

      {/* THE GAP, PRESENT FROM THE FIRST FRAME.

          The reference opens with a dotted arc and the words "cold outreach
          can't close the gap": the connection exists as a PROBLEM before it
          exists as a solution, which is what makes the two halves one picture
          from the start rather than two things that meet later. This is the
          same move. It fades out as the real line takes over. */}
      <path
        className="dp-ps-gap"
        data-off={linked ? "true" : undefined}
        d={`M150 196 C 230 128, 330 106, ${SEAT.x - 16} ${SEAT.y}`}
      />

      {/* ---- The market -------------------------------------------------- */}
      <g className="dp-ps-market" data-on={marketOn ? "true" : undefined}>
        {MARKET.map(([x, y], i) => {
          if (i === CHOSEN) return null;
          const keep = !shortlisted || SHORTLIST.has(i);
          return (
            <rect
              key={i}
              x={x - 5.5}
              y={y - 5.5}
              width={11}
              height={11}
              rx={2}
              className={keep ? "is-kept" : "is-dropped"}
              style={{ transitionDelay: `${(i % 6) * 55}ms` }}
            />
          );
        })}
      </g>

      {/* ---- The line from the chosen candidate to the seat --------------- */}
      <path
        className="dp-ps-link"
        /* AN ATTRIBUTE, NOT A CSS PROPERTY. `pathLength` cannot be set from a
           stylesheet, and setting it there fails silently: the dash rule then
           runs against this curve's real length of 274 units, so the line drew
           from 0 to 100, vanished from 100 to 200, and reappeared for the last
           74. A visible hole in the middle of the one line the section is
           about. The marks and the stat gauges set it as an attribute; this
           did not, and that was the whole difference. */
        pathLength={100}
        data-on={linked ? "true" : undefined}
        d={`M${chosen[0]} ${chosen[1]} C ${chosen[0] + 120} ${chosen[1] - 70}, ${SEAT.x - 120} ${SEAT.y + 40}, ${SEAT.x} ${SEAT.y}`}
      />

      {/* ---- The candidate who is placed ----------------------------------
          HIDDEN UNTIL THE MARKET EXISTS. It used to render from the first
          frame, which put one unexplained grey square alone inside an empty
          box: the single most broken-looking thing in the section, and the
          first thing anyone saw. A figure cannot show its subject before it
          has shown the subject's context. */}
      <g className="dp-ps-pick" data-on={marketOn ? "true" : undefined}>
        <circle
          className="dp-ps-halo"
          cx={cx}
          cy={cy}
          r={40}
          fill="url(#ps-glow)"
          data-on={seated ? "true" : undefined}
        />
        <rect
          className="dp-ps-chosen"
          x={cx - 9}
          y={cy - 9}
          width={18}
          height={18}
          rx={3.5}
          data-picked={shortlisted ? "true" : undefined}
        />
      </g>

      {/* Captions on the actors, not frames around them. */}
      <g className="dp-ps-caption">
        <text x={150} y={324} textAnchor="middle">The market</text>
        <text x={432} y={324} textAnchor="middle">Your organisation</text>
      </g>
    </svg>
  );
}
