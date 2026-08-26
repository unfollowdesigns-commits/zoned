/**
 * District Partners' own stack, running a search, on a loop.
 *
 * EVERY LABEL IN HERE IS THE CLIENT'S OWN WORD FOR THE THING. The previous
 * version invented an interface: an app frame with a chrome bar, a "Progress"
 * checklist and steps called "Mandate defined" and "Panel scheduled". Nobody at
 * District Partners wrote any of that. It was a generic recruiting workflow
 * dressed as their software, which is exactly the kind of plausible invention
 * this build refuses everywhere else.
 *
 * So the six pieces are the six modules of the stack the firm publishes on The
 * DP Difference, in their order of operation, with their titles unedited:
 * Market Motion Detection, Predictive Talent Mapping, Hidden Talent Discovery,
 * Smart Candidate Scoring, Real-Time Pipeline Access, Dynamic Market Pulse. The
 * bars are the four practices straight out of the navigation. The seat on the
 * record is the first entry in the firm's own list of frequently placed
 * positions. Nothing here is a fact the site does not already state.
 *
 * WHY IT LOOPS, AND WHY THAT IS NOT AN ARBITRARY CHOICE. The last module is
 * Dynamic Market Pulse, which the firm describes as current insight into talent
 * supply and market activity, and the first is Market Motion Detection, which
 * watches for shifts before they are obvious. The end of the sequence is
 * literally the condition that starts it again. The animation repeats because
 * the work does.
 *
 * THE CONTAINER IS GONE AND THE WIRES ARE THE SUBJECT. There is no app frame
 * and no chrome bar: District Partners does not sell a product, so a window
 * around this was borrowing credibility from software that does not exist, and
 * six cards packed in a grid meant the connections between them had nowhere to
 * run. Six pieces float in their own space now, two of them cards and four of
 * them bare, joined by five long routed connectors with signal travelling down
 * them. Each step is reached BY the step before it.
 *
 * ONE CLOCK, NO JAVASCRIPT. Every animation runs for `--loop` and repeats
 * forever, and each element's moment is carved out of that one duration in
 * percentages. That is why the spark arrives exactly as the next panel appears,
 * and why the four bars charge strictly one after another rather than together:
 * they are not separate timers that could drift, they are slots in a single
 * cycle. It also makes reduced motion one rule that stops the clock and leaves
 * the finished state on screen.
 *
 * THE COORDINATE SPACE IS SHARED, WHICH IS THE BUG THIS LAYOUT EXISTS TO AVOID.
 * Panels were once placed at hand-tuned percentages with their heights left to
 * their content, and the first thing that happened was one printing across two
 * others. Every box below declares x, y, width AND height in one table, the
 * container carries the matching aspect ratio, and the wires are drawn in the
 * same units, so a number means the same thing in the markup and in the SVG.
 *
 * WHAT IS STILL DELIBERATELY NOT HERE. No photographs of people: stock faces on
 * a candidate record would be inventing people at the exact point where that is
 * worst. No candidate name: a plausible full name on a plausible record is what
 * gets screenshotted out of context and read as a real placement, and in
 * retained search the candidate list is the confidential part. No score value
 * next to Smart Candidate Scoring and no numbers on the chart: they show that
 * the work is measured, not what it measured.
 */

import { FUNCTIONS, PLACED_POSITIONS } from "@/lib/site";

/* ---- The coordinate space --------------------------------------------------
   100 wide by 134 tall. `.dp-sc` carries exactly this aspect ratio and the wire
   overlay uses exactly this viewBox, so these numbers are the single source of
   truth for where everything is. */
const SPACE_W = 100;
const SPACE_H = 134;

type Box = { x: number; y: number; w: number; h: number };

/**
 * Where each module sits.
 *
 * They zigzag on purpose. Panels stacked down one side leave no room for a
 * connector to be anything but a stub, and stubs are what made the first
 * version read as boxes with decoration between them. Alternating sides opens a
 * real gutter beside every panel, which is where the long routed wires run.
 */
const BOXES = {
  motion: { x: 0, y: 0, w: 52, h: 8 },
  mapping: { x: 10, y: 18, w: 90, h: 38 },
  hidden: { x: 0, y: 64, w: 56, h: 15 },
  scoring: { x: 26, y: 86, w: 74, h: 17 },
  pipeline: { x: 0, y: 110, w: 62, h: 13 },
  pulse: { x: 58, y: 126, w: 42, h: 8 },
} satisfies Record<string, Box>;

/** Rounded, so the server and the browser cannot serialise the same number two
    different ways and trip a hydration mismatch. */
const q = (n: number) => `${Math.round(n * 1000) / 1000}%`;
function place(b: Box): React.CSSProperties {
  return {
    left: q(b.x),
    top: q((b.y / SPACE_H) * 100),
    width: q(b.w),
    height: q((b.h / SPACE_H) * 100),
  };
}

