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
        <circle key={`${col}-${row}`} cx={x} cy={y} r={rad} fill={c} fillOpacity={q(0.28 + rad * 0.3)} />,
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
    dots.push(<circle key={i} cx={x} cy={y} r={rad} fill={c} fillOpacity={q(0.18 + d * 0.55)} />);
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

/**
 * Category to form and colour.
 *
 * Six real categories, six constructions, six hues. Mid saturation throughout
 * so they sit together as a set rather than competing: a taxonomy needs its
 * members to be distinguishable from each other and equal in weight.
 */
export const MOTIFS = { contours, halftone, chevrons, field, stripes, dashes };
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
 * THE ANIMATION IS TWO ELEMENTS, NOT TWO HUNDRED. The obvious way to bring
 * these to life is to animate the marks themselves, and it is the wrong way:
 * the graduated field alone is 130 circles, so six cards in a grid would be
 * running eight hundred animations to make a background shimmer. It would also
 * break the brief, which is that the PATTERNS DO NOT CHANGE. A figure whose
 * parts move is a different figure.
 *
 * So the figure holds its shape and the LIGHT moves over it: one slow band
 * crossing beneath the marks, and one very slow drift on the group above it.
 * Two animated elements per card, both composited, and the design is untouched.
 * It is also the same idea the hero runs at full size, where a sweep crosses
 * the market and lights what it passes: one grammar, two scales.
 *
 * Deterministic, server rendered, no JavaScript. The phase is seeded so a grid
 * of cards is never in unison, which is what would make it read as a loop.
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
  /* Spread across the sweep's own cycle, so cards in a grid are lit in turn
     rather than together. Negative, so every card is already mid-cycle on its
     first frame and none of them starts dark. */
  const phase = q(-((seed % 900) / 100));

  return (
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`dp-art absolute inset-0 h-full w-full ${className}`}
      style={{ ["--phase" as string]: `${phase}s` }}
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
        {/* The travelling band. Soft at both edges so it has no leading line:
            a hard edge would read as a wipe rather than as light. */}
        <linearGradient id={`${gid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colour} stopOpacity="0" />
          <stop offset="50%" stopColor={colour} stopOpacity="0.34" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
        </linearGradient>
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
      {/* Beneath the marks: the pattern is lit BY it, rather than washed over. */}
      <rect className="dp-art-sweep" x={-34} y={0} width={34} height={56} fill={`url(#${gid}-sweep)`} />
      <g className="dp-art-body" mask={`url(#${gid}-mask)`}>
        {draw(random, colour)}
      </g>
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
