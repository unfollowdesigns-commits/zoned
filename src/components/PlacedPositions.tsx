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
     the type into an unreadable smear. Held to 2.5 rather than 4, because the
     coupling should be felt as the rail responding, not seen as it lurching:
     past about this much the row stops being readable during a fast scroll and
     the effect reads as a glitch. */
  const factor = useTransform(smooth, [-2200, 0, 2200], [-2.5, 0, 2.5], {
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
    <div
      className="flex overflow-hidden"
      /* THE RAILS DISSOLVE AT THE EDGES INSTEAD OF BEING CUT.

         Without this the viewport edge guillotines whatever word happens to be
         crossing it, so the row begins and ends on half a letter. At small
         sizes you might forgive it; at any size it is the single thing that
         makes a marquee read as broken rather than as continuous. The mask
         means type arrives and leaves rather than starting and stopping, and
         it costs one composited layer.

         12 percent is enough to fade a whole word at this size. */
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
      }}
    >
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

/**
 * THE SIZE IS THE WHOLE POINT OF THIS COMPONENT'S LAST REVISION.
 *
 * These ran at `--t-display-fluid`, which tops out at 64px, in the display
 * weight of 700, in full-strength ink and full-strength blue. That is the
 * treatment reserved for a section's actual heading, and it was being spent on
 * a supporting detail: the result was two black-and-blue bands that dominated
 * the page and left nothing for the real headings to be louder than.
 *
 * Scale is relative. Making the loudest thing on the page something that only
 * supports the argument does not just make that element too big, it flattens
 * everything else by removing the contrast the hierarchy depends on.
 *
 * So this drops to roughly a third of the size, out of the display weight, and
 * to a tone that recedes. It reads as a quiet ticker running under the section,
 * which is what a list of job titles should be. The blue survives only in the
 * separator dots: one accent, used small, is what keeps two rows of repeating
 * text from turning into wallpaper.
 */
function Titles({ tint }: { tint: boolean }) {
  return (
    <>
      {PLACED_POSITIONS.map((title) => (
        <span key={title} className="flex shrink-0 items-center">
          <span
            className={`px-[0.9em] text-[length:clamp(15px,1.5vw,21px)] font-medium leading-[1.4] tracking-[-0.005em] ${
              /* Two tones a step apart, not two colours. The difference gives
                 the pair depth so it does not read as one printed block, and it
                 is small enough that neither row competes for attention. */
              tint ? "text-[var(--v-muted)]" : "text-[var(--v-ink)]/75"
            }`}
          >
            {title}
          </span>
          <span
            aria-hidden="true"
            className="h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--v-primary)]/60"
          />
        </span>
      ))}
    </>
  );
}

export default function PlacedPositions() {
  const reduced = useReducedMotion();

  /* NO BAND OF ITS OWN ANY MORE. This used to be a whole cream section 306px
     tall carrying one eyebrow and two rails, sitting directly above another
     cream section 479px tall carrying one eyebrow and eight names. Two thin
     pale strips back to back read as one washed out zone with nothing in it,
     and they broke the alternation the rest of the page keeps. Both are
     evidence, so they are now one band. See components/Proof. */
  return (
    <>
      <div>
        <div className="mx-auto mb-6 max-w-[1280px] px-6">
          <p className="v-eyebrow">Frequently placed</p>
        </div>

        {reduced ? (
          /* No belt under reduced motion: the same information as a list, which
             is what the rails are saying anyway. */
          <ul className="mx-auto flex max-w-[1280px] flex-wrap gap-x-7 gap-y-2 px-6">
            {PLACED_POSITIONS.map((t) => (
              <li
                key={t}
                className="text-[length:clamp(15px,1.5vw,21px)] font-medium text-[var(--v-ink)]/75"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : (
          /* The rows sit close together now. At 64px they needed separating or
             they collided; at this size a tight pair reads as one object, which
             is the calmer picture and one fewer thing on the page. */
          <div className="flex flex-col gap-1">
            <Rail direction={-1} baseSpeed={1.8}>
              <Titles tint={false} />
            </Rail>
            <Rail direction={1} baseSpeed={1.3}>
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
    </>
  );
}
