/**
 * District Partners logo.
 *
 * THE MONOGRAM IS DELIBERATELY ABSENT, and this is a decision rather than an
 * omission. It was redrawn by eye twice from the supplied artwork and was wrong
 * both times, in the same way: it was built as two identical square rings
 * offset straight down, when the real mark is two forms of DIFFERENT sizes
 * offset diagonally. That construction error is why it read as a blocky stack
 * with continuous full-height columns instead of two interlocking shapes with
 * clear channels between them, and tuning inside the wrong construction could
 * never fix it.
 *
 * A third guess would be worse than none. A wordmark that is right is a better
 * placeholder than a mark that is confidently wrong, because a wrong mark gets
 * approved by accident and ships.
 *
 * TO RESTORE IT: drop the real asset into public/ and render it here in place
 * of this file's contents. Every usage on the site reads from this component,
 * so the header, footer, preloader and assistant all update at once. Prefer an
 * SVG, which stays sharp at every size and can be recoloured for the cream
 * bands from a single file; two PNGs, one per tone, also work.
 *
 * The wordmark itself is live text rather than outlines, so it stays selectable
 * and crisp at any size. `textLength` forces both words to exactly the same
 * measure, which is what makes the block read as a justified stack the way the
 * original does. Without it the two lines drift apart as the font loads and the
 * lockup looks broken for a frame.
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
      viewBox="0 0 700 258"
      height={height}
      className={className}
      role="img"
      aria-label="District Partners"
      style={{ width: "auto", color: "var(--v-ink)" }}
    >
      {/* textLength is not inheritable, so it goes on each <text>. */}
      <g fill="currentColor" fontFamily="var(--font-display)" fontWeight={500}>
        <text x="0" y="118" fontSize="146" textLength={700} lengthAdjust="spacing">
          DISTRICT
        </text>
        <text x="0" y="208" fontSize="104" textLength={700} lengthAdjust="spacing">
          PARTNERS
        </text>
      </g>
    </svg>
  );
}
