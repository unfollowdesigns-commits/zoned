"use client";

import * as React from "react";
import { whenReached } from "@/lib/in-view";
import { useReducedMotion } from "@/lib/motion";

/**
 * A figure that counts up to its value when it is reached.
 *
 * Replaces the kit's ScrollCount, which starts at 0 and drives itself from an
 * IntersectionObserver. That observer is edge-triggered, so a fast scroll past
 * the section could leave it never having fired, and the page then rendered
 * "0+ professionals delivered" in display type. That is the failure this
 * component exists to prevent, and it is why two things here are deliberate:
 *
 *   1. The trigger is lib/in-view, which is level-triggered and cannot miss.
 *   2. It counts from 0 only while it is genuinely animating. Under reduced
 *      motion, and on the server, it renders the real value directly. A number
 *      is data first and an animation second, so the true value is the default
 *      and the count is the enhancement, never the other way round.
 *
 * Rendering the final value on the server also means the figure is correct with
 * JavaScript disabled and correct in the HTML a crawler sees.
 */
export default function CountUp({
  to,
  duration = 1.4,
  className,
}: {
  to: number;
  /** Seconds. */
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  // Server and first client render both produce the real value, so hydration
  // matches and nothing ever paints a wrong number.
  const [display, setDisplay] = React.useState(to);
  const [settled, setSettled] = React.useState(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    // Drop to 0 only now, once we know the count can actually run.
    setDisplay(0);
    setSettled(false);

    let raf = 0;
    const stop = whenReached(el, () => {
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / (duration * 1000));
        setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) raf = requestAnimationFrame(step);
        else setSettled(true);
      };
      raf = requestAnimationFrame(step);
    });

    return () => {
      stop();
      cancelAnimationFrame(raf);
      // Whatever happens, the figure must end up telling the truth.
      setDisplay(to);
      setSettled(true);
    };
  }, [to, duration, reduced]);

  return (
    <span
      ref={ref}
      className={className}
      /* Equal-width digits stop the number jittering sideways as it runs, but
         they are the wrong choice for a large standalone figure: at display
         size a value like 100 sits visibly loose. Dropped once it lands. */
      style={{ fontVariantNumeric: settled ? "normal" : "tabular-nums" }}
    >
      {display.toLocaleString()}
    </span>
  );
}
