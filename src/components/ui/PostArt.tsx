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
 * So each card draws its own figure, seeded by the slug. It is deterministic:
 * a post keeps the same art forever, across builds and machines, which matters
 * because a card that reshuffles on every render reads as decoration rather
 * than as identity. And it is SVG built from the palette tokens: no image
 * bytes, no layout shift, correct at any density, and it cannot go off-brand.
 *
 * This is scaffolding with a clear replacement path. When there is real
 * photography, `PostArt` becomes an `<Image>` and every card picks it up.
 */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

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

export default function PostArt({ slug, className = "" }: { slug: string; className?: string }) {
  const seed = hash(slug);
  const random = rng(seed);

  /* The whole figure is one family of arcs around a seeded focus, plus two soft
     glows. Restrained on purpose: the card's job is to carry a headline, and a
     busy ground makes the headline harder to read, which is the opposite of
     what the art is for. */
  /* THE RANGES ARE NARROW ON PURPOSE. Seeded placement across the full frame
     produced cards whose focus fell outside it: the arcs entered at one corner
     and the card read as an almost empty dark rectangle. Variety is worth
     having only while every draw is still a composition, so the focus stays in
     the middle half and the glow with it. */
  const cx = 30 + random() * 40;
  const cy = 22 + random() * 40;
  const tilt = -35 + random() * 70;
  const rings = 6 + Math.floor(random() * 3);
  const spread = 8 + random() * 5;

  const glowX = 25 + random() * 50;
  const glowY = 20 + random() * 45;

  const gid = `pa-${seed.toString(36)}`;

  return (
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1024" />
          <stop offset="100%" stopColor="#111a3d" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`}>
          <stop offset="0%" stopColor="#3e7bfa" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#3e7bfa" stopOpacity="0" />
        </radialGradient>
        {/* Fades the arcs out toward the foot of the card so the metadata and
            the headline sit on quiet ground rather than across a line. */}
        <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
        <mask id={`${gid}-mask`}>
          <rect width="100" height="56" fill={`url(#${gid}-fade)`} />
        </mask>
      </defs>

      <rect width="100" height="56" fill={`url(#${gid}-bg)`} />
      <circle cx={glowX} cy={glowY} r="34" fill={`url(#${gid}-glow)`} />

      <g mask={`url(#${gid}-mask)`} transform={`rotate(${tilt} ${cx} ${cy})`}>
        {Array.from({ length: rings }, (_, i) => {
          const r = (i + 1) * spread;
          /* Nearer rings read brighter, so the family has a front and a back
             instead of being a flat set of concentric outlines. */
          const opacity = clamp01(0.55 - i * 0.05);
          return (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={r}
              ry={r * (0.52 + random() * 0.2)}
              fill="none"
              stroke="#3e7bfa"
              strokeOpacity={opacity}
              strokeWidth={0.5}
            />
          );
        })}
      </g>
    </svg>
  );
}
