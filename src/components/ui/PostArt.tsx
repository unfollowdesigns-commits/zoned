/**
 * Generated artwork for a post card.
 *
 * WHY GENERATE IT RATHER THAN COMMISSION OR BUY IT. The reference this page is
 * measured against runs photography and custom graphics on every card, and the
 * honest options without them are a flat colour block, a stock photograph, or
 * this. A flat block makes an archive look unfinished. Stock is worse than
 * nothing: an executive search firm illustrated with photographs of models in a
 * boardroom is telling the reader it has nothing of its own to show, and every
 * visitor has seen those exact frames on a competitor's site.
 *
 * WHAT WAS WRONG WITH THE FIRST VERSION. Every card drew the same figure, a
 * family of concentric arcs, in the same blue. Seeded variation moved the
 * centre and the tilt, which is variation a viewer cannot see: six cards in a
 * grid all read as the same picture slightly rotated, and an archive of them
 * looked like a template rather than a set of articles.
 *
 * SO FORM AND COLOUR NOW COME FROM THE CATEGORY, AND ONLY THE DETAIL COMES FROM
 * THE SLUG. Six categories, six genuinely different constructions: contours,
 * halftone, chevrons, a graduated field, stripes, dashes. That is a difference
 * in KIND rather than in parameters, which is the only kind the eye registers
 * across a grid.
 *
 * Tying it to the category rather than the slug also makes the colour mean
 * something. A reader who scrolls the archive twice learns that violet is
 * market insight without ever being told, and a card is then doing a second
 * job. Seeded-by-slug colour would have looked identical and taught nothing.
 *
 * The palette is wider than the rest of the site on purpose. Elsewhere the blue
 * family is held to deliberately, because competing hues behind an argument
 * read as decoration; a taxonomy is the one place where distinct hues are the
 * content rather than an ornament on it.
 *
 * Still deterministic, still SVG: no image bytes, no layout shift, correct at
 * any density, identical on server and client. This is scaffolding with a clear
 * replacement path. When there is real photography, `PostArt` becomes an
 * `<Image>` and every card picks it up.
 */

/**
 * FNV-1a. A hash, not `Math.random`: the art has to be identical on the server
 * and on the client or React reports a hydration mismatch and the card flashes
 * as it is corrected.
 */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, and good enough for placing a few shapes. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Quantise, and this is a CORRECTNESS helper rather than a tidiness one.
 *
 * The hashing above exists so the art is identical on the server and on the
 * client. It is not sufficient on its own: `Math.sin` and `Math.pow` are
 * implementation-defined in ECMAScript, so Node and the browser can disagree
 * in the last bit, and React compares the SERIALISED attribute. Caught in the
 * console as a real mismatch on the blog archive:
 *
 *     server  r="1.7080819894592358"
 *     client  r={1.708081989459236}
 *
 * Three decimals is far beyond anything visible in a 100 x 56 viewBox and is
 * identical on both sides, so every computed number that reaches an attribute
 * goes through here.
 */
const q = (n: number) => Math.round(n * 1000) / 1000;

/**
 * How long the hover ripple takes to cross a figure, in wave positions.
 *
 * Every mark carries its index modulo this, so a motif of 130 dots and one of
 * 6 chevrons finish in the same short interval. Without it the delay is the
 * raw index and the graduated field would still be rippling three seconds
 * after the pointer left. The repeat also makes dense motifs ripple in bands
 * rather than in one front, which reads better on a grid of dots than a single
 * sweep would.
 */
const WAVE = 14;

type Draw = (r: () => number, c: string) => React.ReactNode;

/* Every motif is drawn in a 100 x 56 box, anchored so its weight sits low and
   right and runs off the edge. Bleeding matters: a figure that stops inside the
   frame reads as a sticker placed on the card, and one that leaves it reads as
   a window onto something larger. */

