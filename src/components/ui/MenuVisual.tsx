/**
 * The picture in a nav panel. One per section, each one means something, and
 * each one is a real scene in depth rather than a drawing of one.
 *
 * THE GRAMMAR IS UNCHANGED. See ui/Mark.tsx: RULES are the structure of an
 * organisation, NODES are seats in it, and a filled node is the seat this firm
 * is hired to fill. The icon set and this art are one system.
 *
 * EVERY SCENE HAS A CAUSE AND AN EFFECT, AND THAT IS THE WHOLE REVISION. The
 * previous version failed for one reason, and it failed in all four: a single
 * element moved and nothing else in the picture responded to it. A seat dropped
 * into a gap and the structure around it was unchanged; five cells rose off a
 * field and the field was unchanged. A viewer reads that as decoration, because
 * decoration is exactly what it is. Something that MEANS something has a before
 * and an after, and the after is visible in the rest of the figure.
 *
 * WHAT EACH ONE SAYS NOW:
 *
 *   services   An organisation drawn as a real chart, connected by elbows, dark
 *              and inert, with the seat at the top of it empty. A seat arrives
 *              and lands, and the charge runs down the stems: buses, then the
 *              tier below, then the tier below that. One hire, and the thing
 *              underneath it comes alive. That is the claim the business makes.
 *   markets    A field of candidates on a plane. A few lift off it AND travel
 *              into an ordered column at the side, so a scatter visibly becomes
 *              a shortlist. Rising alone said "some of these are highlighted";
 *              rising and ranking says what the work actually produces.
 *   resources  Sheets stacked in real depth, the top one lifting away and the
 *              stack stepping forward behind it.
 *   about      Coverage building. The signal leaves the centre, and each seat it
 *              reaches STAYS lit rather than blinking, so the ring completes
 *              over the loop instead of twinkling forever. Partner led, and led
 *              somewhere.
 *
 * THE STRUCTURE IS ONE OBJECT, NOT SEVERAL. The tiers used to be three
 * separately floating rules at three depths. Nothing joined them, so nothing
 * read as a hierarchy, and the depth was invisible because there was no
 * connector crossing it to be foreshortened. They are now one standing plane,
 * tilted in space, with elbow connectors drawn in it. A structure that holds
 * together when it moves is the minimum for reading as a structure at all.
 *
 * WHY CSS 3D AND NOT SVG, WHICH IS WHAT THIS WAS. An SVG is one flat plane. It
 * can be drawn to LOOK like perspective, but nothing in it actually has a Z, so
 * nothing parallaxes and the illusion dies the moment anything moves. Here each
 * element has a real translateZ inside a shared `perspective`, so the slow scene
 * orbit below moves near things further than far things without a single value
 * being animated per element. That is what depth costs: one rotation on a
 * parent.
 *
 * THE SCENE IS ALWAYS MOVING, AND THAT IS THE "SMOOTHER" PART. Previously one
 * element animated against a dead background, so the picture was static
 * punctuated by an event. A continuous, very slow orbit underneath means the
 * figure is alive at every moment and the event reads as something happening
 * IN a place rather than as the only thing that exists.
 *
 * Still no image and no JavaScript. A nav panel has to open on the first frame.
 */

import * as React from "react";

type Kind = "services" | "markets" | "resources" | "about";

function Frame({
  kind,
  className = "",
  children,
}: {
  kind: Kind;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      /* `self-start` and a fixed ratio, both load bearing. A grid item stretches
         to its row by default, and the About panel's row is 775px tall because
         of the blog list beside it: the frame became a tall black column with
         the art squashed into a sliver. A picture has one correct shape. */
      className={`dp-mv-frame dp-mv-${kind} relative aspect-[4/3] w-full self-start overflow-hidden rounded-[14px] ${className}`}
    >
      <span className="dp-mv-lamp" />
      <div className="dp-mv-scene">{children}</div>
    </div>
  );
}

/* ---- services: one seat, and the organisation under it -------------------- */

