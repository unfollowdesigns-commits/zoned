"use client";

import { Curtain } from "@/kit/components/Curtain";
import { PRELOAD_KEY } from "@/lib/preload";

/**
 * First-paint preloader.
 *
 * The mechanism is the kit's Curtain: it ships in the server HTML so nothing
 * flashes underneath, a pre-paint script in <head> skips it for returning
 * visitors and for anyone who asked for reduced motion, and it releases the
 * scroll lock on every exit path including unmount. See kit/components/Curtain.
 *
 * THE MARK'S ANIMATION IS CSS, NOT FRAMER, and that is not a style preference.
 * The curtain renders on the server. A Framer element renders at its `initial`
 * values in that HTML, so an `initial` of opacity 0 means the mark is invisible
 * from first paint until React hydrates, which on a cold load is most of the
 * curtain's life. The first version of this file did exactly that and showed an
 * empty black screen with a progress bar under it. CSS keyframes start at first
 * paint with no JavaScript involved, which is the only correct answer for
 * anything inside a curtain.
 *
 * The assembly is built from the logo's own logic rather than applied to it.
 * The monogram is two square rings that interlock because one is dropped below
 * the other, so the sequence separates them and puts them back: the bracket
 * arrives from the left, the blue ring drops in from above, the ink ring rises
 * from below, and they lock. A generic fade would animate the logo. This
 * animates what the logo is.
 */

const BLUE = "#3e85de";

const RING_W = 184;
const STROKE = 33;

function ring(x: number, y: number) {
  const i = STROKE;
  return (
    `M${x} ${y}h${RING_W}v${RING_W}h-${RING_W}Z` +
    `M${x + i} ${y + i}h${RING_W - i * 2}v${RING_W - i * 2}h-${RING_W - i * 2}Z`
  );
}

function Mark() {
  return (
    <div className="flex flex-col items-center gap-7">
      <svg viewBox="0 0 260 260" width="128" height="128" aria-hidden="true">
        <path className="dp-pre-bracket" d="M0 0h48v33H33v118h15v33H0Z" fill={BLUE} />
        <path className="dp-pre-blue" d={ring(76, 0)} fillRule="evenodd" fill={BLUE} />
        <path
          className="dp-pre-ink"
          d={ring(76, 76)}
          fillRule="evenodd"
          fill="var(--v-ink)"
        />
      </svg>

      <div className="dp-pre-word flex items-baseline gap-[0.55em] text-[var(--v-ink)]">
        <span
          className="v-display"
          style={{ fontSize: "var(--t-secondary)", letterSpacing: "0.2em" }}
        >
          DISTRICT
        </span>
        <span
          className="v-display"
          style={{ fontSize: "var(--t-small)", letterSpacing: "0.28em" }}
        >
          PARTNERS
        </span>
      </div>
    </div>
  );
}

export default function Preloader() {
  return <Curtain mark={<Mark />} sessionKey={PRELOAD_KEY} />;
}
