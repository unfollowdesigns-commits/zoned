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

/**
 * The word arrives letter by letter, out of a mask.
 *
 * This used to assemble the monogram from its own pieces, which was the better
 * idea and will come back the moment the real mark exists. Until then it
 * animates what is actually correct: the wordmark. Each letter rises out of a
 * clipped box, so the name is wiped into being rather than faded in, and the
 * accent rule draws underneath once the letters have landed.
 */
function Letters({ word, size, tracking, delay }: {
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
            ["--d" as string]: `${delay + i * 0.045}s`,
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
    <div className="flex flex-col items-center gap-4 text-[var(--v-ink)]">
      <Letters word="DISTRICT" size="var(--t-display)" tracking="0.06em" delay={0.1} />
      <Letters word="PARTNERS" size="var(--t-title)" tracking="0.28em" delay={0.42} />
      <span
        aria-hidden="true"
        className="dp-pre-rule mt-3 block h-px w-40 origin-left bg-[linear-gradient(90deg,transparent,var(--v-primary),transparent)]"
      />
      <span className="sr-only">District Partners</span>
    </div>
  );
}

export default function Preloader() {
  return <Curtain mark={<Mark />} sessionKey={PRELOAD_KEY} />;
}