/** Contours. Nested open curves, like a section through a landform. */
const contours: Draw = (r, c) => {
  const n = 7;
  const lean = q(-14 + r() * 28);
  return (
    <g transform={`rotate(${lean} 78 52)`}>
      {Array.from({ length: n }, (_, i) => {
        const k = 12 + i * 9;
        return (
          <path
            key={i}
            className="dp-art-el"
            style={{ ["--i" as string]: i }}
            d={`M ${100 - k * 1.5} 60 C ${86 - k} ${44 - k * 0.3}, ${96 - k * 0.4} ${30 - k * 0.5}, ${112} ${28 - k * 0.8}`}
            fill="none"
            stroke={c}
            strokeOpacity={q(0.62 - i * 0.06)}
            strokeWidth={0.7}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** Halftone. A dot grid whose radius rides a wave, so the field has a crest. */
const halftone: Draw = (r, c) => {
  const phase = r() * Math.PI * 2;
  const dots = [];
  for (let col = 0; col < 16; col += 1) {
    for (let row = 0; row < 9; row += 1) {
      const x = q(34 + col * 4.6);
      const y = q(8 + row * 5.4);
      const wave = Math.sin(col * 0.45 + row * 0.28 + phase);
      const rad = q(0.45 + Math.max(0, wave) * 1.5);
      if (rad < 0.5) continue;
      dots.push(
        <circle
          key={`${col}-${row}`}
          className="dp-art-el"
          style={{ ["--i" as string]: (col + row) % WAVE }}
          cx={x}
          cy={y}
          r={rad}
          fill={c}
          fillOpacity={q(0.28 + rad * 0.3)}
        />,
      );
    }
  }
  return <g>{dots}</g>;
};

/** Chevrons. Nested angles, thick, pointing out of the corner. */
const chevrons: Draw = (r, c) => {
  const n = 6;
  const gap = q(5 + r() * 2);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const o = i * gap;
        return (
          <path
            key={i}
            className="dp-art-el"
            style={{ ["--i" as string]: i }}
            d={`M ${q(52 + o)} 60 L ${q(80 + o)} ${q(26 - o * 0.25)} L ${q(108 + o)} 60`}
            fill="none"
            stroke={c}
            strokeOpacity={q(0.7 - i * 0.08)}
            strokeWidth={2.1}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
};

/** A graduated field. Dots growing across the corner, from dust to mass. */
const field: Draw = (r, c) => {
  const jitter = r();
  const dots = [];
  for (let i = 0; i < 130; i += 1) {
    const t = i / 130;
    const x = q(40 + Math.pow(t, 0.6) * 78 + (((i * 7919 + jitter * 1000) % 11) - 5) * 0.9);
    const y = q(4 + ((i * 37) % 56) + (((i * 6151) % 7) - 3) * 0.5);
    const d = q(Math.min(1, Math.max(0, (x - 44) / 60)));
    const rad = q(0.35 + d * 1.7);
    dots.push(
      <circle
        key={i}
        className="dp-art-el"
        style={{ ["--i" as string]: i % WAVE }}
        cx={x}
        cy={y}
        r={rad}
        fill={c}
        fillOpacity={q(0.18 + d * 0.55)}
      />,
    );
  }
  return <g>{dots}</g>;
};

/** Stripes. Dense diagonals, cut off square, the densest of the six. */
const stripes: Draw = (r, c) => {
  const n = 22;
  const angle = q(28 + r() * 16);
  return (
    <g transform={`rotate(${angle} 82 40)`}>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="dp-art-el"
          style={{ ["--i" as string]: i % WAVE }}
          x={q(40 + i * 3.4)}
          y={-14}
          width={1.5}
          height={88}
          fill={c}
          fillOpacity={q(Math.max(0.06, 0.6 - i * 0.024))}
        />
      ))}
    </g>
  );
};

/** Dashes. Short segments at scattered angles: the loosest of the six. */
const dashes: Draw = (r, c) => {
  const segs = [];
  for (let i = 0; i < 54; i += 1) {
    const x = q(42 + ((i * 29) % 62) + (r() - 0.5) * 4);
    const y = q(4 + ((i * 17) % 50) + (r() - 0.5) * 4);
    const a = q(r() * 180);
    segs.push(
      <rect
        key={i}
        className="dp-art-el"
        style={{ ["--i" as string]: i % WAVE }}
        x={x}
        y={y}
        width={4.6}
        height={0.9}
        rx={0.45}
        fill={c}
        fillOpacity={q(0.25 + r() * 0.45)}
        transform={`rotate(${a} ${x} ${y})`}
      />,
    );
  }
  return <g>{segs}</g>;
};


/** Orbits. Concentric rings around an off-centre core, cut by the frame. */
const orbits: Draw = (r, c) => {
  const n = 6;
  const cx = 74 + r() * 10;
  const cy = 34 + r() * 8;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <ellipse
          key={i}
          className="dp-art-el"
          style={{ ["--i" as string]: i }}
          cx={q(cx)}
          cy={q(cy)}
          rx={q(7 + i * 9.5)}
          ry={q(5 + i * 6.4)}
          fill="none"
          stroke={c}
          strokeOpacity={q(0.6 - i * 0.07)}
          strokeWidth={0.7}
        />
      ))}
      <circle cx={q(cx)} cy={q(cy)} r={2.1} fill={c} fillOpacity={0.85} />
    </g>
  );
};

