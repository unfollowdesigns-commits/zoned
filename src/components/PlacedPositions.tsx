"use client";

import * as React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { PLACED_POSITIONS } from "@/lib/site";
import { useReducedMotion } from "@/lib/motion";
import LightBand from "@/components/ui/LightBand";

/**
 * The seats we fill, as two rails that run past each other.
 *
 * WHY THIS RATHER THAN A PARAGRAPH OR A CHIP GRID, both of which this has been.
 * A row of pills reads as filters, as though the visitor is meant to pick one.
 * A paragraph reads, but it sits there: a list of the most senior seats in a
 * company should not be a static block of text on a page selling the ability to
 * fill them. This runs, continuously, and the point it makes is quantity, which
 * is exactly the claim.
 *
 * THE SPEED IS COUPLED TO SCROLL VELOCITY, and that is what separates this from
 * the marquee on every template. A constant-speed banner is wallpaper: it moves
 * whether or not anyone is there, so the eye files it as decoration within a
 * second. Here the rails have a slow base drift, and scrolling drives them
 * faster, so the section responds to the person rather than performing at them.
 * Scrolling UP reverses them, which is the detail that makes it read as a
 * physical belt being driven rather than a loop being played.
 *
 * Two rows in opposite directions, because one row travelling alone reads as
 * the page sliding. Two in opposition read as machinery.
 *
 * The loop is seamless because the content is rendered four times and the
 * offset wraps at 25 percent; there is no reset frame to catch.
 */

/** Keeps a value inside a range, so the rail can loop without a jump. */
function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

function Rail({
  direction,
  baseSpeed,
  children,
}: {
  /** 1 runs left to right, -1 right to left. */
  direction: 1 | -1;
  baseSpeed: number;
  children: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  /* Softened, or every wheel tick jolts the rail. The spring is on the INPUT
     here, not on the position, which is the difference between a belt with
     inertia and a rubber band. */
  const smooth = useSpring(scrollVelocity, {
    damping: 48,
    stiffness: 380,
    mass: 0.6,
  });
  /* Clamped: a trackpad flick can produce velocities that would otherwise blur
     the type into an unreadable smear. */
  const factor = useTransform(smooth, [-2200, 0, 2200], [-4, 0, 4], {
    clamp: true,
  });

  const previous = React.useRef(0);

  useAnimationFrame((t) => {
    const dt = previous.current ? (t - previous.current) / 1000 : 0;
    previous.current = t;

    /* Base drift plus whatever the scroll is contributing. Direction flips with
       the sign of the velocity, so scrolling back up runs the rail backwards. */
    const v = factor.get();
    const moved = direction * baseSpeed * dt + direction * baseSpeed * v * dt;
    x.set(wrap(-25, 0, x.get() + (moved / 10)));
  });

  const percent = useTransform(x, (v) => `${v}%`);

  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        style={{ x: percent }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Titles({ tint }: { tint: boolean }) {
  return (
    <>
      {PLACED_POSITIONS.map((title) => (
        <span key={title} className="flex shrink-0 items-center">
          <span
            className={`v-display px-[0.35em] text-[length:var(--t-display-fluid)] leading-[1.15] tracking-[-0.03em] ${
              tint ? "text-[var(--v-primary-deep)]" : "text-[var(--v-ink)]"
            }`}
          >
            {title}
          </span>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--v-primary)]/50"
          />
        </span>
      ))}
    </>
  );
}

export default function PlacedPositions() {
  const reduced = useReducedMotion();

  return (
    <LightBand>
      <div className="py-24 sm:py-28">
        <div className="mx-auto mb-12 max-w-[1280px] px-6">
          <p className="v-eyebrow">Frequently placed</p>
        </div>

        {reduced ? (
          /* No belt under reduced motion: the same information as a list, which
             is what the rails are saying anyway. */
          <ul className="mx-auto flex max-w-[1280px] flex-wrap gap-x-8 gap-y-3 px-6">
            {PLACED_POSITIONS.map((t) => (
              <li
                key={t}
                className="v-display text-[length:var(--t-title)] text-[var(--v-ink)]"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-3">
            <Rail direction={-1} baseSpeed={2.2}>
              <Titles tint={false} />
            </Rail>
            <Rail direction={1} baseSpeed={1.6}>
              <Titles tint />
            </Rail>
          </div>
        )}

        {/* The rails are decorative to assistive technology, so the list is
            stated once, properly, for anything that is not looking at them. */}
        <ul className="sr-only">
          {PLACED_POSITIONS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </LightBand>
  );
}
