/**
 * The schematic band at the top of a feature tile.
 *
 * WHY A DIAGRAM AND NOT A CHART, AND THIS IS THE WHOLE CONSTRAINT. The
 * reference's cards lead with a picture of the mechanism: bars stepping up for
 * an accumulating token, dots multiplying for a rebasing one. Those illustrate
 * how a thing WORKS. They are not measurements, and they carry no axes, no
 * scale and no numbers, which is what keeps them honest.
 *
 * Everything here follows that rule, because the alternative is fabricating
 * evidence. A tile called "Smart Candidate Scoring" with a plausible bar chart
 * on it is a claim about results the firm has not made and cannot support, and
 * a visitor has no way to tell a decorative chart from a real one. So: single
 * colour, no gridlines, no ticks, no labels, nothing that could be read off.
 * These say "ranked", "mapped", "scanned". They do not say how well.
 *
 * Deterministic by design. Every shape below is written out or derived from the
 * index, never from Math.random, so a tile looks the same on the server, on the
 * client, and on the next deploy. A random diagram would also flicker on every
 * hydration, which is the usual way this kind of component announces itself.
 */

const A = "var(--v-ring)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 56"
      fill="none"
      aria-hidden="true"
      className="h-[56px] w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

/** Ranked bars, descending. "Ordered", not "measured": no scale, no ticks. */
function Ranked() {
  const h = [40, 34, 27, 21, 16, 12, 9, 7];
  return (
    <Frame>
      {h.map((v, i) => (
        <rect
          key={i}
          x={4 + i * 14.5}
          y={48 - v}
          width={9}
          height={v}
          rx={2.5}
          fill={A}
          opacity={0.85 - i * 0.075}
        />
      ))}
    </Frame>
  );
}

/** A field of nodes with one cluster found. */
function Mapped() {
  const pts: Array<[number, number, boolean]> = [
    [10, 14, false], [26, 34, false], [40, 12, false], [55, 40, false],
    [70, 20, true], [78, 30, true], [86, 16, true], [96, 26, true],
    [104, 42, false], [18, 44, false], [62, 8, false], [46, 28, false],
  ];
  return (
    <Frame>
      {pts.map(([x, y, hot], i) => (
        <circle key={i} cx={x} cy={y} r={hot ? 3.4 : 2.1} fill={A} opacity={hot ? 0.95 : 0.3} />
      ))}
      {/* The ring is the "found" gesture. It encloses, it does not quantify. */}
      <ellipse cx={82} cy={23} rx={22} ry={14} stroke={A} strokeWidth={1} opacity={0.45} />
    </Frame>
  );
}

/** A signal trace with a detected spike. */
function Motion() {
  return (
    <Frame>
      <path
        d="M2 38 L14 36 L22 39 L32 34 L42 37 L52 20 L58 44 L66 33 L76 36 L88 32 L98 37 L110 34 L118 36"
        stroke={A}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <circle cx={52} cy={20} r={3.6} fill={A} />
      <circle cx={52} cy={20} r={8} stroke={A} strokeWidth={1} opacity={0.4} />
    </Frame>
  );
}

/** A grid of states with a few live. */
function Grid() {
  const live = new Set([3, 7, 12, 18, 21, 26]);
  return (
    <Frame>
      {Array.from({ length: 32 }, (_, i) => {
        const c = i % 8;
        const r = Math.floor(i / 8);
        return (
          <rect
            key={i}
            x={5 + c * 14}
            y={7 + r * 12}
            width={10}
            height={8}
            rx={2}
            fill={A}
            opacity={live.has(i) ? 0.9 : 0.16}
          />
        );
      })}
    </Frame>
  );
}

/** Stacked planes with one drawn out of the stack. */
function Layers() {
  return (
    <Frame>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={18 + i * 4}
          y={34 - i * 9}
          width={62}
          height={9}
          rx={2.5}
          fill={A}
          opacity={0.22 + i * 0.06}
        />
      ))}
      <rect x={40} y={6} width={62} height={9} rx={2.5} fill={A} opacity={0.95} />
    </Frame>
  );
}

/** Concentric sweep with contacts on it. */
function Radar() {
  return (
    <Frame>
      {[10, 18, 26].map((r, i) => (
        <circle key={r} cx={60} cy={46} r={r} stroke={A} strokeWidth={1} opacity={0.4 - i * 0.09} />
      ))}
      <path d="M60 46 L86 30" stroke={A} strokeWidth={1.4} opacity={0.85} strokeLinecap="round" />
      <circle cx={74} cy={33} r={2.6} fill={A} opacity={0.9} />
      <circle cx={45} cy={31} r={2.2} fill={A} opacity={0.55} />
      <circle cx={68} cy={22} r={2.2} fill={A} opacity={0.45} />
    </Frame>
  );
}

/** A curve rising, with its area behind it. Shape only, no scale. */
function Curve() {
  return (
    <Frame>
      <path d="M2 46 C 26 44, 40 34, 56 28 C 74 21, 92 16, 118 10 L118 50 L2 50 Z" fill={A} opacity={0.16} />
      <path
        d="M2 46 C 26 44, 40 34, 56 28 C 74 21, 92 16, 118 10"
        stroke={A}
        strokeWidth={1.7}
        strokeLinecap="round"
        opacity={0.9}
      />
      <circle cx={118} cy={10} r={3.2} fill={A} />
    </Frame>
  );
}

/** Ripples travelling out from a source. */
function Pulse() {
  return (
    <Frame>
      {[6, 13, 20, 27].map((r, i) => (
        <circle key={r} cx={60} cy={28} r={r} stroke={A} strokeWidth={1.2} opacity={0.6 - i * 0.13} />
      ))}
      <circle cx={60} cy={28} r={3.2} fill={A} />
    </Frame>
  );
}

const ART: Record<string, () => React.ReactElement> = {
  scan: Motion,
  mapped: Mapped,
  chart: Ranked,
  monitor: Grid,
  layers: Layers,
  radar: Radar,
  care: Curve,
  radio: Pulse,
};

export default function TileArt({ name }: { name: string }) {
  const Art = ART[name];
  if (!Art) return null;
  return (
    <div className="mb-7 rounded-[13px] bg-[var(--v-primary)]/[0.07] px-4 py-4">
      <Art />
    </div>
  );
}