/** A perspective grid. Rules converging on a vanishing point, low and right. */
const perspective: Draw = (r, c) => {
  const vx = 88 + r() * 8;
  const vy = 16 + r() * 8;
  const lines = [];
  for (let i = 0; i < 12; i += 1) {
    const x = q(20 + i * 8);
    lines.push(
      <line
        key={`r${i}`}
        className="dp-art-el"
        style={{ ["--i" as string]: i % WAVE }}
        x1={x}
        y1={62}
        x2={q(vx)}
        y2={q(vy)}
        stroke={c}
        strokeOpacity={q(0.42 - i * 0.02)}
        strokeWidth={0.6}
      />,
    );
  }
  for (let i = 0; i < 7; i += 1) {
    const t = Math.pow(i / 7, 1.8);
    const y = q(62 - t * (62 - vy));
    lines.push(
      <line
        key={`h${i}`}
        className="dp-art-el"
        style={{ ["--i" as string]: (i + 3) % WAVE }}
        x1={q(20 + t * (vx - 20))}
        y1={y}
        x2={q(116 - t * (116 - vx))}
        y2={y}
        stroke={c}
        strokeOpacity={q(0.34 - i * 0.03)}
        strokeWidth={0.6}
      />,
    );
  }
  return <g>{lines}</g>;
};

/** A weave. Crosshatch at two angles, denser toward the corner. */
const weave: Draw = (r, c) => {
  const skew = q(6 + r() * 8);
  const rows = [];
  for (let i = 0; i < 16; i += 1) {
    rows.push(
      <line
        key={`a${i}`}
        className="dp-art-el"
        style={{ ["--i" as string]: i % WAVE }}
        x1={q(30 + i * 6)}
        y1={-6}
        x2={q(30 + i * 6 - skew * 3)}
        y2={64}
        stroke={c}
        strokeOpacity={q(0.1 + i * 0.028)}
        strokeWidth={0.8}
      />,
    );
  }
  for (let i = 0; i < 10; i += 1) {
    rows.push(
      <line
        key={`b${i}`}
        className="dp-art-el"
        style={{ ["--i" as string]: (i + 5) % WAVE }}
        x1={20}
        y1={q(2 + i * 6)}
        x2={124}
        y2={q(2 + i * 6 + skew)}
        stroke={c}
        strokeOpacity={q(0.1 + i * 0.03)}
        strokeWidth={0.8}
      />,
    );
  }
  return <g>{rows}</g>;
};

/** A lattice of seats, linked right and down. The house grammar, as texture. */
const lattice: Draw = (r, c) => {
  const jitter = r();
  const cols = 9;
  const rows = 5;
  const out = [];
  const px = (col: number) => q(38 + col * 10.5);
  const py = (row: number) => q(8 + row * 11);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const o = q(0.14 + ((col + row + jitter * 3) % 5) * 0.09);
      if (col < cols - 1) {
        out.push(
          <line
            key={`h${col}-${row}`}
            className="dp-art-el"
            style={{ ["--i" as string]: (col + row) % WAVE }}
            x1={px(col)}
            y1={py(row)}
            x2={px(col + 1)}
            y2={py(row)}
            stroke={c}
            strokeOpacity={o}
            strokeWidth={0.5}
          />,
        );
      }
      if (row < rows - 1) {
        out.push(
          <line
            key={`v${col}-${row}`}
            className="dp-art-el"
            style={{ ["--i" as string]: (col + row) % WAVE }}
            x1={px(col)}
            y1={py(row)}
            x2={px(col)}
            y2={py(row + 1)}
            stroke={c}
            strokeOpacity={o}
            strokeWidth={0.5}
          />,
        );
      }
      out.push(
        <rect
          key={`n${col}-${row}`}
          className="dp-art-el"
          style={{ ["--i" as string]: (col + row) % WAVE }}
          x={px(col) - 1}
          y={py(row) - 1}
          width={2}
          height={2}
          rx={0.4}
          fill={c}
          fillOpacity={q(o + 0.22)}
        />,
      );
    }
  }
  return <g>{out}</g>;
};

