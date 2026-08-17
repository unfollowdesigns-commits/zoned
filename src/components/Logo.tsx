/**
 * District Partners logo, redrawn as vector.
 *
 * Traced from the supplied artwork. Two earlier attempts were wrong the same
 * way, and naming the error matters because it is the thing to check first if
 * this still looks off: they were built as two IDENTICAL square rings offset
 * straight down. The mark is not that. It is two rings of DIFFERENT sizes,
 * offset DIAGONALLY, the ink one larger and sitting down and slightly left of
 * the blue one. That is what produces the open channels between the forms;
 * identical rings sharing an x-axis produce continuous full-height columns and
 * a blocky slab, which is exactly how the earlier versions read.
 *
 * Still a trace, not the official vector. Replace the two `ring()` calls and
 * the bracket path with the real path data when the file exists and every
 * usage on the site updates from this one component.
 *
 * The two tones the brand supplies, ink-on-light and white-on-dark, are one
 * drawing. Everything that is not brand blue is `currentColor`, so the lockup
 * inverts by inheriting `--v-ink`, which the `.v-light` band already redefines.
 */

/** The blue is the brand's, fixed. It does not follow the UI accent token. */
const BLUE = "#3e85de";

const STROKE = 34;

/** A rectangular ring as an even-odd path: outer rectangle minus inner. */
function ring(x: number, y: number, w: number, h: number) {
  const i = STROKE;
  return (
    `M${x} ${y}h${w}v${h}h-${w}Z` +
    `M${x + i} ${y + i}h${w - i * 2}v${h - i * 2}h-${w - i * 2}Z`
  );
}

/* Blue ring: the smaller of the two, up and to the right. */
const BLUE_RING = { x: 74, y: 0, w: 120, h: 187 };
/* Ink ring: larger, dropped down and a little left, drawn last so it reads on
   top wherever the two overlap. */
const INK_RING = { x: 67, y: 67, w: 195, h: 226 };

/** The bracket that opens the mark. A "[" with its arms reaching right. */
const BRACKET = "M0 0h50v34H34v119h16v34H0Z";

/**
 * The monogram alone. Use it wherever the full lockup is too wide to read:
 * a mobile header, a favicon, the preloader.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 262 293"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g fill={BLUE}>
        <path d={BRACKET} />
        <path d={ring(BLUE_RING.x, BLUE_RING.y, BLUE_RING.w, BLUE_RING.h)} fillRule="evenodd" />
      </g>
      <path
        d={ring(INK_RING.x, INK_RING.y, INK_RING.w, INK_RING.h)}
        fillRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The full lockup: monogram, dividing rule, and the two-line wordmark.
 *
 * The wordmark is live text rather than outlines, so it stays selectable and
 * crisp at any size. `textLength` forces both words to exactly the same
 * measure, which is what makes the block read as a justified stack the way the
 * original does. It is not inheritable, so it goes on each <text>.
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
      viewBox="0 0 1130 293"
      height={height}
      className={className}
      role="img"
      aria-label="District Partners"
      style={{ width: "auto", color: "var(--v-ink)" }}
    >
      <g fill={BLUE}>
        <path d={BRACKET} />
        <path d={ring(BLUE_RING.x, BLUE_RING.y, BLUE_RING.w, BLUE_RING.h)} fillRule="evenodd" />
      </g>
      <path
        d={ring(INK_RING.x, INK_RING.y, INK_RING.w, INK_RING.h)}
        fillRule="evenodd"
        fill="currentColor"
      />

      {/* The rule runs past the monogram top and bottom, as in the original. */}
      <rect x="330" y="0" width="15" height="293" fill="currentColor" />

      <g fill="currentColor" fontFamily="var(--font-display)" fontWeight={500}>
        <text x="415" y="150" fontSize="140" textLength={715} lengthAdjust="spacing">
          DISTRICT
        </text>
        <text x="415" y="240" fontSize="100" textLength={715} lengthAdjust="spacing">
          PARTNERS
        </text>
      </g>
    </svg>
  );
}
