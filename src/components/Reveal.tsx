/**
 * Scroll reveal.
 *
 * Deliberately not a Framer whileInView: that reveals via an
 * IntersectionObserver attached after hydration, so an element scrolled past
 * during the hydration window never intersects again and stays invisible
 * permanently. This uses a CSS scroll timeline instead. The element's base
 * style is the visible one, and the animation only ever plays as an
 * enhancement, so no code path can leave content hidden.
 *
 * `delay` is kept as a stagger index rather than a duration, since a
 * scroll-driven animation has no time axis to delay along.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Stagger hint. Values are treated as steps, matching the old delay scale. */
  delay?: number;
  className?: string;
}) {
  const index = Math.round(delay / 0.07);
  return (
    <div className={className}>
      <div
        className="v-reveal"
        style={index ? ({ "--reveal-i": index } as React.CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
}
