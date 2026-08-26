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
const ROW = { top: 14, mid: 50, base: 86 };
const BUS = { upper: 32, lower: 68 };
const MID_X = [26, 50, 74];
const BASE_X = [12, 31, 50, 69, 88];

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

function V({ x, y, h, d }: { x: number; y: number; h: number; d: number }) {
  return (
    <span
      className="dp-mv-stem is-v"
      style={{ left: `${x}%`, top: `${y}%`, height: `${h}%`, ["--d" as string]: `${d}s` }}
    />
  );
}

function H({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <span
      className="dp-mv-stem is-h"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, ["--d" as string]: `${d}s` }}
    />
  );
}

function Services() {
  return (
    <Frame kind="services">
      {/* One standing plane, tilted. Everything below lives IN it, so the whole
          chart foreshortens together and the connectors carry the depth. */}
      <div className="dp-mv-org">
        {/* Top seat down to the upper bus, the bus, and down to each of three. */}
        <V x={50} y={ROW.top} h={BUS.upper - ROW.top} d={CHARGE.stemTop} />
        <H x={MID_X[0]} y={BUS.upper} w={MID_X[2] - MID_X[0]} d={CHARGE.busUpper} />
        {MID_X.map((x) => (
          <V key={`a${x}`} x={x} y={BUS.upper} h={ROW.mid - BUS.upper} d={CHARGE.stemMid} />
        ))}

        {/* The middle tier down to the lower bus, and out to five. */}
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

        {/* The gap. It stays drawn under the seat for the whole loop, so the
            picture never loses the evidence of what was filled. */}
        <span className="dp-mv-vacancy" style={{ left: "50%", top: `${ROW.top}%` }} />
        <span
          className="dp-mv-arriving"
          style={{ left: "50%", top: `${ROW.top}%`, ["--d" as string]: `${CHARGE.seat}s` }}
        />
      </div>
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

function Markets() {
  return (
    <Frame kind="markets">
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
            a list. */}
        <span
          className="dp-mv-listline"
          style={{ left: `${LIST_X}%`, top: `${LIST_Y(0)}%`, height: `${LIST_Y(3) - LIST_Y(0)}%` }}
        />
      </div>
    </Frame>
  );
}

/* ---- resources: the record ----------------------------------------------- */
function Resources() {
  return (
    <Frame kind="resources">
      {[0, 1, 2].map((i) => (
        /* Evenly spread across the 15s leaf cycle. Negative, so the stack is
           already mid-cycle on the first frame and never starts empty. Tied to
           the cycle length: at the old -3s against a 15s loop the three sheets
           bunched into the first fifth of it and the stack read as two. */
        <div key={i} className="dp-mv-sheet" style={{ ["--d" as string]: `${i * -5}s` }}>
          <span style={{ width: "72%" }} />
          <span style={{ width: "84%" }} />
          <span style={{ width: "48%" }} />
          <span style={{ width: "66%" }} />
        </div>
      ))}
    </Frame>
  );
}

/* ---- about: coverage building ---------------------------------------------
   The seats used to blink as the signal reached them, which is the single most
   generic thing a diagram can do: a blink has no memory, so after five of them
   the picture is exactly where it started and the loop has said nothing. Each
   seat now STAYS lit once it is reached, the ring completes, and only then does
   the whole thing reset. Same elements, and now there is a story in it. */
function About() {
  const spokes = [0, 72, 144, 216, 288];
  return (
    <Frame kind="about">
      <div className="dp-mv-disc">
        {spokes.map((deg, i) => (
          <span
            key={deg}
            className="dp-mv-spoke"
            style={{
              ["--rot" as string]: `${deg}deg`,
              /* Tight enough that all five overlap for a beat at the end of the
                 loop. A delay shifts the whole cycle, so a wide stagger means
                 the first seat is already draining before the last one lights
                 and the ring is never once complete. */
              ["--d" as string]: `${i * 0.35}s`,
            }}
          >
            {/* The signal, travelling out along the spoke. */}
            <i />
            {/* The seat at the far end of it. */}
            <b />
          </span>
        ))}
        <span className="dp-mv-core" />
      </div>
    </Frame>
  );
}

const BY_KIND: Record<Kind, () => React.ReactElement> = {
  services: Services,
  markets: Markets,
  resources: Resources,
  about: About,
};

export default function MenuVisual({ kind }: { kind: Kind }) {
  const Art = BY_KIND[kind];
  return <Art />;
}