/*
 * The chart, in the plane's own 0 to 100 coordinates. Three rows joined by
 * ordinary elbow connectors, which is how every org chart anyone has ever read
 * is drawn: a stem down from the parent, a horizontal bus, a stem down to each
 * child. Drawing the real convention is what buys instant legibility here. The
 * previous figure invented its own and got nothing for it.
 */
const ROW = { top: 10, mid: 48, base: 88 };
const BUS = { upper: 29, lower: 68 };
const MID_X = [18, 50, 82];
const BASE_X = [6, 28, 50, 72, 94];

/**
 * When each part lights, in seconds into the 12s loop.
 *
 * These are `animation-delay` values, not keyframe offsets, which is the only
 * way to give one shared keyframe a per-element phase. A positive delay shifts
 * the whole cycle, so an element with 3.6s is permanently 3.6s behind the loop
 * rather than merely starting late. The seat lands at 2.4s and the charge
 * follows it down: nothing lights before the seat is in it, which is the point
 * of the picture.
 */
const CHARGE = {
  seat: 2.4,
  stemTop: 2.55,
  busUpper: 2.75,
  stemMid: 2.95,
  nodeMid: 3.2,
  stemLower: 3.5,
  busLower: 3.7,
  stemBase: 3.95,
  nodeBase: 4.2,
};

/**
 * When a stem's travelling pulse starts, derived from when it lights.
 *
 * TWO CLOCKS, ON PURPOSE. The cascade is the twelve second story: a seat lands
 * and the charge runs down the structure once. The pulses are a four second
 * loop underneath it, so the wires carry signal at every moment rather than the
 * picture being one event followed by nine seconds of holding still. The delay
 * is the stem's own cascade offset scaled down, which means the flow runs in
 * the same order the charge does and the two never look like they disagree.
 *
 * Fixed to two decimals because this number reaches a style attribute, and a
 * float that serialises differently on the server and in the browser is a
 * hydration mismatch.
 */
const pulseDelay = (d: number) => `${((d - CHARGE.seat) * 0.62).toFixed(2)}s`;

function V({ x, y, h, d }: { x: number; y: number; h: number; d: number }) {
  return (
    <span
      className="dp-mv-stem is-v"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        height: `${h}%`,
        ["--d" as string]: `${d}s`,
        ["--pd" as string]: pulseDelay(d),
      }}
    />
  );
}

function H({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <span
      className="dp-mv-stem is-h"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        ["--d" as string]: `${d}s`,
        ["--pd" as string]: pulseDelay(d),
      }}
    />
  );
}

/* ---- The five services, five scenes ----------------------------------------
   FIVE SCENES, NOT ONE SCENE WITH THE SEAT MOVED. The first attempt at making
   the panel answer the pointer played the same org chart for every row and only
   changed where the arriving seat landed. That is one animation with a
   parameter, and it reads as one animation, because it is. Each service does a
   materially different thing to a client, so each one gets a figure that does a
   materially different thing.

   They are still one family. Every scene is built from the same two parts the
   whole site is built from, rules for the structure of an organisation and
   nodes for seats in it, and every one runs inside the same tilted plane under
   the same slow orbit. What differs is the VERB. */

/** The tilted plane the structural scenes live in. Its inset and its float are
    what make every one of them sit in the same space at the same size. */
function Org({ children }: { children: React.ReactNode }) {
  return <div className="dp-mv-org">{children}</div>;
}

/** Executive Search: a seat arrives at the top and the structure under it
    comes alive. One hire, and the thing underneath it lights. */
