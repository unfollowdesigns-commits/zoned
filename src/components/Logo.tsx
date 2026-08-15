/**
 * District Partners logo.
 *
 * Redrawn as vector from the supplied artwork, at the proportions of the
 * original rather than an approximation of them.
 *
 * The monogram is three pieces, not two:
 *
 *   1. A blue bracket at the left, open to the right.
 *   2. A blue square ring.
 *   3. An identical square ring in ink, offset straight down by 76 units and
 *      painted over the blue one.
 *
 * The interlock is a consequence of that offset, not of a weave. The two rings
 * share their left and right stems, so those columns read blue at the top and
 * ink below, while the middle of each horizontal bar stays its own colour. Draw
 * order is what produces it: ink last.
 *
 * The two tones the brand supplies, ink-on-light and white-on-dark, are one
 * drawing here. Everything that is not brand blue is `currentColor`, so the
 * lockup inverts by inheriting `--v-ink`, which the `.v-light` band already
 * redefines. There is no second asset to keep in sync.
 */

/** The blue is the brand's, fixed. It does not follow the UI accent token. */
const BLUE = "#3e85de";

/* Monogram geometry, in the lockup's own units. */
const RING_W = 184; // outer edge of a ring, both axes
const STROKE = 33;
const DROP = 76; // how far the ink ring sits below the blue one

/** One square ring as an even-odd path: outer rectangle minus inner rectangle. */
function ring(x: number, y: number) {
  const i = STROKE;
  return (
    `M${x} ${y}h${RING_W}v${RING_W}h-${RING_W}Z` +
    `M${x + i} ${y + i}h${RING_W - i * 2}v${RING_W - i * 2}h-${RING_W - i * 2}Z`
  );
}

/**
 * The monogram alone, without the wordmark. Use it anywhere the lockup is too
 * wide to read: the mobile header, a favicon, the preloader.
 */
export function LogoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 260 260"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* The bracket, and the blue ring behind. */}
      <g fill={BLUE}>
        <path d="M0 0h48v33H33v118h15v33H0Z" />
        <path d={ring(76, 0)} fillRule="evenodd" />
      </g>
      {/* The ink ring, over the top. This is the whole interlock. */}
      <path d={ring(76, DROP)} fillRule="evenodd" fill="currentColor" />
    </svg>
  );
}

/**
 * The full lockup: monogram, dividing rule, and the two-line wordmark.
 *
 * The wordmark is live text rather than outlines, so it stays selectable and
 * crisp at any size. `textLength` forces both words to exactly the same
 * measure, which is what makes the block read as a justified stack the way the
 * original does. Without it the two lines drift apart as the font loads and
 * the lockup looks broken for a frame.
 */
export default function Logo({
  className,
  /** Height of the lockup. The width follows from the aspect ratio. */
  height = 34,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 1113 298"
      height={height}
      className={className}
      role="img"
      aria-label="District Partners"
      style={{ width: "auto", color: "var(--v-ink)" }}
    >
      <LogoMarkInner />
      {/* The rule runs past the monogram top and bottom, as in the original. */}
      <rect x="328" y="0" width="15" height="298" fill="currentColor" />
      {/* textLength is not inheritable, so it goes on each <text>. Both lines
          are forced to the same measure, which is what makes the block read as
          a justified stack the way the original does. */}
      <g fill="currentColor" fontFamily="var(--font-display)" fontWeight={500}>
        <text x="413" y="158" fontSize="146" textLength={700} lengthAdjust="spacing">
          DISTRICT
        </text>
        <text x="413" y="248" fontSize="104" textLength={700} lengthAdjust="spacing">
          PARTNERS
        </text>
      </g>
    </svg>
  );
}

/** The monogram's shapes without their own <svg>, for nesting in the lockup. */
function LogoMarkInner() {
  return (
    <>
      <g fill={BLUE}>
        <path d="M0 0h48v33H33v118h15v33H0Z" />
        <path d={ring(76, 0)} fillRule="evenodd" />
      </g>
      <path d={ring(76, DROP)} fillRule="evenodd" fill="currentColor" />
    </>
  );
}
