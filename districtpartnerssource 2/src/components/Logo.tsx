/**
 * District Partners logo, redrawn as vector.
 *
 * Traced by eye from a low-resolution raster, so treat it as a stand-in: it is
 * geometrically clean and scales without softening, but it is not the official
 * artwork. Replace the path data here with the real vector when it arrives and
 * every usage updates at once.
 *
 * The monogram is one bracket-and-square glyph drawn twice, the second rotated
 * 180 degrees, which is how the interlock reads in the original.
 */

const BLUE = "#3e7bfa";

/** The DP monogram on its own. Square aspect. */
export function LogoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
    >
      {/* Upper-left bracket, open on its right side: a vertical stem with arms
          reaching right at top and bottom. */}
      <g fill={BLUE}>
        <rect x="2" y="2" width="9" height="38" />
        <rect x="2" y="2" width="34" height="9" />
        <rect x="2" y="31" width="34" height="9" />
      </g>

      {/* The same bracket rotated 180 degrees. Its arms reach back left, so the
          two forms cross in the middle and interlock. */}
      <g fill="currentColor" transform="rotate(180 32 32)">
        <rect x="2" y="2" width="9" height="38" />
        <rect x="2" y="2" width="34" height="9" />
        <rect x="2" y="31" width="34" height="9" />
      </g>
    </svg>
  );
}

/**
 * Full lockup: monogram, dividing rule, and the two-line wordmark.
 * The wordmark is set in the display face and inherits colour, so it works on
 * the dark ground without a second asset.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0 text-[var(--v-ink)]" />
      <span aria-hidden="true" className="h-8 w-px shrink-0 bg-[var(--v-border-strong)]" />
      <span className="v-display flex flex-col leading-none">
        <span className="text-[length:var(--t-secondary)] tracking-[0.02em]">DISTRICT</span>
        <span className="mt-[3px] text-[length:var(--t-label)] font-medium tracking-[0.26em] text-[var(--v-muted)]">
          PARTNERS
        </span>
      </span>
    </span>
  );
}
