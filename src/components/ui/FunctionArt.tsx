/**
 * A figure per function, and each one is a picture of what the function IS.
 *
 * WHY NOT REUSE THE BLOG'S CARD ART. That set is deliberately abstract:
 * contours, halftone, chevrons. It works there because a blog card's job is to
 * be distinguishable from the card beside it, and the category hue does the
 * telling. Here the card's job is different. A visitor scanning this page is
 * asking "do they know MY function", and an abstract texture beside the words
 * Risk and Compliance answers nothing. So these are diagrams, not textures.
 *
 * EACH ONE IS ITS OWN MARK, ENLARGED AND ELABORATED. See ui/Mark.tsx: the
 * finance mark is columns on a baseline, the technology mark is one seat
 * branching to two, the risk mark is a seat inside brackets, the revenue mark
 * is a rising line arriving at a seat. These take those exact ideas and give
 * them room, so the 19px icon in the navigation and the 400px figure on this
 * page are the same drawing at two scales. That is the difference between a
 * site with icons and a site with a visual language: nothing here is invented
 * for decoration, it is the existing grammar spoken louder.
 *
 * The grammar is unchanged. RULES are structure, NODES are seats, and exactly
 * one node in each figure is filled: the seat this firm is hired to fill.
 *
 * THE HOVER IS THE FIGURE DOING ITS OWN VERB. A shared pulse would have been
 * cheaper and would have said nothing. Instead the ledger's columns rise, the
 * branch propagates outward, the boundaries close inward, and the growth line
 * draws itself and lands. Each is the motion that thing actually makes, which
 * is why it reads as meaning rather than as an effect. It runs only on hover
 * or focus, so a page of four costs nothing at rest.
 *
 * No JavaScript, no state, deterministic: these are static SVG plus CSS.
 */

export type FunctionKind = "finance" | "technology" | "risk" | "revenue";

/** Stroke and node sizing, fixed across all four so they read as one set. */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** A seat. `on` means this is the one being placed. */
function Node({ x, y, on = false, i = 0 }: { x: number; y: number; on?: boolean; i?: number }) {
  return (
    <rect
      className={on ? "dp-fa-node is-on" : "dp-fa-node"}
      style={{ ["--i" as string]: i }}
      x={x - 5}
      y={y - 5}
      width={10}
      height={10}
      rx={2}
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    />
  );
}

/* ---- Finance & Accounting: the ledger ------------------------------------
   Columns on a baseline, which is what a set of accounts looks like when it is
   drawn. One column carries the seat. */
function Finance() {
  const cols = [
    { x: 34, h: 38 },
    { x: 60, h: 62 },
    { x: 86, h: 30 },
    { x: 112, h: 84 },
    { x: 138, h: 48 },
    { x: 164, h: 66 },
  ];
  const base = 122;
  /* The tallest column is the one with the seat on it: the figure says the
     seat is what the numbers are built up to, rather than a label stuck on a
     random bar. */
  const seat = 3;
  return (
    <>
      {cols.map((c, i) => (
        <rect
          key={c.x}
          className="dp-fa-col"
          style={{ ["--i" as string]: i }}
          x={c.x - 7}
          y={base - c.h}
          width={14}
          height={c.h}
          rx={2}
          fill="currentColor"
          fillOpacity={i === seat ? 0.34 : 0.14}
        />
      ))}
      <path d={`M18 ${base}h164`} {...S} />
      {cols.map((c, i) => (
        <Node key={`n${c.x}`} x={c.x} y={base - c.h} on={i === seat} i={i} />
      ))}
    </>
  );
}

/* ---- Technology | Digital | AI: the branch --------------------------------
   One seat dividing into two, then four. A structure that multiplies, which is
   what building a technology function does. */
