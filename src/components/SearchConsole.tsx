/**
 * The work, as an interface.
 *
 * WHAT IT IS. A flat product UI: an app frame with its own chrome bar and a
 * grid of white cards inside it, one floating badge outside the frame joined
 * to it by a curved connector, and signal travelling that connector. It is the
 * hero's claim in one picture: a search is an instrumented process with a
 * record, a scorecard, a schedule and a market view attached to each other,
 * not a mailbox full of CVs.
 *
 * WHY IT IS LIGHT ON A DARK HERO. The reference this is measured against runs
 * white cards on a tinted ground, and that contrast is most of why it reads as
 * a product rather than as an illustration: real software is light, and a dark
 * translucent panel on a dark page reads as more page. The first version was
 * glass on glass and had no focal point at all.
 *
 * WHAT IS DELIBERATELY NOT COPIED FROM THE REFERENCE. It runs photographs of
 * people as candidate avatars. There is no photography on this site, and stock
 * faces on a candidate record would be inventing people at the exact point
 * where inventing people is worst. Monograms carry the same information about
 * the interface and none of the risk.
 *
 * THE CANDIDATE IS ANONYMOUS, AND THAT IS BOTH SAFER AND TRUER. A plausible
 * full name on a plausible record is what gets screenshotted out of context
 * and read as a real placement. It is also wrong about the business: in
 * retained search the candidate list is the confidential part, so a console
 * showing names on a public marketing page would be advertising a breach.
 *
 * NO NUMBERS THAT COULD BE READ AS RESULTS. The chart's axis carries ticks but
 * no values and the bars carry no counts. It shows that the work is measured,
 * not what it measured.
 *
 * IT IS A CSS GRID, NOT ABSOLUTE POSITIONING. The previous version placed
 * every panel at a hand-tuned percentage, which is how the schedule ended up
 * printed across two other cards the first time it rendered. A grid cannot
 * overlap itself, and the one connector that does need real geometry is drawn
 * outside the frame, where nothing is competing for the space.
 */

import { FUNCTIONS } from "@/lib/site";
import { MARK_PARTS } from "@/components/Logo";

/* Straight from the navigation, so the chart cannot disagree with what the
   firm says it covers. The weights are a shape, not a measurement. */
const PRACTICE = FUNCTIONS.map((f, i) => ({
  label: f.label.split(" | ")[0].split(",")[0],
  weight: [88, 71, 55, 38][i],
}));

const TASKS: Array<[string, boolean]> = [
  ["Mandate defined", true],
  ["Market mapped", true],
  ["Shortlist agreed", true],
  ["Panel scheduled", false],
];

/** The connector, once, so the path and the spark that rides it cannot drift. */
/*
 * Leaves the badge's right edge, runs across, and turns down through a real
 * radius into the frame's top edge. Routed this way round on purpose: the
 * first version came in from the top right and passed BESIDE the badge, which
 * left the badge looking like it was floating near a line rather than hanging
 * off one. A connector has to start at the thing it connects.
 */
const WIRE = "M27 8 H60 Q66 8 66 14 V18";

function Sparkle() {
  return (
    <svg viewBox="0 0 12 12" className="dp-sc-sparkle" aria-hidden="true">
      <path d="M6 0.5 L7.1 4.9 L11.5 6 L7.1 7.1 L6 11.5 L4.9 7.1 L0.5 6 L4.9 4.9 Z" />
    </svg>
  );
}

