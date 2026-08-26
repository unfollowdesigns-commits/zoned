/**
 * The work, as an interface.
 *
 * WHAT THIS IS. A flat product UI, laid out as a real dashboard would be, with
 * structural connector lines running from each panel to the action it affords
 * and signal travelling along those lines. It is the section's argument in one
 * picture: a search is not a mailbox full of CVs, it is an instrumented
 * process with a shortlist, a scorecard, a schedule and a market view attached
 * to each other.
 *
 * IT IS NOT A SCREENSHOT AND MUST NEVER READ AS ONE. There is no product to
 * screenshot, and dressing an illustration up as a real console would be
 * claiming software the firm does not sell. So it is drawn in the site's own
 * material and stays deliberately schematic: no window chrome, no cursor, no
 * fake browser frame.
 *
 * THE CANDIDATE IS ANONYMOUS, AND THAT IS BOTH SAFER AND TRUER. The brief for
 * this asked for a named candidate card, "Marcus Vance, CFO Candidate". A
 * plausible full name on a plausible record is the kind of thing that gets
 * screenshotted out of context and read as a real placement, and inventing
 * people is the line this build holds everywhere else. It is also wrong about
 * the business: in retained search the candidate list is the confidential part,
 * and a console that showed real names on a public marketing page would be
 * advertising a breach. A reference and a role says the same thing about the
 * product and the right thing about the practice.
 *
 * NO NUMBERS THAT COULD BE READ AS RESULTS. The bar chart is a distribution
 * across the four practice areas the firm actually runs (lib/site.ts), with no
 * scale, no axis and no counts. It shows that the work is measured, not what
 * it measured.
 *
 * CONNECTORS ARE ONE SVG OVER A PERCENTAGE GRID. Every panel is placed at a
 * percentage of the frame and the connector paths are drawn in the same
 * coordinate space, so the lines meet the cards exactly at any width instead
 * of being nudged into place with magic pixel offsets. The travelling dots ride
 * those same paths with `offset-path`, which means one source of truth for the
 * geometry: change a card's position and its line and its dot follow.
 */

import { FUNCTIONS } from "@/lib/site";

/* The four practice areas, straight from the navigation, so the chart cannot
   disagree with what the firm says it covers. The weights are a shape, not a
   measurement: see the note above. */
const PRACTICE = FUNCTIONS.map((f, i) => ({
  /* "Finance | Accounting" is a nav label; a chart row wants the short form. */
  label: f.label.split(" | ")[0].split(",")[0],
  weight: [92, 74, 58, 44][i],
}));

/**
 * Connector geometry, in the frame's own 0-100 coordinate space.
 *
 * EVERY PANEL HAS AN EXPLICIT TOP AND HEIGHT, and these paths are written
 * against those numbers rather than eyeballed. The first pass placed cards by
 * top-left alone and let their content decide how tall they were, which is
 * how the schedule panel ended up printed across both the scorecard pill and
 * the chart's heading. A figure whose parts are positioned absolutely needs
 * its layout written down somewhere; here it is LAYOUT below.
 */
const LINES = [
  /* Candidate record, down and across to its scorecard action. */
  { d: "M9 27 V32.5 H13", dur: "3.4s", delay: "0s" },
  /* Schedule, down and across to the match badge. */
  { d: "M9 55.5 V60.5 H13", dur: "3.2s", delay: "1.5s" },
  /* Candidate record, across to the rail that tracks it. */
  { d: "M66 13 H70", dur: "2.9s", delay: "0.6s" },
  /* Practice chart, down and across to its report action. */
  { d: "M9 90 V96 H13", dur: "3.8s", delay: "1.1s" },
];

/**
 * Where each panel sits and how tall it is, as percentages of the frame.
 *
 * Heights are declared rather than derived so the connectors above can be
 * written against known edges. The type inside scales in `cqw`, so a panel's
 * content grows and shrinks with the frame and these numbers stay true at
 * every width.
 */
const LAYOUT = {
  candidate: { left: 3, top: 4, width: 63, height: 22 },
  scorecard: { left: 13, top: 29.5 },
  schedule: { left: 3, top: 39, width: 54, height: 16 },
  badge: { left: 13, top: 57.5 },
  chart: { left: 3, top: 62, width: 63, height: 28 },
  report: { left: 13, top: 93 },
  /* No height: the rail is a list, so it should be as tall as its list. A
     fixed height left a third of it empty. */
  rail: { left: 70, top: 4, width: 27 },
} as const;