function Technology() {
  const root = { x: 30, y: 75 };
  const mid = [
    { x: 100, y: 44 },
    { x: 100, y: 106 },
  ];
  const leaf = [
    { x: 172, y: 26 },
    { x: 172, y: 62 },
    { x: 172, y: 88 },
    { x: 172, y: 124 },
  ];
  return (
    <>
      {/* Elbow connectors, the convention every tree diagram uses. */}
      <path className="dp-fa-line" style={{ ["--i" as string]: 0 }} d="M30 75h34" {...S} />
            {/* ABSOLUTE V, NOT RELATIVE v. Written relative these overshot their own
          nodes: `v62` from y=75 lands at 137 while the node it is joining sits
          at 106, so the lower branch ran thirty units past the seat and ended
          in mid air. Absolute commands cannot drift from the coordinates the
          nodes are placed with, which is the only reason to prefer them. */}
      <path className="dp-fa-line" style={{ ["--i" as string]: 1 }} d="M64 75V44h36M64 75V106h36" {...S} />
      <path className="dp-fa-line" style={{ ["--i" as string]: 2 }} d="M100 44h36" {...S} />
      <path className="dp-fa-line" style={{ ["--i" as string]: 3 }} d="M136 44V26h36M136 44V62h36" {...S} />
      <path className="dp-fa-line" style={{ ["--i" as string]: 2 }} d="M100 106h36" {...S} />
      <path className="dp-fa-line" style={{ ["--i" as string]: 3 }} d="M136 106V88h36M136 106V124h36" {...S} />
      <Node x={root.x} y={root.y} on i={0} />
      {mid.map((m, i) => (
        <Node key={`m${i}`} x={m.x} y={m.y} i={2} />
      ))}
      {leaf.map((l, i) => (
        <Node key={`l${i}`} x={l.x} y={l.y} i={4} />
      ))}
    </>
  );
}

/* ---- Risk | Compliance: the boundary --------------------------------------
   Nested brackets closing around one seat. Brackets are control, and three
   depths of them is the difference between a rule and a regime. */
function Risk() {
  const pairs = [
    { i: 0, l: "M52 46h-10v58h10", r: "M148 46h10v58h-10" },
    { i: 1, l: "M38 30h-16v90h16", r: "M162 30h16v90h-16" },
    { i: 2, l: "M24 16h-16v118h16", r: "M176 16h16v118h-16" },
  ];
  return (
    <>
      {pairs.map((p) => (
        <g key={p.i} className="dp-fa-bracket" style={{ ["--i" as string]: 2 - p.i }}>
          <path d={p.l} {...S} strokeOpacity={0.72 - p.i * 0.2} />
          <path d={p.r} {...S} strokeOpacity={0.72 - p.i * 0.2} />
        </g>
      ))}
      {/* The scope the seat sits in, drawn faint so the brackets stay the
          subject rather than the box. */}
      <rect
        className="dp-fa-scope"
        x={64}
        y={58}
        width={72}
        height={34}
        rx={4}
        fill="currentColor"
        fillOpacity={0.09}
      />
      <Node x={100} y={75} on i={3} />
    </>
  );
}

/* ---- Marketing | Revenue: the ascent --------------------------------------
   A rising line that arrives at a seat, over the ground it gained. Steps
   rather than a curve: revenue moves in increments, and a smooth curve is the
   chart every deck draws when it has no numbers. */
function Revenue() {
  const STEP = "M18 124h32V98h32V72h32V44h32V22h34";
  return (
    <>
      {/* The area under the line. Closed back along the baseline so it is a
          region rather than a thick stroke. */}
      <path
        className="dp-fa-area"
        d={`${STEP}V134H18Z`}
        fill="currentColor"
        fillOpacity={0.12}
        stroke="none"
      />
      <path className="dp-fa-step" d={STEP} {...S} pathLength={100} />
      <path d="M18 134h164" {...S} strokeOpacity={0.4} />
      <Node x={180} y={22} on i={0} />
    </>
  );
}

const BY_KIND: Record<FunctionKind, () => React.ReactElement> = {
  finance: Finance,
  technology: Technology,
  risk: Risk,
  revenue: Revenue,
};

export default function FunctionArt({
  kind,
  className = "",
}: {
  kind: FunctionKind;
  className?: string;
}) {
  const Art = BY_KIND[kind];
  return (
    <svg
      viewBox="0 0 200 150"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`dp-fa dp-fa-${kind} ${className}`}
    >
      <Art />
    </svg>
  );
}
