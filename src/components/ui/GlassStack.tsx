/**
 * A cluster of glass planes drifting in perspective.
 *
 * WHAT MAKES GLASS READ AS GLASS, since a translucent rectangle on its own does
 * not. Three things, and all three are edges rather than fills:
 *
 *   1. A bright hairline along the top-left of each plane and a dim one along
 *      the bottom-right. That is a lit edge catching a source above and to the
 *      left, and it is what makes a flat rectangle read as a solid slab with
 *      thickness rather than as a coloured area.
 *   2. A saturated line down ONE side only. Real glass splits light at its
 *      edge, so the reference shows a blue-cyan streak down the right of each
 *      plane. That single line does more than any amount of fill.
 *   3. A fill that is a gradient, never flat. A flat translucent fill reads as
 *      plastic film; a gradient reads as a surface being lit unevenly.
 *
 * THE DRIFT IS PER PLANE AND NEVER SYNCHRONISED. Five planes on one keyframe
 * move as a single rigid object, which throws away the whole point of having
 * five. Each gets its own duration, delay and direction, and the durations are
 * deliberately not multiples of each other so the cluster never visibly returns
 * to a pose it has held before.
 *
 * PURE CSS, NO IMAGE. This sits inside a nav panel that must open instantly, so
 * an asset that has to be fetched the first time someone hovers is the wrong
 * trade: the panel would open empty and fill in a moment later, which is worse
 * than having no picture. Transforms and gradients cost nothing and are ready
 * on the first frame.
 *
 * `backdrop-filter` is deliberately absent. The planes sit over a near-flat
 * dark panel, so there is nothing behind them worth blurring, and the property
 * is expensive enough that paying for it to do nothing visible is a bad deal.
 */

type Plane = {
  /** Percent of the container. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees. */
  rx: number;
  ry: number;
  z: number;
  /** Seconds. Prime-ish and unequal on purpose: see the note above. */
  dur: number;
  delay: number;
};

const PLANES: Plane[] = [
  { x: 8, y: 30, w: 30, h: 40, rx: 8, ry: -16, z: -40, dur: 13, delay: 0 },
  { x: 30, y: 8, w: 30, h: 40, rx: -6, ry: -10, z: 10, dur: 17, delay: -3.5 },
  { x: 52, y: 22, w: 30, h: 40, rx: 6, ry: 12, z: -20, dur: 11, delay: -6 },
  { x: 24, y: 44, w: 28, h: 38, rx: -9, ry: 6, z: 40, dur: 19, delay: -9 },
  { x: 48, y: 52, w: 30, h: 40, rx: 5, ry: 16, z: 0, dur: 15, delay: -1.5 },
];

export default function GlassStack({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`dp-glass-stack relative overflow-hidden rounded-[14px] bg-[#05070f] ${className}`}
    >
      {/* A single soft source behind the cluster, so the planes are lit by
          something rather than glowing on their own. */}
      <span className="dp-glass-lamp" />
      <div className="dp-glass-scene">
        {PLANES.map((p, i) => (
          <span
            key={i}
            className="dp-glass-plane"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              height: `${p.h}%`,
              ["--rx" as string]: `${p.rx}deg`,
              ["--ry" as string]: `${p.ry}deg`,
              ["--tz" as string]: `${p.z}px`,
              ["--dur" as string]: `${p.dur}s`,
              ["--delay" as string]: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