function ExecScene() {
  return (
    <Org>
        <V x={50} y={ROW.top} h={BUS.upper - ROW.top} d={CHARGE.stemTop} />
        <H x={MID_X[0]} y={BUS.upper} w={MID_X[2] - MID_X[0]} d={CHARGE.busUpper} />
        {MID_X.map((x) => (
          <V key={`a${x}`} x={x} y={BUS.upper} h={ROW.mid - BUS.upper} d={CHARGE.stemMid} />
        ))}
        {MID_X.map((x) => (
          <V key={`b${x}`} x={x} y={ROW.mid} h={BUS.lower - ROW.mid} d={CHARGE.stemLower} />
        ))}
        <H x={BASE_X[0]} y={BUS.lower} w={BASE_X[4] - BASE_X[0]} d={CHARGE.busLower} />
        {BASE_X.map((x) => (
          <V key={`c${x}`} x={x} y={BUS.lower} h={ROW.base - BUS.lower} d={CHARGE.stemBase} />
        ))}
        {MID_X.map((x, i) => (
          <span
            key={`m${x}`}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: `${ROW.mid}%`, ["--d" as string]: `${CHARGE.nodeMid + i * 0.08}s` }}
          />
        ))}
        {BASE_X.map((x, i) => (
          <span
            key={`n${x}`}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: `${ROW.base}%`, ["--d" as string]: `${CHARGE.nodeBase + i * 0.07}s` }}
          />
        ))}
        <span className="dp-mv-vacancy" style={{ left: "50%", top: `${ROW.top}%` }} />
        <span
          className="dp-mv-arriving"
          style={{ left: "50%", top: `${ROW.top}%`, ["--d" as string]: `${CHARGE.seat}s` }}
        />
    </Org>
  );
}

/* Professional Search. A wide tier with one empty chair in it, and a holding
   row of six above. The six are considered and go dark one at a time until one
   is left, and that one takes the chair. Manager through director hiring is a
   volume of candidates narrowed to a choice, which is a different picture from
   a single appointment at the top of a company. */
const TIER_X = [6, 23, 40, 57, 74, 91];
const GAP = 40;

function TierScene() {
  return (
    <Org>
        <H x={TIER_X[0]} y={74} w={TIER_X[5] - TIER_X[0]} d={2.6} />
        {TIER_X.filter((x) => x !== GAP).map((x, i) => (
          <span
            key={x}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: "74%", ["--d" as string]: `${2.8 + i * 0.1}s` }}
          />
        ))}
        <span className="dp-mv-vacancy" style={{ left: `${GAP}%`, top: "74%" }} />

        {/* The field under consideration. Five are ruled out on a stagger. */}
        {TIER_X.filter((x) => x !== GAP).map((x, i) => (
          <span
            key={`c${x}`}
            className="dp-ts-cand"
            style={{ left: `${x}%`, top: "16%", ["--i" as string]: i }}
          />
        ))}
        {/* The one that is not. It sits above the chair it will take, so the
            journey is a straight drop and reads as a placement rather than as a
            shape sliding across a diagram. */}
        <span className="dp-ts-pick" style={{ left: `${GAP}%` }} />
    </Org>
  );
}

/* Interim Solutions. A structure with a gap in it, a dashed arc holding the
   space, and a seat that arrives fast, holds, and then LEAVES, at which point a
   solid seat slides in underneath it and stays. Leadership in the seat while
   you hire, which is the one service here whose subject is temporary, so it is
   the one scene where something departs. */
function CoverScene() {
  return (
    <Org>
        <H x={8} y={76} w={84} d={2.4} />
        {[14, 50, 86].map((x, i) => (
          <V key={x} x={x} y={48} h={28} d={2.6 + i * 0.12} />
        ))}
        {[14, 86].map((x, i) => (
          <span
            key={x}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: "48%", ["--d" as string]: `${2.9 + i * 0.12}s` }}
          />
        ))}
        <span className="dp-cs-arc" />
        <span className="dp-mv-vacancy" style={{ left: "50%", top: "48%" }} />
        {/* Arrives at 2.4s, holds, lifts away at 7.2s. */}
        <span className="dp-cs-interim" style={{ left: "50%", top: "48%" }} />
        {/* Comes in along the rule once the cover has gone, and stays. */}
        <span className="dp-cs-perm" style={{ top: "48%" }} />
    </Org>
  );
}

/* Fractional. Three separate structures, and one seat that is in all of them.
   It travels between the three and each lights only while it is there, which is
   the actual proposition: senior expertise, part time and ongoing, not a
   fraction of a person but a person across several places. */
const CELLS = [14, 50, 86];