/** Turns a layout entry into the inline style that positions it. */
function place(k: keyof typeof LAYOUT, delay: string) {
  const l = LAYOUT[k] as { left: number; top: number; width?: number; height?: number };
  return {
    left: `${l.left}%`,
    top: `${l.top}%`,
    ...(l.width ? { width: `${l.width}%` } : null),
    ...(l.height ? { height: `${l.height}%` } : null),
    ["--d" as string]: delay,
  };
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="dp-sc-check" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" strokeWidth="1.4" />
      <path d="M4.6 8.3 L6.9 10.5 L11.4 5.7" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchConsole() {
  return (
    <div className="dp-sc" aria-hidden="true">
      <div className="dp-sc-frame">
        {/* ---- Connectors, under the panels so the lines run into them ---- */}
        <svg className="dp-sc-wires" viewBox="0 0 100 100" preserveAspectRatio="none">
          {LINES.map((l) => (
            <path key={l.d} className="dp-sc-wire" d={l.d} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {/* PLACEHOLDER: the sparks are rendered after the panels, below. */}

        {/* ---- The candidate record --------------------------------------- */}
        <article className="dp-sc-card is-candidate" style={place("candidate", "0.05s")}>
          <div className="dp-sc-row">
            {/* A monogram, not a face. See the note on anonymity above. */}
            <span className="dp-sc-avatar">04</span>
            <div className="min-w-0">
              <p className="dp-sc-title">Candidate 04</p>
              <p className="dp-sc-sub">Chief Financial Officer</p>
            </div>
            <span className="dp-sc-tag">Vetted</span>
          </div>
          <div className="dp-sc-meter">
            <span style={{ ["--w" as string]: "84%", ["--i" as string]: 0 }} />
            <span style={{ ["--w" as string]: "68%", ["--i" as string]: 1 }} />
            <span style={{ ["--w" as string]: "91%", ["--i" as string]: 2 }} />
          </div>
        </article>

        <span className="dp-sc-pill" style={place("scorecard", "0.45s")}>
          Summarise scorecards
        </span>

        {/* ---- The practice chart ------------------------------------------ */}
        <article className="dp-sc-card is-chart" style={place("chart", "0.2s")}>
          <p className="dp-sc-eyebrow">Searches by practice</p>
          <ul className="dp-sc-bars">
            {PRACTICE.map((p, i) => (
              <li key={p.label}>
                <span className="dp-sc-bar-label">{p.label}</span>
                <span className="dp-sc-bar">
                  <i style={{ ["--w" as string]: `${p.weight}%`, ["--i" as string]: i }} />
                </span>
              </li>
            ))}
          </ul>
        </article>

        <span className="dp-sc-pill" style={place("report", "0.6s")}>
          Build a report
        </span>

        {/* ---- The schedule ------------------------------------------------- */}
        <article className="dp-sc-card is-schedule" style={place("schedule", "0.35s")}>
          <p className="dp-sc-eyebrow">Suggested times</p>
          <div className="dp-sc-slots">
            {["Tue 09:30", "Wed 14:00", "Thu 11:15"].map((t, i) => (
              <span key={t} className={i === 1 ? "is-on" : undefined}>
                {t}
              </span>
            ))}
          </div>
        </article>

        <span className="dp-sc-badge" style={place("badge", "0.75s")}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 0.6 L7.6 4.2 L11.4 4.6 L8.6 7.2 L9.4 11 L6 9.1 L2.6 11 L3.4 7.2 L0.6 4.6 L4.4 4.2 Z" />
          </svg>
          Strong match
        </span>

        {/* ---- The rail ------------------------------------------------------ */}
        <aside className="dp-sc-rail" style={place("rail", "0.3s")}>
          <p className="dp-sc-eyebrow">Active search</p>
          <ul className="dp-sc-tasks">
            {[
              ["Mandate defined", true],
              ["Market mapped", true],
              ["Shortlist agreed", true],
              ["Panel scheduled", false],
            ].map(([label, done], i) => (
              <li key={String(label)} data-done={done || undefined} style={{ ["--i" as string]: i }}>
                <Check />
                {label}
              </li>
            ))}
          </ul>
          <div className="dp-sc-links">
            {["Open searches", "Pipeline", "Market insight"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </aside>

        {/* THE TRAVELLING SIGNAL, IN A SECOND SVG OVER THE TOP.
            It is a separate element from the wires for two reasons. It has to
            paint ABOVE the panels while the wires paint below them, so the
            lines run into the cards but the signal is never swallowed by one.
            And `offset-path: path()` resolves its coordinates in the units of
            the element it is on: on an HTML div that means PIXELS, so the same
            path string that spans this frame as an SVG child would have sent
            every spark on a hundred-pixel run in the top-left corner. Inside an
            SVG with the same viewBox as the wires, the numbers mean what they
            mean everywhere else in this component. */}
        <svg className="dp-sc-sparks" viewBox="0 0 100 100" preserveAspectRatio="none">
          {LINES.map((l) => (
            <circle
              key={l.d}
              className="dp-sc-spark"
              r={0.9}
              style={{
                offsetPath: `path("${l.d}")`,
                animationDuration: l.dur,
                animationDelay: l.delay,
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
