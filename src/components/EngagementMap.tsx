"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { whenReached } from "@/lib/in-view";
import { useReducedMotion } from "@/lib/motion";

/**
 * When each engagement puts someone in the seat, and how long they stay.
 *
 * WHAT THIS REPLACED, AND WHY THE FIRST ONE DESERVED TO GO. It was a scatter
 * plot: two qualitative axes and three translucent ellipses with their names
 * printed across them. Three things were wrong with it and none was fixable
 * by tuning. A blob has no position, so nothing was actually located on
 * either axis. The labels sat ON the shapes rather than beside a point, so
 * the eye had nothing to measure against. And three regions in a 2D field
 * left most of the plot empty, which is what made it read as decoration with
 * axes attached rather than as an instrument.
 *
 * THE SAME TWO VARIABLES, AS A TIMELINE. Time runs left to right once, shared
 * by all three rows, and each row is a bar on it. That is a Gantt, which is
 * the form this information wanted all along: a bar has a start you can point
 * at and a length you can compare, which is exactly the pair of things a blob
 * cannot give you.
 *
 * AND THE BAR HAS TWO HALVES, WHICH IS THE WHOLE ARGUMENT. Before the seat is
 * filled the track is hatched: that is the search, and it runs longer for more
 * senior work. After it the track is solid: that is someone in the seat. The
 * node between them is the moment of placement. Interim reaches that moment
 * almost immediately and its bar then ENDS, because the engagement does.
 * Executive Search reaches it last and its bar runs off the end of the axis,
 * because the appointment does not stop. Nobody has to be told which one they
 * need; the picture says it.
 *
 * IT IS HTML, NOT SVG, AND THAT IS ALSO THE MOBILE FIX. The old figure was an
 * 800-unit viewBox, so on a 390px phone its labels rendered near six pixels
 * and it had to be hidden below `sm` with the legend carrying its reading in
 * words. Bars in normal flow are typeset by the browser at real font sizes,
 * so this is one figure at every width instead of one figure and an apology.
 *
 * NO NUMBERS ON IT, deliberately. Positions are a design statement about how
 * the work goes, which the firm can correct in a sentence. "38 days" would be
 * a performance claim invented for a real firm, and those never get corrected.
 */

type Row = {
  label: string;
  href: string;
  colour: string;
  /** Where the seat is filled, as a percentage along the axis. */
  start: number;
  /** Where the engagement ends. Absent means it does not: a permanent seat. */
  end?: number;
  note: string;
};

const ROWS: Row[] = [
  {
    label: "Interim Solutions",
    href: "/what-we-do/interim-solutions",
    colour: "#35b0d8",
    start: 9,
    end: 63,
    note: "Someone in the building now, until the permanent hire is in place.",
  },
  {
    label: "Professional Search",
    href: "/what-we-do/professional-search",
    colour: "#5b93ff",
    start: 45,
    note: "The management teams and individual contributors who execute the vision.",
  },
  {
    label: "Executive Search",
    href: "/what-we-do/executive-search",
    colour: "#9b7bf0",
    start: 71,
    note: "Board and C-suite appointments, retained.",
  },
];

const TICKS = ["Day one", "Days", "Weeks", "A considered process"];

export default function EngagementMap() {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (reduced) {
      setReady(true);
      return;
    }
    /* The shared level-triggered checker, not an IntersectionObserver: an
       observer attached after hydration never fires for anything already
       scrolled past, which here would leave every bar at zero width. */
    return whenReached(host, () => setReady(true));
  }, [reduced]);

  return (
    <div ref={ref} data-ready={ready || undefined} className="dp-tl">
      {/* The axis is stated once, at the top, because all three rows share it.
          Repeating it per row is what turns a Gantt into three charts. */}
      <div className="dp-tl-head">
        <p className="v-eyebrow text-[var(--v-primary)]">Time to placement</p>
        <ol className="dp-tl-ticks" aria-hidden="true">
          {TICKS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      <ul className="dp-tl-rows">
        {ROWS.map((r, i) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="dp-tl-row"
              data-on={active === i || undefined}
              data-dim={(active !== null && active !== i) || undefined}
              style={{ ["--c" as string]: r.colour, ["--i" as string]: i }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <div className="dp-tl-name">
                <span className="dp-tl-swatch" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="dp-tl-title">{r.label}</span>
                  <span className="dp-tl-note">{r.note}</span>
                </span>
              </div>

              <div className="dp-tl-track">
                {/* The search: hatched, because it is work rather than a
                    state. Every one starts at the left edge, so the three
                    runs are directly comparable. */}
                <span
                  className="dp-tl-search"
                  aria-hidden="true"
                  style={{ ["--w" as string]: `${r.start}%` }}
                />
                {/* The seat, filled. Runs to its end, or off the axis. */}
                <span
                  className="dp-tl-hold"
                  data-open={r.end === undefined || undefined}
                  aria-hidden="true"
                  style={{
                    ["--x" as string]: `${r.start}%`,
                    ["--w" as string]: `${(r.end ?? 104) - r.start}%`,
                  }}
                />
                {/* The moment of placement. */}
                <span
                  className="dp-tl-seat"
                  aria-hidden="true"
                  style={{ ["--x" as string]: `${r.start}%` }}
                />
                <span className="dp-tl-reading">
                  {r.end === undefined ? "A permanent seat" : "A bridge, until the hire lands"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="dp-tl-key">
        <span aria-hidden="true" className="dp-tl-key-mark is-search" />
        The search
        <span aria-hidden="true" className="dp-tl-key-mark is-hold" />
        Someone in the seat
      </p>
    </div>
  );
}
