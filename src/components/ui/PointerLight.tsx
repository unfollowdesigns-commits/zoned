"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A light that follows the pointer across a card, and lights its edge.
 *
 * WHY THIS EXISTS AS AN ELEMENT RATHER THAN A PSEUDO-ELEMENT. The card already
 * had a spotlight class and a pointer handler writing `--mx` and `--my`, and
 * none of it did anything: `.v-glass::before` draws the lit rim and
 * `.v-spotlight::before` draws the pointer radial, and those are the same
 * pseudo-element on the same node. One background wins and the other is
 * silently discarded. The handler had been feeding coordinates to a rule that
 * lost the cascade. `::after` was taken too, by the specular sweep.
 *
 * So this is a real element, which also makes it reusable: any card can drop it
 * in and get the behaviour without needing its own handler.
 *
 * THE EDGE IS THE POINT, not the surface glow. A soft radial on the face of a
 * card is the common version and it reads as a smudge under the cursor. What
 * makes a card feel like a physical object is its EDGE catching light: a rim
 * that brightens where the pointer is and stays dim elsewhere tells the eye
 * there is a bevel there, and the whole card gains a thickness it did not have.
 * That is the detail on the interfaces this is measured against, and it is
 * cheap: one masked gradient, no transform, so it cannot fight the scale and
 * lift the sticky stack is already applying to the same element.
 *
 * The handler is attached to the parent rather than taking a ref from the
 * caller, so adding this to a card is one line and never a refactor.
 */
export default function PointerLight({
  /** Radius of the lit section of rim, in pixels. */
  size = 260,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    /* Coalesced into a frame. `pointermove` fires far more often than the
       screen refreshes, and writing a custom property is a style invalidation:
       done per event it is a few hundred redundant recalcs a second on an
       effect nobody can see at that resolution. */
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      host.style.setProperty("--mx", `${x}px`);
      host.style.setProperty("--my", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    /* Parked back to the centre on the way out, so the next hover starts from
       a neutral position instead of snapping from wherever the pointer last
       left the card. */
    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      host.style.setProperty("--mx", "50%");
      host.style.setProperty("--my", "50%");
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`v-pointer-light ${className}`}
      style={{ "--pl-size": `${size}px` } as React.CSSProperties}
    />
  );
}