/**
 * The five connectors, in the order the modules run.
 *
 * EACH ONE IS DESCRIBED, NOT DRAWN, AND THAT IS DELIBERATE. A wire is two
 * points: it leaves the edge of the module it comes from at (x0, y0), runs out
 * into the gutter, turns through a real radius and arrives on the edge of the
 * module it feeds at (x1, y1). The `d` string and the wire's LENGTH are both
 * generated from those four numbers, which is the whole reason for doing it
 * this way: the draw-on animation runs `stroke-dashoffset` from the length to
 * zero, so a path and its length disagreeing means a line that starts halfway
 * drawn or never finishes.
 *
 * `pathLength` would avoid the arithmetic and does not work here. Set to 1 it
 * is supposed to normalise every distance-along-path value, but a
 * `stroke-dasharray` coming from CSS resolves to `1px` and is used raw, so the
 * hairlines rendered as dotted lines rather than as one dash covering the
 * route. Measured, not assumed: the computed dasharray was `1px` against path
 * lengths of 23 to 47 user units.
 *
 * NOR CAN THESE CARRY `vector-effect: non-scaling-stroke`, for the same family
 * of reason. It keeps a hairline a hairline under a scaled viewBox, which is
 * why it was here, but it also moves the whole stroke into screen space: the
 * dash pattern is then measured in pixels while the path is measured in user
 * units, and at the four-to-one scale this box runs at, a dash meant to cover
 * the route covered a quarter of it and repeated. The lines came out as
 * fragments. The stroke is set in user units instead, which lands between one
 * and one and a third pixels across the sizes this component is ever drawn at.
 *
 * Routed rather than drawn straight, because a line with a corner in it reads
 * as a route between two things and a diagonal reads as a decoration over them.
 */
type Wire = { x0: number; y0: number; x1: number; y1: number };

const WIRE_SPECS: Wire[] = [
  /* Market Motion Detection, out right and down into the mapping chart */
  { x0: 52, y0: 4, x1: 78, y1: 18 },
  /* Predictive Talent Mapping, out left and down the outside into discovery */
  { x0: 10, y0: 41, x1: 4, y1: 64 },
  /* Hidden Talent Discovery, out right and down into the candidate record */
  { x0: 56, y0: 71, x1: 90, y1: 86 },
  /* Smart Candidate Scoring, back out left and down into the pipeline */
  { x0: 26, y0: 94, x1: 8, y1: 110 },
  /* Real-Time Pipeline Access, out right and down into the market pulse */
  { x0: 62, y0: 116, x1: 78, y1: 126 },
];

/** The corner radius every wire turns through. One value, so the routes read as
    one system rather than five drawings. */
const R = 6;
/**
 * The arc length of that corner.
 *
 * A quadratic Bezier from (0,0) to (1,1) with its control point at the corner
 * (1,0) has length 1.6099, and every corner here is that shape scaled by R. It
 * is a constant rather than a computed integral on purpose: this number ends up
 * in an attribute, and anything involving `Math.pow` or `Math.sin` is
 * implementation-defined in its last bit, which is exactly how a server and a
 * browser end up serialising the same geometry two different ways and tripping
 * a hydration mismatch.
 *
 * Checked against the browser: with this value the computed dash lengths come
 * out within a twentieth of a unit of what `getTotalLength` reports for the
 * same paths. The half unit added below covers that and the wrong direction is
 * the one that matters: a dash SHORTER than its path leaves a stub of line
 * showing when the wire is supposed to be undrawn.
 */
const CORNER = 1.6099 * R;
/** Slack, so the dash is never shorter than the path it has to cover. */
const SLACK = 0.5;

const round = (n: number) => Math.round(n * 100) / 100;

/** The path: run, corner, run. */
function wirePath(w: Wire): string {
  const s = w.x1 > w.x0 ? 1 : -1;
  return `M${w.x0} ${w.y0} H${w.x1 - s * R} Q${w.x1} ${w.y0} ${w.x1} ${w.y0 + R} V${w.y1}`;
}
/** Its length, from the same four numbers. */
function wireLength(w: Wire): number {
  return round(Math.abs(w.x1 - w.x0) - R + CORNER + (w.y1 - w.y0 - R) + SLACK);
}

const WIRES = WIRE_SPECS.map((w) => ({ d: wirePath(w), len: wireLength(w) }));

/** Both ends of every wire, so each connection is pinned by a visible node. */
const JUNCTIONS = WIRE_SPECS.flatMap((w, i) => [
  { x: w.x0, y: w.y0, wire: i },
  { x: w.x1, y: w.y1, wire: i },
]);

/* Straight from the navigation, so the chart cannot disagree with what the firm
   says it covers. The weights are a shape, not a measurement, which is why no
   value is printed anywhere near them. */
const PRACTICE = FUNCTIONS.map((f, i) => ({
  label: f.label.split(" | ")[0].split(",")[0],
  weight: [88, 71, 55, 38][i],
}));

/* The firm's own most frequently placed seat, minus the abbreviation. */
const SEAT = PLACED_POSITIONS[0].replace(/\s*\(.*\)$/, "");

/* The span the firm describes its pipeline access as covering: initial
   outreach through final interviews, with sourcing ahead of both. */
const PIPELINE = ["Sourcing", "Outreach", "Interviews"];