function SplitScene() {
  return (
    <Org>
        {CELLS.map((x, i) => (
          <span key={`g${x}`} className="dp-ss-cell" style={{ left: `${x}%`, ["--i" as string]: i }}>
            <span className="dp-ss-rule" />
            <span className="dp-ss-seat" />
          </span>
        ))}
        {/* The one person. Its whole journey is the point, so it is one element
            moving continuously rather than three that blink in turn. */}
        <span className="dp-ss-who" />
    </Org>
  );
}

/* Project Support and Expertise. A boundary draws itself around nothing, a team
   arrives inside it together rather than one at a time, they work, and then the
   boundary releases them. Scoped teams for defined programmes: the subject is
   the SCOPE, so the scope is the thing that opens and closes. */
const TEAM = [
  { x: 26, y: 34 },
  { x: 74, y: 34 },
  { x: 26, y: 72 },
  { x: 74, y: 72 },
];

function ScopeScene() {
  return (
    <Org>
        <span className="dp-sc-bound" />
        <H x={26} y={53} w={48} d={3.4} />
        <V x={50} y={34} h={38} d={3.5} />
        {TEAM.map((t, i) => (
          <span
            key={`${t.x}-${t.y}`}
            className="dp-sco-seat"
            style={{ left: `${t.x}%`, top: `${t.y}%`, ["--i" as string]: i }}
          />
        ))}
    </Org>
  );
}

/* ---- Who We Serve: the four practices --------------------------------------
   Four verbs taken straight from the four marks in ui/Mark, because those marks
   are already the firm's own statement of how the practices differ: a ledger, a
   branch, a boundary and an ascent. */

/** Finance and Accounting. Columns measured onto a baseline, one at a time, and
    the one that matters crowned. Nothing in this practice happens before the
    numbers are counted, so the counting IS the animation. */
const LEDGER = [22, 52, 40, 74, 34, 60];

function LedgerScene() {
  return (
    <Org>
        <H x={6} y={86} w={88} d={2.2} />
        {LEDGER.map((h, i) => (
          <span
            key={i}
            className="dp-fx-col"
            style={{ left: `${12 + i * 15.2}%`, ["--h" as string]: `${h}%`, ["--i" as string]: i }}
          />
        ))}
        <span className="dp-fx-crown" style={{ left: `${12 + 3 * 15.2}%`, top: `${86 - 74}%` }} />
    </Org>
  );
}

/** Technology, Digital and AI. One seat divides into two and then into four:
    the practice whose whole subject is a thing that scales by dividing. */
function BranchScene() {
  return (
    <Org>
        <V x={50} y={10} h={18} d={2.4} />
        <H x={26} y={28} w={48} d={2.7} />
        {[26, 74].map((x, i) => (
          <V key={x} x={x} y={28} h={20} d={2.9 + i * 0.06} />
        ))}
        {[26, 74].map((x) => (
          <H key={`h${x}`} x={x - 14} y={62} w={28} d={3.4} />
        ))}
        {[26, 74].map((x, i) => (
          <V key={`s${x}`} x={x} y={48} h={14} d={3.2 + i * 0.06} />
        ))}
        {[12, 40, 60, 88].map((x, i) => (
          <V key={`t${x}`} x={x} y={62} h={20} d={3.7 + i * 0.05} />
        ))}
        {[26, 74].map((x, i) => (
          <span
            key={`n${x}`}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: "48%", ["--d" as string]: `${3.1 + i * 0.08}s` }}
          />
        ))}
        {[12, 40, 60, 88].map((x, i) => (
          <span
            key={`b${x}`}
            className="dp-mv-node"
            style={{ left: `${x}%`, top: "82%", ["--d" as string]: `${4 + i * 0.07}s` }}
          />
        ))}
        <span
          className="dp-mv-arriving"
          style={{ left: "50%", top: "10%", ["--d" as string]: `${CHARGE.seat}s` }}
        />
    </Org>
  );
}

/** Risk and Compliance. Two brackets close in from the edges until the thing in
    the middle is inside them, and what is left outside goes dark. Control is not
    an ornament here: it is the practice. */
