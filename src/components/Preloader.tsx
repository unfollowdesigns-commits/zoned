"use client";

import { Curtain } from "@/kit/components/Curtain";
import { MARK_PARTS } from "@/components/Logo";
import { PRELOAD_KEY } from "@/lib/preload";

/**
 * First-paint preloader.
 *
 * The mechanism is the kit's Curtain: it ships in the server HTML so nothing
 * flashes underneath, a pre-paint script in <head> skips it for returning
 * visitors and for anyone who asked for reduced motion, and it releases the
 * scroll lock on every exit path including unmount. See kit/components/Curtain.
 *
 * IT HAS THE LOGO IN IT NOW, WHICH IT DID NOT. This was two lines of wordmark
 * type and no mark at all: a note in this file said the assembly "will come
 * back the moment the real mark exists", and it has existed in components/Logo
 * since. So a screen presenting itself as the brand's first impression was
 * showing the least distinctive part of it. The geometry is imported from the
 * logo rather than restated (see MARK_PARTS), so the two can never drift.
 *
 * THE MARK'S ANIMATION IS CSS, NOT FRAMER, and that is not a style preference.
 * The curtain renders on the server. A Framer element renders at its `initial`
 * values in that HTML, so an `initial` of opacity 0 means the element is
 * invisible from first paint until React hydrates, which on a cold load is
 * most of the curtain's life. Two things in the Curtain were doing exactly
 * that and have been moved to CSS with it: the bloom, which left the mark on
 * flat black, and the progress bar, which sat empty.
 *
 * The assembly is built from the logo's own logic rather than applied to it.
 * The monogram is two square rings that interlock because one is dropped below
 * and left of the other, so the sequence separates them and puts them back:
 * the bracket arrives from the left, the blue ring drops in from above, the
 * ink ring rises from below, and the whole thing settles once as they lock. A
 * generic fade would animate the logo. This animates what the logo is.
 */

/**
 * The wordmark, arriving letter by letter out of a mask.
 *
 * Under the monogram rather than instead of it. Each letter rises out of a
 * clipped box, so the name is wiped into being rather than faded in.
 */
function Letters({
  word,
  size,
  tracking,
  delay,
}: {
  word: string;
  size: string;
  tracking: string;
  delay: number;
}) {
  return (
    <span className="flex" aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span
          key={i}
          className="dp-pre-letter inline-block overflow-hidden"
          style={{
            // Each letter carries its own delay as a custom property, so the
            // whole run is one CSS animation rather than N staggered ones.
            ["--d" as string]: `${delay + i * 0.04}s`,
            paddingBottom: "0.14em",
            marginBottom: "-0.14em",
          }}
        >
          <span
            className="v-display inline-block"
            style={{ fontSize: size, letterSpacing: tracking }}
          >
            {ch}
          </span>
        </span>
      ))}
    </span>
  );
}

function Mark() {
  return (
    <div className="flex flex-col items-center gap-7 text-[var(--v-ink)]">
      {/* The monogram, assembling. The lock settle is on the group so the
          pieces read as clicking together rather than as three separate
          arrivals that happen to stop. */}
      <svg
        viewBox={MARK_PARTS.viewBox}
        aria-hidden="true"
        className="h-[86px] w-auto overflow-visible"
      >
        <g className="dp-mark-lock">
          <path
            className="dp-mark-part dp-mark-bracket"
            d={MARK_PARTS.bracket}
            fill={MARK_PARTS.blue}
          />
          <path
            className="dp-mark-part dp-mark-blue"
            d={MARK_PARTS.blueRing}
            fillRule="evenodd"
            fill={MARK_PARTS.blue}
          />
          <path
            className="dp-mark-part dp-mark-ink"
            d={MARK_PARTS.inkRing}
            fillRule="evenodd"
            fill="currentColor"
          />
        </g>
      </svg>

      <div className="flex flex-col items-center gap-2">
        <Letters word="DISTRICT" size="var(--t-title)" tracking="0.22em" delay={0.6} />
        <Letters word="PARTNERS" size="var(--t-secondary)" tracking="0.42em" delay={0.78} />
      </div>

      {/* One rule on this screen, and it is the Curtain's progress bar. The
          previous version drew a decorative accent rule here as well, 160px
          wide, thirty pixels above a 168px progress bar: two near-identical
          hairlines stacked, which reads as a rendering fault rather than as
          two elements. */}
      <span className="sr-only">District Partners</span>
    </div>
  );
}

export default function Preloader() {
  return <Curtain mark={<Mark />} sessionKey={PRELOAD_KEY} />;
}
