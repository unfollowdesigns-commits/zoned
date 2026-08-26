/**
 * The picture in a nav panel. One per section, each one means something, and
 * each one is a real scene in depth rather than a drawing of one.
 *
 * THE GRAMMAR IS UNCHANGED. See ui/Mark.tsx: RULES are the structure of an
 * organisation, NODES are seats in it, and a filled node is the seat this firm
 * is hired to fill. The icon set and this art are one system.
 *
 * WHAT EACH ONE SAYS:
 *
 *   services   A structure receding into depth with one seat empty, and a seat
 *              flying in from behind and above to land in it.
 *   markets    A field of candidates laid out on a tilted plane, with a few
 *              lifting off it toward the viewer. The short list, literally
 *              rising out of the market.
 *   resources  Sheets stacked in real depth, the top one lifting away and the
 *              stack stepping forward behind it.
 *   about      A disc of seats around one centre, seen at an angle, with the
 *              signal travelling outward from the middle. Partner led.
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

/** A rule with seats on it, at a given depth. */
function Tier({
  z,
  top,
  width,
  seats,
  vacantAt,
  float,
  dur,
  delay = 0,
}: {
  z: number;
  top: number;
  width: number;
  seats: number;
  /**
   * Index of the empty seat. The arriving seat is rendered INSIDE this tier
   * rather than beside it, which is not a tidiness preference: it inherits the
   * tier's float and therefore cannot drift out of phase with the gap it is
   * supposed to land in. Measured before the change, the seat sat 7 to 10px
   * below the vacancy for the whole of the hold and the offset oscillated,
   * because the two were on the same 15s curve nine seconds apart. The one
   * moment the entire figure exists to show was the one moment it got wrong.
   */
  vacantAt?: number;
  /** Which float curve, and how slow. Different per tier so the structure
      breathes rather than moving as one rigid object. */
  float: "a" | "b" | "c";
  dur: number;
  delay?: number;
}) {
  return (
    <div
      className="dp-mv-tier"
      style={{
        ["--z" as string]: `${z}px`,
        ["--float" as string]: `dp-float-${float}`,
        ["--fd" as string]: `${dur}s`,
        ["--fdel" as string]: `${delay}s`,
        top: `${top}%`,
        width: `${width}%`,
      }}
    >
      <span className="dp-mv-rule" />
      {Array.from({ length: seats }, (_, i) => (
        <span
          key={i}
          className={i === vacantAt ? "dp-mv-node is-vacant" : "dp-mv-node"}
          style={{ left: `${((i + 0.5) / seats) * 100}%` }}
        />
      ))}
      {vacantAt !== undefined && (
        <span
          className="dp-mv-arriving"
          style={{ left: `${((vacantAt + 0.5) / seats) * 100}%` }}
        />
      )}
    </div>
  );
}

/* ---- services: the seat arrives ------------------------------------------ */
function Services() {
  return (
    <Frame kind="services">
      {/* Widest and nearest at the bottom, narrowest and furthest at the top:
          an organisation seen from below, which is the right angle for a
          picture about the seat at the top of one. */}
      <Tier z={0} top={68} width={84} seats={4} float="b" dur={21} />
      <Tier z={34} top={46} width={58} seats={3} float="c" dur={17} delay={-4} />
      {/* The seat that arrives lives inside this tier: see the note on Tier. */}
      <Tier z={68} top={24} width={30} seats={1} vacantAt={0} float="a" dur={15} delay={-9} />
    </Frame>
  );
}

/* ---- markets: the short list rises --------------------------------------- */
function Markets() {
  const cols = 8;
  const rows = 6;
  /* Fixed, never random: a figure that reshuffles on every render flickers
     through hydration and cannot be art directed. */
  const picked = new Set([11, 20, 26, 35, 42]);
  return (
    <Frame kind="markets">
      <div className="dp-mv-plane">
        {Array.from({ length: cols * rows }, (_, i) => (
          <span
            key={i}
            className={picked.has(i) ? "dp-mv-cell is-on" : "dp-mv-cell"}
            style={{
              left: `${((i % cols) + 0.5) * (100 / cols)}%`,
              top: `${(Math.floor(i / cols) + 0.5) * (100 / rows)}%`,
              ["--d" as string]: `${(i % 5) * 0.85}s`,
            }}
          />
        ))}
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

/* ---- about: partner led --------------------------------------------------- */
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
              ["--d" as string]: `${i * 0.5}s`,
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