function BoundaryScene() {
  return (
    <Org>
        {[16, 38, 62, 84].map((x, i) => (
          <span
            key={x}
            className="dp-bx-out"
            style={{ left: `${x}%`, top: "50%", ["--i" as string]: i }}
          />
        ))}
        <span className="dp-bx-jaw is-l" />
        <span className="dp-bx-jaw is-r" />
        <span className="dp-bx-held" />
    </Org>
  );
}

/** Marketing and Revenue. A stepped climb, each tread lighting as it is reached,
    arriving at a seat at the top. The one practice measured by a line going up. */
const STEPS = [
  { x: 8, y: 84 },
  { x: 30, y: 68 },
  { x: 52, y: 50 },
  { x: 74, y: 30 },
];

function AscentScene() {
  return (
    <Org>
        {STEPS.map((st, i) => (
          <React.Fragment key={st.x}>
            <H x={st.x} y={st.y} w={18} d={2.4 + i * 0.42} />
            {i < STEPS.length - 1 && (
              <V x={st.x + 18} y={STEPS[i + 1].y} h={st.y - STEPS[i + 1].y} d={2.6 + i * 0.42} />
            )}
          </React.Fragment>
        ))}
        <span
          className="dp-mv-arriving"
          style={{ left: "92%", top: "30%", ["--d" as string]: "4.4s" }}
        />
        <span className="dp-mv-vacancy" style={{ left: "92%", top: "30%" }} />
    </Org>
  );
}

/* ---- The industries --------------------------------------------------------
   ONE FIELD, EIGHT REGIONS, AND THAT IS AN HONEST ANSWER RATHER THAN A LAZY
   ONE. Eight bespoke figures would be eight more arrangements of two parts, and
   past about nine those stop being distinguishable and the set stops being a
   set. The site's own position is that these are sectors of one talent market,
   so the picture is one market and the sector being pointed at is the part of
   it that lights and resolves. Each industry lights a different region, so the
   picture does change, and it changes in the way the argument says it should. */
const FIELD_COLS = 9;
const FIELD_ROWS = 5;

/**
 * The eight regions, written out rather than computed.
 *
 * A formula produced collisions: with nine columns and five rows there is no
 * arithmetic that lands eight distinct two-by-three clusters without two of
 * them coinciding, and two industries lighting the identical cells is the exact
 * failure this is here to avoid. Eight pairs is shorter than the arithmetic
 * that would have been wrong.
 */
const REGIONS: Array<{ c: number; r: number }> = [
  { c: 0, r: 0 },
  { c: 3, r: 0 },
  { c: 6, r: 0 },
  { c: 0, r: 2 },
  { c: 3, r: 3 },
  { c: 6, r: 2 },
  { c: 1, r: 1 },
  { c: 5, r: 3 },
];

function FieldScene({ region }: { region: number }) {
  const { c: col0, r: row0 } = REGIONS[region % REGIONS.length];
  const picked = new Set<number>();
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      picked.add((row0 + r) * FIELD_COLS + col0 + c);
    }
  }
  return (
    <div className="dp-fd">
      {Array.from({ length: FIELD_COLS * FIELD_ROWS }, (_, i) => (
        <span
          key={i}
          className={picked.has(i) ? "dp-fd-cell is-on" : "dp-fd-cell"}
          style={{ ["--i" as string]: i % FIELD_COLS }}
        />
      ))}
    </div>
  );
}

/* ---- Resources -------------------------------------------------------------
   These are documents and lists rather than organisations, so they are built
   from rules alone: a rule is a line of a thing, and a seat only appears where
   an actual seat is the subject. */