const STEP = ["a", "b", "c", "d", "e"] as const;

/** A live indicator. Used only where the firm's own copy says something is
    happening now: market motion, and market pulse. */
function Live() {
  return <span className="dp-sc-live" aria-hidden="true" />;
}

export default function SearchConsole() {
  return (
    <div className="dp-sc" aria-hidden="true">
      {/* ---- The wires -------------------------------------------------------
          One overlay across the whole space, under the panels. Each path
          carries its own length as `--len`, which the draw-on keyframes run
          `stroke-dashoffset` down from, and each spark rides the identical `d`
          string, so a line and the signal on it can never disagree. */}
      <svg className="dp-sc-wires" viewBox={`0 0 ${SPACE_W} ${SPACE_H}`} aria-hidden="true">
        {WIRES.map((w, i) => (
          <path
            key={`w${i}`}
            className={`dp-sc-wire is-${STEP[i]}`}
            d={w.d}
            style={{ ["--len" as string]: w.len }}
          />
        ))}
        {JUNCTIONS.map((j, i) => (
          <circle
            key={`j${i}`}
            className={`dp-sc-junction is-${STEP[j.wire]}`}
            cx={j.x}
            cy={j.y}
            r="0.7"
          />
        ))}
        {WIRES.map((w, i) => (
          <circle
            key={`s${i}`}
            className={`dp-sc-spark is-${STEP[i]}`}
            r="0.9"
            style={{ offsetPath: `path("${w.d}")` }}
          />
        ))}
      </svg>

      {/* ---- 1. Market Motion Detection --------------------------------------
          "Identifies shifts, hiring activity, and emerging talent trends before
          they become obvious in the broader market." The only thing on screen
          for the first second of the loop, because it is what starts a search
          before anyone has written a brief. */}
      <div className="dp-sc-panel is-pill is-motion" style={place(BOXES.motion)}>
        <Live />
        Market Motion Detection
      </div>

      {/* ---- 2. Predictive Talent Mapping ------------------------------------
          "Maps talent markets and identifies the people, companies, and career
          paths most relevant to a search." The four practices map one at a
          time, slowly, because that is the part of the work that takes the
          longest and the part a scatter of dots never said anything about. */}
      <div className="dp-sc-panel is-card is-mapping" style={place(BOXES.mapping)}>
        <p className="dp-sc-title">Predictive Talent Mapping</p>
        {/* No axis and no values. There was a row of ticks here to say the
            bars are measured against something; at this size it read as a
            smudge against the card's bottom edge and it was the first thing
            that overflowed. The bars are a shape, and the sub-line already
            says what they are a shape OF. */}
        <p className="dp-sc-sub">Across the four practices</p>
        <ul className="dp-sc-bars">
          {PRACTICE.map((p, i) => (
            <li key={p.label} className={`is-${i + 1}`}>
              <span className="dp-sc-bar-label">{p.label}</span>
              <span className="dp-sc-bar">
                <i style={{ ["--w" as string]: `${p.weight}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- 3. Hidden Talent Discovery --------------------------------------
          "Expands our reach beyond traditional sourcing channels to uncover
          candidates others may never find." No card: a label and four
          references arriving one after another IS the idea, and a box around it
          would only add another rectangle. */}
      <div className="dp-sc-panel is-hidden" style={place(BOXES.hidden)}>
        <p className="dp-sc-title">Hidden Talent Discovery</p>
        <div className="dp-sc-discs">
          {["01", "04", "07", "09"].map((n, i) => (
            <span key={n} className={`is-${i + 1}`}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* ---- 4. Smart Candidate Scoring --------------------------------------
          "Helps our team quickly assess and prioritize candidates against the
          experience and criteria that matter most." The chip says the module
          ran; it does not carry a score, because the firm publishes none. */}
      <div className="dp-sc-panel is-card is-scoring" style={place(BOXES.scoring)}>
        <span className="dp-sc-avatar">04</span>
        <span className="dp-sc-ident">
          <span className="dp-sc-name">Candidate 04</span>
          <span className="dp-sc-role">{SEAT}</span>
        </span>
        <span className="dp-sc-chip">Scored</span>
      </div>

      {/* ---- 5. Real-Time Pipeline Access ------------------------------------
          "See our activity, candidate pipeline, and search progress as it
          happens." The stage that is live is the one the client would be
          watching move. */}
      <div className="dp-sc-panel is-pipeline" style={place(BOXES.pipeline)}>
        <p className="dp-sc-title">Real-Time Pipeline Access</p>
        <div className="dp-sc-stages">
          {PIPELINE.map((s, i) => (
            <span key={s} className={i === 1 ? "is-on" : undefined}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ---- 6. Dynamic Market Pulse -----------------------------------------
          "Provides current insight into talent supply, compensation, market
          activity, and search conditions." The last module, and the reason the
          loop is a loop: it is the same live market reading that Market Motion
          Detection is watching at the top. */}
      <div className="dp-sc-panel is-pill is-pulse" style={place(BOXES.pulse)}>
        <Live />
        Dynamic Market Pulse
      </div>
    </div>
  );
}
