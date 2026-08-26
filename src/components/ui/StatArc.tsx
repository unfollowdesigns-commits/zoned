"use client";

import * as React from "react";
import { whenReached } from "@/lib/in-view";
import { useReducedMotion } from "@/lib/motion";

/**
 * A radial gauge for a figure that is genuinely a proportion.
 *
 * ONLY PERCENTAGES GET THIS, AND THE RULE IS NOT A STYLE PREFERENCE. A gauge
 * says "this much out of the whole". That statement is true of "90 percent of
 * clients come through referrals" and meaningless for "1,100 professionals
 * delivered": eleven hundred out of WHAT? Drawing an arc for a bare count means
 * inventing a denominator, and the reader has no way to know it was invented,
 * so the chart quietly asserts something nobody at the firm ever said. Counts
 * keep the plain number. See components/Stats.
 *
 * pathLength IS WHAT MAKES IT EXACT. Setting it to 100 tells the renderer to
 * treat the circle as being one hundred units around whatever its real
 * circumference is, so `stroke-dasharray: 90 100` is literally ninety percent
 * of the ring, with no 2*pi*r arithmetic to get wrong and nothing to re-derive
 * if the radius changes. The same trick draws the line icons.
 *
 * The arc grows from zero on arrival, using the shared level-triggered checker
 * rather than an IntersectionObserver, for the reason set out in lib/in-view: an
 * observer attached after hydration never fires for anything already scrolled
 * past, and a gauge stuck at zero is not a missing animation, it is a wrong
 * number on the screen.
 */
export default function StatArc({
  value,
  children,
  className = "",
}: {
  /** 0 to 100. */
  value: number;
  /** The figure itself, centred in the ring. */
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    /* Reduced motion is DERIVED below, not written into state here. Calling
       setState synchronously in an effect body cascades an extra render on
       every one of these, and the value is already known at render time. */
    if (!el || reduced) return;
    return whenReached(el, () => setOn(true));
  }, [reduced]);

  const shown = on || reduced;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div ref={ref} className={`relative grid place-items-center ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="h-[132px] w-[132px] -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          className="text-[var(--v-ink)]/[0.10]"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--v-primary)"
          strokeWidth="7"
          strokeLinecap="round"
          /* See the note above: 100 units around, so the dash IS the percent. */
          pathLength={100}
          strokeDasharray={`${shown ? pct : 0} 100`}
          style={{
            transition: reduced
              ? undefined
              : "stroke-dasharray 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