/** Rows that draw themselves in sequence. The shared part of four of these. */
function Rows({
  ys,
  widths,
  x = 14,
  base = 2.2,
  step = 0.34,
}: {
  ys: number[];
  widths: number[];
  x?: number;
  base?: number;
  step?: number;
}) {
  return (
    <>
      {ys.map((y, i) => (
        <span
          key={y}
          className="dp-rw"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${widths[i]}%`,
            ["--d" as string]: `${base + i * step}s`,
          }}
        />
      ))}
    </>
  );
}

/** Blog. Sheets in depth, the top one lifting away and the stack stepping up. */
function StackScene() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="dp-mv-sheet" style={{ ["--d" as string]: `${i * -5}s` }}>
          <span style={{ width: "72%" }} />
          <span style={{ width: "84%" }} />
          <span style={{ width: "48%" }} />
          <span style={{ width: "66%" }} />
        </div>
      ))}
    </>
  );
}

/** Case Studies. A record opens: the frame widens and the account fills in
    under it, which is what a case study is. */
function RecordScene() {
  return (
    <Org>
        <span className="dp-rc-frame" />
        <Rows ys={[30, 44, 58, 72]} widths={[64, 52, 70, 40]} x={18} base={2.6} step={0.4} />
        <span className="dp-mv-node is-set" style={{ left: "82%", top: "30%", ["--d" as string]: "2.4s" }} />
    </Org>
  );
}

/** Current Opportunities. Open seats appear on a board, one after another, and
    each one is an empty chair rather than a filled one. That is the whole
    difference between this page and every other page in the menu. */
const BOARD = [
  { x: 22, y: 26 },
  { x: 56, y: 26 },
  { x: 22, y: 54 },
  { x: 56, y: 54 },
  { x: 22, y: 82 },
  { x: 56, y: 82 },
];

function BoardScene() {
  return (
    <Org>
        {BOARD.map((b, i) => (
          <React.Fragment key={`${b.x}-${b.y}`}>
            <span
              className="dp-bd-slot"
              style={{ left: `${b.x}%`, top: `${b.y}%`, ["--i" as string]: i }}
            />
            <span
              className="dp-rw"
              style={{
                left: `${b.x + 8}%`,
                top: `${b.y}%`,
                width: "26%",
                ["--d" as string]: `${2.3 + i * 0.3}s`,
              }}
            />
          </React.Fragment>
        ))}
    </Org>
  );
}

/** Resume Builder. A page assembles line by line, and the last line is short
    the way a last line is. */
function DraftScene() {
  return (
    <Org>
        <span className="dp-rc-frame is-tall" />
        <Rows ys={[26, 38, 50, 62, 74]} widths={[38, 62, 56, 66, 30]} x={22} base={2.4} step={0.36} />
    </Org>
  );
}

/** Job Description Engine. Blocks snap into place and lock together, because
    what the tool does is compose a spec out of parts. */
const SPEC = [
  { x: 16, y: 22, w: 30 },
  { x: 54, y: 22, w: 30 },
  { x: 16, y: 46, w: 68 },
  { x: 16, y: 70, w: 44 },
];

function SpecScene() {
  return (
    <Org>
        {SPEC.map((b, i) => (
          <span
            key={`${b.x}-${b.y}`}
            className="dp-sp-block"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, ["--i" as string]: i }}
          />
        ))}
    </Org>
  );
}

/* ---- About ----------------------------------------------------------------- */

/** About Us. Coverage building out from the centre and staying built: each seat
    the signal reaches stays lit, so the ring completes over the loop instead of
    twinkling forever. */
function WebScene() {
  return (
    <div className="dp-mv-disc">
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <span
          key={deg}
          className="dp-mv-spoke"
          style={{ ["--rot" as string]: `${deg}deg`, ["--d" as string]: `${i * 0.35}s` }}
        >
          <i />
          <b />
        </span>
      ))}
      <span className="dp-mv-core" />
    </div>
  );
}

/** The DP Difference. A stack of capabilities coming up one at a time, which is
    literally what that page is: eight things this firm has that others do not. */
function StackBarsScene() {
  return (
    <Org>
      <Rows
        ys={[18, 34, 50, 66, 82]}
        widths={[74, 58, 82, 46, 66]}
        x={13}
        base={2.2}
        step={0.44}
      />
    </Org>
  );
}

/** Meet Our Team. A row of seats, every one of them filled, arriving together
    enough to read as a team and staggered enough not to read as one shape. */
const TEAM_X = [12, 31, 50, 69, 88];

function TeamScene() {
  return (
    <Org>
        <H x={12} y={62} w={76} d={2.2} />
        {TEAM_X.map((x, i) => (
          <React.Fragment key={x}>
            <V x={x} y={62} h={14} d={2.4 + i * 0.08} />
            <span
              className="dp-sco-seat"
              style={{ left: `${x}%`, top: "42%", ["--i" as string]: i }}
            />
          </React.Fragment>
        ))}
    </Org>
  );
}

/** Accolades. A ring closes around a seat and holds. An award is a thing that
    completes, so the figure completes. */
function AwardScene() {
  return (
    <Org>
        <span className="dp-aw-ring" />
        <span className="dp-aw-ring is-two" />
        <span
          className="dp-mv-arriving"
          style={{ left: "50%", top: "50%", ["--d" as string]: "2.6s" }}
        />
    </Org>
  );
}

/** Careers at DP. Every other scene in this menu fills a seat. This one opens
    one: a full structure, and a chair that empties and stays lit waiting. */
function OpeningScene() {
  return (
    <Org>
        <H x={12} y={40} w={76} d={2.2} />
        {TEAM_X.map((x, i) => (
          <V key={x} x={x} y={40} h={18} d={2.4 + i * 0.07} />
        ))}
        {TEAM_X.map((x, i) =>
          x === 50 ? null : (
            <span
              key={`s${x}`}
              className="dp-mv-node is-set"
              style={{ left: `${x}%`, top: "58%", ["--d" as string]: `${2.7 + i * 0.08}s` }}
            />
          )
        )}
        <span className="dp-op-gap" style={{ left: "50%", top: "58%" }} />
    </Org>
  );
}

/**
 * Every row in the navigation, keyed by href.
 *
 * By href and not by icon: icons repeat across the navigation and several rows
 * have none, so an icon could not address a row uniquely. See Header.MenuLink.
 */
const SCENE: Record<string, () => React.ReactElement> = {
  "/what-we-do/executive-search": ExecScene,
  "/what-we-do/professional-search": TierScene,
  "/what-we-do/interim-solutions": CoverScene,
  "/what-we-do/fractional": SplitScene,
  "/what-we-do/project-support": ScopeScene,

  "/who-we-serve/finance-accounting": LedgerScene,
  "/who-we-serve/technology-digital-ai": BranchScene,
  "/who-we-serve/risk-compliance": BoundaryScene,
  "/who-we-serve/marketing-revenue": AscentScene,

  "/resources/blog": StackScene,
  "/resources/case-studies": RecordScene,
  "/resources/current-opportunities": BoardScene,
  "/resources/resume-builder": DraftScene,
  "/resources/job-description-engine": SpecScene,

  "/about": WebScene,
  "/the-dp-difference": StackBarsScene,
  "/about/team": TeamScene,
  "/about/accolades": AwardScene,
  "/about/careers": OpeningScene,
};

/** The eight industries, each lighting its own region of the one market. */
const INDUSTRY_REGION: Record<string, number> = {
  "/who-we-serve/professional-business-services": 0,
  "/who-we-serve/private-capital": 1,
  "/who-we-serve/tech-ai-digital-platforms": 2,
  "/who-we-serve/govcon-public-sector": 3,
  "/who-we-serve/financial-services": 4,
  "/who-we-serve/wealth-management": 5,
  "/who-we-serve/real-estate-construction-manufacturing": 6,
  "/who-we-serve/healthcare": 7,
};

function Services({ focus }: { focus?: string }) {
  return <Panel kind="services" focus={focus} fallback={ExecScene} />;
}

/**
 * The one panel body.
 *
 * Keyed on the row, so changing rows swaps the scene AND restarts it from its
 * first frame. A cross-fade would show two figures at once; a remount plays one
 * story. The frame, its lamp and the slow orbit are outside the key and do not
 * restart, so the stage never jumps.
 */
function Panel({
  kind,
  focus,
  fallback: Fallback,
}: {
  kind: Kind;
  focus?: string;
  fallback: () => React.ReactElement;
}) {
  const region = focus ? INDUSTRY_REGION[focus] : undefined;
  const Scene = focus ? SCENE[focus] : undefined;
  return (
    <Frame kind={kind}>
      {/* Keyed on the row, so changing rows swaps the scene AND restarts it
          from its first frame. A cross-fade would show two figures at once; a
          remount plays one story. The frame, its lamp and the slow orbit are
          outside the key and do not restart, so the stage never jumps. Each
          scene brings its own plane, because they are not all the same plane:
          the structural ones stand in the tilted org space, the market lies
          back flat, and the sheets are a stack in depth. */}
      <React.Fragment key={focus ?? "-"}>
        {Scene ? <Scene /> : region !== undefined ? <FieldScene region={region} /> : <Fallback />}
      </React.Fragment>
    </Frame>
  );
}

/* ---- markets: a scatter becomes a shortlist -------------------------------- */

const COLS = 8;
const ROWS = 6;
/* Fixed, never random: a figure that reshuffles on every render flickers
   through hydration and cannot be art directed. Ordered by row, so the four
   travel to their places without crossing each other's paths. */
const PICKED = [10, 21, 27, 44];
/** Where the shortlist ends up, in the plane's own coordinates. */
const LIST_X = 88;
const LIST_Y = (rank: number) => 34 + rank * 20;

/** Who We Serve, by default: a scatter of candidates that becomes a shortlist. */
function MarketScene() {
  return (
    <div className="dp-mv-plane">
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const x = ((i % COLS) + 0.5) * (100 / COLS);
        const y = (Math.floor(i / COLS) + 0.5) * (100 / ROWS);
        const rank = PICKED.indexOf(i);

        if (rank === -1) {
          return (
            <span
              key={i}
              className="dp-mv-cell"
              style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${(i % 5) * 0.85}s` }}
            />
          );
        }

        /* The travel is on a WRAPPER that spans the whole plane, not on the
           dot. A percentage translate resolves against the element's own box,
           so a 6px dot can only move 6px worth; a wrapper the size of the
           plane can move a share of the plane, which is the only way to aim
           at a target expressed in the same units as the grid. */
        return (
          <span
            key={i}
            className="dp-mv-pick"
            style={{
              ["--dx" as string]: `${LIST_X - x}%`,
              ["--dy" as string]: `${LIST_Y(rank) - y}%`,
              ["--d" as string]: `${rank * 0.5}s`,
            }}
          >
            <i style={{ left: `${x}%`, top: `${y}%` }} />
          </span>
        );
      })}
      {/* The rule the shortlist lands against. Without something to line up
          ON, four bright dots in a row are four bright dots; with it they are
          a list. Overhung slightly past the first and last rank so the ends
          of the gradient fade clear of the dots rather than dying on them. */}
      <span
        className="dp-mv-listline"
        style={{
          left: `${LIST_X}%`,
          top: `${LIST_Y(0) - 7}%`,
          height: `${LIST_Y(3) - LIST_Y(0) + 14}%`,
        }}
      />
    </div>
  );
}

function Markets({ focus }: { focus?: string }) {
  return <Panel kind="markets" focus={focus} fallback={MarketScene} />;
}

function Resources({ focus }: { focus?: string }) {
  return <Panel kind="resources" focus={focus} fallback={StackScene} />;
}

function About({ focus }: { focus?: string }) {
  return <Panel kind="about" focus={focus} fallback={WebScene} />;
}

const BY_KIND: Record<Kind, (p: { focus?: string }) => React.ReactElement> = {
  services: Services,
  markets: Markets,
  resources: Resources,
  about: About,
};

/**
 * `focus` is the `icon` key of the row the pointer is on, or undefined.
 *
 * Only the services scene reads it as a position today, because that is the
 * panel whose five entries the house grammar genuinely distinguishes. Every
 * scene still REPLAYS on a change, though, because each is keyed on `focus`
 * below: moving between rows restarts the figure's own story, so hovering any
 * row in any panel produces something rather than nothing.
 */
export default function MenuVisual({ kind, focus }: { kind: Kind; focus?: string }) {
  const Art = BY_KIND[kind];
  return <Art focus={focus} />;
}
