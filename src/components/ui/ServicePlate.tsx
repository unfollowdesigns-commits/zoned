/**
 * The figure on a service card.
 *
 * WHY THIS EXISTS. The cards were a 940 by 420 box containing an index number,
 * two words, a 44 pixel icon chip in the corner and a pill. Four fifths of each
 * one was empty, so the stack read as five large rectangles with a word in
 * them, and the corner chip is the single most recognisable move in generated
 * software marketing. A card that large has to be worth stopping on, and
 * nothing in it was.
 *
 * FLAT GEOMETRY, NOT A LIT DIAGRAM. The rest of this site's figures are drawn
 * in perspective with glowing nodes on dark glass, which is the visual language
 * of telemetry: Linear, Vercel, a monitoring dashboard. That is the wrong
 * register for a partner-led search firm, and it is the register the whole
 * navigation had drifted into. These are frontal, flat and constructed: solid
 * squares, hairline rules, exact divisions, one accent, no bloom and no
 * gradient. Swiss rather than sci-fi.
 *
 * THE GRAMMAR IS STILL THE HOUSE GRAMMAR. See ui/Mark: rules are the structure
 * of an organisation and nodes are seats in it, and exactly one node is filled,
 * because that is the seat this firm is hired to fill. These are the same five
 * statements as the marks, drawn at plate size.
 *
 * THE MOTION HAS WEIGHT. Everything that arrives here falls: it accelerates in,
 * lands short, and settles, rather than easing politely to a stop. That is one
 * `cubic-bezier` for the fall and a squash-and-recover on the landing frame,
 * and it is most of the difference between a figure that feels like an object
 * and one that feels like an opacity transition. Held in CSS on `--i` so a card
 * of eight parts is eight delays and not eight animations.
 *
 * No JavaScript, no measurement, nothing to hydrate: a card in a sticky stack
 * has to be right on its first painted frame.
 */

const VB = { w: 200, h: 160 };

/** Everything is drawn on this one stroke and this one radius. */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "square" as const,
} as const;

/** A seat. `on` is the one being filled, and there is only ever one. */
function Node({
  x,
  y,
  i,
  on = false,
  size = 15,
}: {
  x: number;
  y: number;
  i: number;
  on?: boolean;
  size?: number;
}) {
  return (
    <rect
      className={on ? "dp-pl-node is-on" : "dp-pl-node"}
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2.4}
      style={{ ["--i" as string]: i }}
    />
  );
}

/** A rule. Drawn as a line so it can be scaled from either end. */
function Rule({
  x1,
  y1,
  x2,
  y2,
  i,
  from = "center",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  i: number;
  /** Which end the rule grows out of. */
  from?: "center" | "start";
}) {
  return (
    <line
      className={`dp-pl-rule is-${from}${x1 === x2 ? " is-v" : ""}`}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      {...S}
      style={{ ["--i" as string]: i }}
    />
  );
}

/* ---- The five ------------------------------------------------------------- */

/** Executive Search. A structure that narrows, and the seat at the top of it.
    The verticals are load bearing: three horizontal rules on their own are
    three dashes, and it is the stems between them that make the set read as one
    structure with a top. */
function ExecutiveSearch() {
  return (
    <>
      <Rule x1={20} y1={132} x2={180} y2={132} i={0} />
      <Rule x1={45} y1={98} x2={155} y2={98} i={1} />
      <Rule x1={72} y1={64} x2={128} y2={64} i={2} />
      <Rule x1={100} y1={132} x2={100} y2={98} i={1} from="start" />
      <Rule x1={100} y1={98} x2={100} y2={64} i={2} from="start" />
      <Rule x1={100} y1={64} x2={100} y2={40} i={3} from="start" />
      <Node x={45} y={132} i={1} />
      <Node x={155} y={132} i={1} />
      <Node x={72} y={98} i={2} />
      <Node x={128} y={98} i={2} />
      <Node x={100} y={30} i={4} on size={19} />
    </>
  );
}

/** Professional Search. A field of seats at one level, and one of them taken. */
function ProfessionalSearch() {
  const cols = [40, 70, 100, 130, 160];
  const rows = [46, 80, 114];
  return (
    <>
      {rows.map((y, r) => (
        <Rule key={y} x1={26} y1={y} x2={174} y2={y} i={r} from="start" />
      ))}
      {rows.map((y, r) =>
        cols.map((x, c) => (
          <Node key={`${x}-${y}`} x={x} y={y} i={4 + r * 5 + c} on={r === 1 && c === 2} />
        ))
      )}
    </>
  );
}

/** Interim Solutions. A gap in the structure, and a seat held over it rather
    than set into it. The only figure here where the filled node is not on the
    rule, because the only service here where the person is not permanent. */
function InterimSolutions() {
  return (
    <>
      <Rule x1={20} y1={124} x2={82} y2={124} i={0} from="start" />
      <Rule x1={118} y1={124} x2={180} y2={124} i={1} from="start" />
      <line
        className="dp-pl-hold"
        x1={100}
        y1={54}
        x2={100}
        y2={116}
        {...S}
        strokeDasharray="6 7"
      />
      <Node x={100} y={38} i={2} on size={19} />
      <Node x={44} y={124} i={3} />
      <Node x={156} y={124} i={4} />
    </>
  );
}

/** Fractional. One seat, divided, and one part of it committed here. */
function Fractional() {
  return (
    <>
      <rect
        className="dp-pl-frame"
        x={62}
        y={38}
        width={76}
        height={76}
        {...S}
        style={{ ["--i" as string]: 0 }}
      />
      <rect className="dp-pl-quarter" x={62} y={38} width={38} height={38} fill="currentColor" />
      <Rule x1={100} y1={38} x2={100} y2={114} i={1} />
      <Rule x1={62} y1={76} x2={138} y2={76} i={2} />
      <Rule x1={20} y1={140} x2={180} y2={140} i={3} />
    </>
  );
}

/** Project Support. A boundary, and a team inside it working to one line. */
function ProjectSupport() {
  return (
    <>
      <rect
        className="dp-pl-frame"
        x={26}
        y={30}
        width={148}
        height={100}
        {...S}
        style={{ ["--i" as string]: 0 }}
      />
      <Rule x1={54} y1={80} x2={146} y2={80} i={1} />
      <Node x={62} y={56} i={2} />
      <Node x={100} y={56} i={3} on />
      <Node x={138} y={56} i={4} />
      <Node x={62} y={104} i={5} />
      <Node x={100} y={104} i={6} />
      <Node x={138} y={104} i={7} />
    </>
  );
}

/** Keyed by the same `icon` strings lib/site.ts already carries. */
const PLATES: Record<string, () => React.ReactElement> = {
  search: ExecutiveSearch,
  briefcase: ProfessionalSearch,
  timer: InterimSolutions,
  brackets: Fractional,
  presentation: ProjectSupport,
};

export default function ServicePlate({ name, className = "" }: { name?: string; className?: string }) {
  const Figure = name ? PLATES[name] : undefined;
  if (!Figure) return null;
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={`dp-pl ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <Figure />
    </svg>
  );
}