function Tick({ on, i }: { on: boolean; i: number }) {
  return (
    <svg viewBox="0 0 18 18" className={on ? "dp-sc-tick is-on" : "dp-sc-tick"} aria-hidden="true">
      <circle cx="9" cy="9" r="8" />
      <path
        d="M5.2 9.3 L7.8 11.8 L12.8 6.4"
        style={{ ["--i" as string]: i }}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchConsole() {
  return (
    <div className="dp-sc" aria-hidden="true">
      {/* ---- The connector, and the badge it carries ----------------------
          One line with a real radius on its corner, running from the badge up
          and over into the top of the frame. That move is the whole reason the
          badge reads as attached to the product rather than pasted beside it.
          It is drawn in its own overlay so it can sit outside the frame. */}
      <svg className="dp-sc-wire-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="dp-sc-wire" d={WIRE} vectorEffect="non-scaling-stroke" />
        <circle className="dp-sc-spark" r="1.1" style={{ offsetPath: `path("${WIRE}")` }} />
      </svg>

      {/* The one claim outside the frame, in the firm's own word for it from
          What We Do rather than a slogan written for this slot. */}
      <span className="dp-sc-flag">
        <Sparkle />
        Partner-Led
      </span>

      <div className="dp-sc-app">
        {/* Chrome. A product has a frame around it; without one this is a pile
            of cards. The mark is the real one, imported rather than redrawn. */}
        <div className="dp-sc-chrome">
          <svg viewBox={MARK_PARTS.viewBox} className="dp-sc-chrome-mark" aria-hidden="true">
            <path d={MARK_PARTS.bracket} fill="#8fb4ff" />
            <path d={MARK_PARTS.blueRing} fillRule="evenodd" fill="#8fb4ff" />
            <path d={MARK_PARTS.inkRing} fillRule="evenodd" fill="#ffffff" />
          </svg>
          <span className="dp-sc-chrome-title">Active search</span>
          <span className="dp-sc-chrome-avatar">DP</span>
        </div>

        <div className="dp-sc-grid">
          {/* ---- The record ------------------------------------------------ */}
          <article className="dp-sc-card is-record" style={{ ["--d" as string]: "0.08s" }}>
            <div className="dp-sc-record-head">
              <span className="dp-sc-avatar">04</span>
              <span className="dp-sc-ident">
                <span className="dp-sc-name">Candidate 04</span>
                <span className="dp-sc-role">Chief Financial Officer</span>
              </span>
              <span className="dp-sc-chip is-good">Vetted</span>
            </div>
            <div className="dp-sc-subrow">
              <Sparkle />
              Scorecards summarised
            </div>
          </article>

          {/* ---- The task rail ---------------------------------------------- */}
          <article className="dp-sc-card is-tasks" style={{ ["--d" as string]: "0.2s" }}>
            <p className="dp-sc-cardtitle">Progress</p>
            <ul className="dp-sc-tasks">
              {TASKS.map(([label, done], i) => (
                <li key={label} data-done={done || undefined}>
                  <Tick on={done} i={i} />
                  {label}
                </li>
              ))}
            </ul>
          </article>

          {/* ---- The shortlist --------------------------------------------- */}
          <article className="dp-sc-card is-list" style={{ ["--d" as string]: "0.28s" }}>
            <p className="dp-sc-cardtitle">Shortlist</p>
            <div className="dp-sc-faces">
              {["01", "04", "07", "09"].map((n, i) => (
                <span key={n} style={{ ["--i" as string]: i }}>
                  {n}
                </span>
              ))}
            </div>
            <span className="dp-sc-action">
              <Sparkle />
              Summarise scorecards
            </span>
          </article>

          {/* ---- The practice chart ------------------------------------------ */}
          <article className="dp-sc-card is-chart" style={{ ["--d" as string]: "0.36s" }}>
            <div className="dp-sc-chart-head">
              <span>
                <p className="dp-sc-cardtitle">Searches by practice</p>
                <p className="dp-sc-cardsub">Across the four practices</p>
              </span>
              <span className="dp-sc-action">
                <Sparkle />
                Build a report
              </span>
            </div>
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
            {/* An axis with ticks and no values: enough to say the bars are
                measured against something, without publishing a figure the
                firm has not. */}
            <div className="dp-sc-axis">
              <span />
              <span />
              <span />
            </div>
          </article>

          {/* ---- The schedule ------------------------------------------------- */}
          <article className="dp-sc-card is-schedule" style={{ ["--d" as string]: "0.44s" }}>
            <p className="dp-sc-cardtitle">Suggested interview times</p>
            <div className="dp-sc-slots">
              {["Tue 09:30", "Wed 14:00", "Thu 11:15"].map((t, i) => (
                <span key={t} className={i === 1 ? "is-on" : undefined}>
                  {t}
                </span>
              ))}
            </div>
          </article>

          {/* ---- The verdict --------------------------------------------------- */}
          <article className="dp-sc-card is-verdict" style={{ ["--d" as string]: "0.52s" }}>
            <span className="dp-sc-star">
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path d="M7 0.8 L8.8 5 L13.3 5.4 L9.9 8.4 L10.9 12.8 L7 10.5 L3.1 12.8 L4.1 8.4 L0.7 5.4 L5.2 5 Z" />
              </svg>
            </span>
            Strong match
          </article>
        </div>
      </div>
    </div>
  );
}