/** Terraces. Stacked steps receding, like a section through a structure. */
const terraces: Draw = (r, c) => {
  const lean = q(r() * 6);
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          className="dp-art-el"
          style={{ ["--i" as string]: i }}
          d={`M ${q(26 + i * 5)} 60 V ${q(48 - i * 5.2 + lean)} H ${q(122 - i * 3)}`}
          fill="none"
          stroke={c}
          strokeOpacity={q(0.62 - i * 0.06)}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

/**
 * Category to form and colour.
 *
 * Six real categories, six constructions, six hues. Mid saturation throughout
 * so they sit together as a set rather than competing: a taxonomy needs its
 * members to be distinguishable from each other and equal in weight.
 */
export const MOTIFS = {
  contours,
  halftone,
  chevrons,
  field,
  stripes,
  dashes,
  orbits,
  perspective,
  weave,
  lattice,
  terraces,
};
export type Motif = keyof typeof MOTIFS;

const BY_CATEGORY: Record<string, { motif: Motif; colour: string }> = {
  "Executive Search": { motif: "contours", colour: "#5b93ff" },
  "Interim & Fractional": { motif: "chevrons", colour: "#35b0d8" },
  "Market Insight": { motif: "halftone", colour: "#9b7bf0" },
  "Finance & Accounting": { motif: "field", colour: "#43b98e" },
  "Private Capital": { motif: "stripes", colour: "#d9a446" },
  "Firm News": { motif: "dashes", colour: "#e0748c" },
};

const FALLBACK = { motif: "contours" as Motif, colour: "#5b93ff" };

/**
 * The art, animated, for any card that wants it.
 *
 * IT IS STILL AT REST AND THE MARKS RIPPLE ON HOVER. The first attempt ran a
 * light band across every card forever, which was wrong twice: a grid of six
 * cards all quietly pulsing is ambient noise competing with the headlines
 * beside them, and it lit the figure without ever touching the marks, which
 * are the thing anyone actually looks at.
 *
 * Pointing at a card now sends one short pulse through its marks in index
 * order, so the pattern reads as being redrawn. Scoping it to hover is what
 * makes animating the marks affordable at all: a grid at rest costs nothing,
 * and only the card under the pointer is ever running. See the .dp-art-el
 * rules, and WAVE below for why a 130 dot motif and a 6 chevron one take the
 * same time to cross.
 *
 * Deterministic, server rendered, no JavaScript.
 */
export function CardArt({
  seed: seedInput,
  motif = "contours",
  colour = "#5b93ff",
  className = "",
}: {
  /** Any stable string. Fixes the detail within the motif and the drift phase. */
  seed: string;
  motif?: Motif;
  colour?: string;
  className?: string;
}) {
  const seed = hash(seedInput);
  const random = rng(seed);
  const draw = MOTIFS[motif] ?? contours;
  const gid = `pa-${seed.toString(36)}`;
  return (
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`dp-art absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a0e20" />
          <stop offset="100%" stopColor="#0e1430" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`}>
          <stop offset="0%" stopColor={colour} stopOpacity="0.30" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
        </radialGradient>
        {/* Fades the figure out toward the top left, so the category chip and
            anything laid over the card sit on quiet ground rather than across
            a line. */}
        <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${gid}-mask`}>
          <rect width="100" height="56" fill={`url(#${gid}-fade)`} />
        </mask>
      </defs>

      <rect width="100" height="56" fill={`url(#${gid}-bg)`} />
      <circle cx={78} cy={44} r={40} fill={`url(#${gid}-glow)`} />
      <g mask={`url(#${gid}-mask)`}>{draw(random, colour)}</g>
    </svg>
  );
}

export default function PostArt({
  slug,
  category,
  className = "",
}: {
  slug: string;
  /** Chooses the form and the colour. See BY_CATEGORY. */
  category?: string;
  className?: string;
}) {
  const { motif, colour } = (category && BY_CATEGORY[category]) || FALLBACK;
  return <CardArt seed={slug} motif={motif} colour={colour} className={className} />;
}
