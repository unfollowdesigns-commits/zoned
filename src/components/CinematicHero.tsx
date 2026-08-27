"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import ParticleWave, { type WaveSearchApi } from "@/components/ParticleWave";
import { SERVICES } from "@/lib/site";

/**
 * One screen: the market, and a search happening in it.
 *
 * WHAT THIS REPLACED, AND WHY IT IS GONE. Two things stacked up here. First,
 * stock footage: purple and red light streaks off a third-party CDN, on a site
 * whose whole palette is one blue family, saying nothing about anything. On
 * top of it, a 360vh scroll mechanic in which a framed card expanded to full
 * bleed. The mechanic was well built, and it was built to open a window onto
 * that footage. With the footage gone the card held nothing, and two rounds of
 * glass treatments (a tint, then backdrop optics) both produced the same grey
 * slab, because there was nothing behind the glass to treat. A transformation
 * whose subject is nothing is decoration, however smoothly it runs. So the
 * frame went with the footage.
 *
 * THE SCROLL TRANSFORMATION CAME BACK, POINTED AT THE RIGHT SUBJECT. Cutting
 * the card also cut the one scroll-driven transformation on the site, and that
 * was a real loss: the expansion was the moment the page felt built. So the
 * scrub returns, but what it scrubs is the camera. Scrolling flies the viewer
 * DOWN INTO the field: the horizon sinks, the surface compresses toward the
 * foot of the frame, the waves grow against the falling camera until the
 * crests tower past the eye line, and the type hands off to the services row
 * once the descent is done. The wow is the same commodity the card sold;
 * the subject is finally ours.
 *
 * WHAT THE HERO SAYS NOW. The particle field is not scenery behind the
 * headline: it is the thing the headline is about. The field is the market.
 * The typewriter types "finding Executives", and as each word types, a band of
 * light sweeps the surface and candidates glint in its wake; when the word
 * commits, the glints narrow to one, and that one lifts off the surface and
 * holds for exactly as long as the word holds; when the word starts erasing,
 * the field lets it go and the next word searches somewhere else. Cause and
 * effect, on a loop, in the site's own material. The sentence performs itself.
 *
 * The wiring is one ref: ParticleWave fills `waveApi` with three verbs
 * (search, resolve, release) and the typewriter calls them at the three
 * moments of its own state machine. Neither component knows anything else
 * about the other.
 *
 * If real footage ever exists (the firm, the people, the city), it has a
 * place on this page. Stock never will.
 */

const HEADLINE = "Our talent is finding";
/* Longest first: the slot is sized by measuring this one. */
const ROTATING = ["Professionals.", "Executives.", "Operators.", "Yours."];
/**
 * The lede changes as you descend, and the change is the point.
 *
 * The first states the problem, which is what a visitor at the top of a page
 * needs. Holding that same paragraph for two and a half viewports while the
 * camera flies into the field would waste the one thing a scrubbed hero can
 * do that a static one cannot: say a second thing. So the block travels down
 * with the dive and the paragraph under it hands over to the answer.
 *
 * The second is District Partners' own line, the one the footer already
 * carries. It is not written for this slot, which is the point: nothing in
 * this hero is copy invented to fill a shape.
 */
const LEDE =
  "When the talent decisions are as consequential as the capital decisions, you need more than a search firm. We design talent strategy from the boardroom down, and execute from day one.";
const LEDE_LANDED =
  "An independent, partner led firm built to serve clients wherever they need us most. Four ways in, one partner across all of them.";

/* easeInOutCubic, for every scrubbed value: shaped but spread across the whole
   scroll, where a hard ease-out finishes the picture halfway through and
   leaves the back half of the section dead. Learned here the hard way once
   already. */
const SCRUB = cubicBezier(0.65, 0, 0.35, 1);

/**
 * True below the `sm` breakpoint, watched rather than read once.
 *
 * THE DIVE NEEDS A DIFFERENT CHOREOGRAPHY ON A PHONE, and this is what picks
 * it. On a wide screen the type rides down into the space the four-across
 * services row does not use. On a phone that row stacks to full height, so the
 * descending block landed straight on top of it: measured at 390x844, the
 * second paragraph was printed over "Executive Search" and its note. Same
 * markup, same values, completely broken, and invisible from any desktop
 * viewport.
 */
function useNarrow() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return narrow;
}

export default function CinematicHero() {
  const reduced = useReducedMotion();
  const narrow = useNarrow();
  /* The channel from the typewriter to the field. See WaveSearchApi. */
  const waveApi = React.useRef<WaveSearchApi | null>(null);
  /* The channel from the scroll to the camera. A ref, not state: it changes
     every scroll frame and is read by a canvas loop, so React re-rendering
     over it would be pure waste. */
  const diveRef = React.useRef(0);

  const wrap = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });
  const dive = useTransform(scrollYProgress, [0, 1], [0, 1], { ease: SCRUB });
  useMotionValueEvent(dive, "change", (v) => {
    diveRef.current = v;
  });

  /* THE TYPE RIDES DOWN WITH THE CAMERA INSTEAD OF LEAVING. It used to fade
     out and rise away in the first half, which threw away the headline for
     most of the section and left the middle of the dive carrying nothing but
     weather. Now the block travels down the frame and shrinks as it goes, so
     it recedes WITH the descent rather than being removed from it, and the
     paragraph under it hands over to a second line on the way. The words are
     present for the whole scroll and say two different things across it.

     Scaled from its own top left corner, so the block shrinks toward the
     margin it is aligned to rather than drifting inward off the grid. */
  /* On a phone the block holds its place and hands over by fading, because
     there is no lateral room for it to descend into. See useNarrow. */
  const typeY = useTransform(scrollYProgress, [0, 1], ["0vh", narrow ? "4vh" : "31vh"], {
    ease: SCRUB,
  });
  const typeScale = useTransform(scrollYProgress, [0, 1], [1, narrow ? 0.86 : 0.62], {
    ease: SCRUB,
  });
  /* No fade on the block. There was one here as insurance against the mobile
     collision, and two things were wrong with it: framer wrote opacity 1 for
     the whole scrub whatever the range said, so it never ran, and measuring
     the layout showed it was not needed anyway. On the smallest phone the
     block's last line ends 60px above the first service link. Deleting a
     mechanism that does nothing beats keeping one that looks like it does. */
  /* The two paragraphs are stacked in the same box and cross-faded, so the
     swap costs no layout and the block never jumps as the text changes
     length. */
  /* EVERY EASED RANGE ENDS WITH A HOLD POINT AT 1, and that is a correctness
     fix rather than a style. `useTransform` with a custom `ease` does not
     clamp the normalized input before running the easing function: given a
     range of [0.24, 0.44] and a progress of 0.98, the bezier is solved at
     t = 3.7, where it returns close to zero again, so the mix comes back to
     its STARTING value. Measured: at the bottom of the scrub the first
     paragraph was fully opaque again and the second never appeared, so the
     swap this section exists to perform silently did not happen. Writing each
     range as [a, b, 1] with the final output repeated keeps the mapping
     monotonic past b, so a value that has finished stays finished. */
  const ledeAOpacity = useTransform(scrollYProgress, [0.24, 0.44, 1], [1, 0, 0], { ease: SCRUB });
  const ledeBOpacity = useTransform(scrollYProgress, [0.42, 0.62, 1], [0, 1, 1], { ease: SCRUB });
  const tailOpacity = useTransform(scrollYProgress, [0.7, 0.94, 1], [0, 1, 1], { ease: SCRUB });
  const tailY = useTransform(scrollYProgress, [0.7, 0.94, 1], [24, 0, 0], { ease: SCRUB });

  /* No scroll length, no pin, no dive under reduced motion: one static screen
     with everything present. Animating nothing is correct here. */
  if (reduced) {
    return (
      /* `min-h-svh`, not `h-svh`. Nothing is pinned on this branch, so the
         frame does not have to be exactly one screen, and forcing it to be one
         is what cropped the services row on a short viewport. Letting the
         section grow costs nothing here, where cropping loses the last link in
         the row. */
      <section className="relative min-h-svh overflow-hidden">
        <ParticleWave opacity={0.9} searchApi={waveApi} />
        <Shade />
        <div className="relative mx-auto flex min-h-svh max-w-[1280px] flex-col px-6 pt-[13vh]">
          {/* Copy returns a fragment, so it needs a box of its own or its
              eyebrow, headline and lede become three separate flex items. */}
          <div>
            <Copy reduced waveApi={waveApi} />
          </div>
          <div className="mt-auto pb-14 sm:pb-12">
            <Tail />
          </div>
        </div>
      </section>
    );
  }

  return (
    /* 260vh: enough scroll for the descent to be watched, short of the 360vh
       the old card needed for its five phases. The dive is one move. */
    <div ref={wrap} className="relative h-[260vh]">
      {/* svh, not vh: on a phone the URL bar makes 100vh taller than the
          screen, and a pinned frame must actually be one screen. */}
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        {/* The stage. The headline drives the search in it; the scroll drives
            the camera down into it. See ParticleWave for both. */}
        <ParticleWave opacity={0.9} searchApi={waveApi} diveRef={diveRef} />
        <Shade />

        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col px-6 pt-[12vh]">
          <motion.div style={{ y: typeY, scale: typeScale, transformOrigin: "0% 0%" }}>
            <Copy
              reduced={false}
              waveApi={waveApi}
              ledeAOpacity={ledeAOpacity}
              ledeBOpacity={ledeBOpacity}
            />
          </motion.div>

          {/* The payoff row: arrives once the camera is down among the
              crests, taking the place the type left. The frame is never
              carrying both. */}
          <motion.div className="mt-auto pb-14 sm:pb-10" style={{ opacity: tailOpacity, y: tailY }}>
            <Tail />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** A foot of shade, so whatever text is at the bottom sits on quiet ground,
 *  and the hero's lower edge settles against the section after it. */
function Shade() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[34vh] bg-[linear-gradient(180deg,transparent_0%,rgba(5,7,15,0.72)_100%)]"
    />
  );
}

/** The eyebrow, the headline with its typewriter, and the changing lede. */
function Copy({
  reduced,
  waveApi,
  ledeAOpacity,
  ledeBOpacity,
}: {
  reduced: boolean;
  waveApi: React.MutableRefObject<WaveSearchApi | null>;
  /** Absent under reduced motion, where only the first paragraph renders. */
  ledeAOpacity?: MotionValue<number>;
  ledeBOpacity?: MotionValue<number>;
}) {
  return (
    <>
      <p className="v-eyebrow text-[var(--v-primary)]">Talent Infrastructure</p>

      <h1
        className="v-display mt-7 max-w-[18ch] text-balance text-white"
        style={{
          fontSize: "var(--t-hero)",
          lineHeight: "var(--lh-hero)",
          letterSpacing: "var(--tr-hero)",
        }}
      >
        {HEADLINE.split(" ").map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <span
              className={reduced ? undefined : "dp-word"}
              style={
                reduced ? undefined : { animationDelay: `${(0.35 + i * 0.055).toFixed(3)}s` }
              }
            >
              {word}
            </span>{" "}
          </React.Fragment>
        ))}
        <span
          className={reduced ? undefined : "dp-word"}
          style={reduced ? undefined : { animationDelay: "0.57s" }}
        >
          <FlipWord words={ROTATING} reduced={reduced} wave={waveApi} />
        </span>
      </h1>

      {reduced ? (
        <p className="mt-8 max-w-[52ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]">
          {LEDE}
        </p>
      ) : (
        /* Both paragraphs occupy the SAME grid cell, so the taller one sets
           the height once and the cross-fade cannot shift the block as the
           text changes length. Stacking them absolutely would do the same and
           would take the box out of flow, which is what pushes the services
           row underneath into the wrong place. */
        <div className="mt-8 grid max-w-[52ch]">
          <motion.p
            style={{ opacity: ledeAOpacity, gridArea: "1 / 1" }}
            className="text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
          >
            {LEDE.split(" ").map((word, i) => (
              <React.Fragment key={`${word}-${i}`}>
                <span
                  className="dp-word"
                  style={{ animationDelay: `${(1.0 + i * 0.026).toFixed(3)}s` }}
                >
                  {word}
                </span>{" "}
              </React.Fragment>
            ))}
          </motion.p>
          {/* Hidden from assistive technology: it is the same message the
              first paragraph and the services row already carry, and a screen
              reader has no scroll position to make the swap meaningful. */}
          <motion.p
            aria-hidden="true"
            style={{ opacity: ledeBOpacity, gridArea: "1 / 1" }}
            className="text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
          >
            {LEDE_LANDED}
          </motion.p>
        </div>
      )}
    </>
  );
}

/**
 * A word that types, holds, and erases, and DRIVES THE FIELD while it does.
 *
 * AN EXPLICIT PHASE, NOT AN INFERRED ONE. The first version worked out whether
 * it was deleting by asking whether the target word still started with the
 * text on screen. It does: deleting one character from "Professionals." leaves
 * "Professionals", which the target still starts with, so the next tick typed
 * the character straight back and the word oscillated forever. Deleting is a
 * state the component is IN, so it is stored.
 */
function FlipWord({
  words,
  reduced,
  wave,
}: {
  words: string[];
  reduced: boolean;
  /** The field behind the headline. Word starts typing = sweep, word commits
      = resolve, word starts deleting = release. See WaveSearchApi. */
  wave: React.MutableRefObject<WaveSearchApi | null>;
}) {
  const [i, setI] = React.useState(0);
  const [typed, setTyped] = React.useState(words[0]);
  const [deleting, setDeleting] = React.useState(false);
  const [caret, setCaret] = React.useState(true);

  /* One timer, re-armed with a different delay each tick, rather than an
     interval per phase. A typewriter is a sequence of unequal waits: fast
     while deleting, slower while typing, and a long hold on the finished word.
     Three intervals racing each other is how this effect usually ends up
     dropping or doubling a character. */
  React.useEffect(() => {
    if (reduced) return;
    const full = words[i];
    let t: ReturnType<typeof setTimeout>;

    if (!deleting && typed === full) {
      /* Finished. The search behind the headline closes on its one candidate
         the moment the word commits, and both hold together. */
      wave.current?.resolve();
      t = setTimeout(() => {
        /* Released first, so the field lets go as the erasing starts rather
           than holding a resolved seat behind a word that is disappearing. */
        wave.current?.release();
        setDeleting(true);
      }, 2100);
    } else if (deleting && typed.length > 0) {
      /* Backspacing is faster than typing, which is how a real one behaves
         and what keeps the hold the thing you notice rather than the erase. */
      t = setTimeout(() => setTyped(typed.slice(0, -1)), 34);
    } else if (deleting) {
      t = setTimeout(() => {
        /* A new word, a new search: the sweep crosses the field while the
           word types, so the two finish together. Seeded by the word, so each
           one resolves somewhere of its own. Fired outside the state updater,
           which React is allowed to run twice. */
        const next = (i + 1) % words.length;
        wave.current?.search(next + 2);
        setDeleting(false);
        setI(next);
      }, 120);
    } else {
      t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 62);
    }
    return () => clearTimeout(t);
  }, [typed, i, deleting, words, reduced, wave]);

  /* The caret blinks on its own clock and never stops. A caret that only
     blinks while idle reads as a bug the moment the two rhythms drift. */
  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setCaret((c) => !c), 530);
    return () => clearInterval(id);
  }, [reduced]);

  if (reduced) {
    return <span className="text-[var(--v-ring)]">{words[words.length - 1]}</span>;
  }

  return (
    /* The slot is held open by a hidden copy of the longest word, so the line
       never reflows as the text grows and shrinks. Without it the headline
       above jitters on every keystroke. */
    <span className="relative inline-block align-bottom">
      <span aria-hidden="true" className="invisible block">
        {words[0]}
      </span>
      {/* Announced once per word, not once per character: a live region on
          the typing text would read the word out letter by letter. */}
      <span className="sr-only">{words[i]}</span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 whitespace-nowrap text-[var(--v-ring)]"
      >
        {typed}
        <span
          className="ml-[0.06em] inline-block w-[0.055em] -translate-y-[0.06em] align-middle bg-[var(--v-ring)]"
          style={{ height: "0.86em", opacity: caret ? 1 : 0 }}
        />
      </span>
    </span>
  );
}

/**
 * What the dive lands on.
 *
 * IT USED TO BE A HAIRLINE ROW OF FOUR WORDS, and that left the bottom of the
 * scrub showing seventy percent bare screen: the visitor scrolled two and a
 * half viewports and arrived at almost nothing, which makes the whole descent
 * feel like it was for its own sake. A transformation has to deliver something.
 *
 * So the landing is the firm's four ways in, each with the line site.ts
 * already carries for it, over a rule. Nothing invented, nothing duplicated in
 * a new form: this is the same set the thin row linked to, given the room to
 * actually be read, which is what the space was for.
 */
function Tail() {
  return (
    <div data-tail className="border-t border-white/15 pt-8">
      {/* Two up and note-less on a phone. Four stacked entries with a line of
          copy each is over five hundred pixels, which does not fit inside a
          pinned one-screen frame however the type above it behaves. */}
      <ul className="grid grid-cols-2 gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-7 lg:grid-cols-4">
        {SERVICES.slice(0, 4).map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
            >
              <span className="flex items-center gap-2 text-[length:var(--t-small)] font-semibold text-white sm:text-[length:var(--t-action)]">
                {s.label}
                <ArrowRight
                  size={15}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="text-white/45 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-white"
                />
              </span>
              {s.note && (
                <span className="mt-2 hidden max-w-[26ch] text-[length:var(--t-small)] leading-[1.55] text-[var(--v-muted)] sm:block">
                  {s.note}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Left aligned on a phone, and that is a collision fix rather than a
          preference: the assistant button is fixed in the bottom right corner
          of every page, and measured at 375x667 this call to action sat
          underneath it. Nothing may claim that corner on a narrow screen. */}
      {/* WIDE SCREENS ONLY, and it is a fit problem before it is a taste one.
          Measured at 375x667: the pinned frame is one screen, the type block
          and four service links already fill it, and this row pushed the call
          to action to y=653 on a 667px screen, straight under the assistant
          button that is fixed in that corner on every page (its pill runs
          169..351 across, so left-aligning does not clear it either).

          Cutting it on a phone costs nothing. "Get Started" is in the header
          at every scroll position, and the four services underneath are the
          payoff this descent was built to deliver. */}
      {/* LEFT, NOT RIGHT, AND THAT IS THE SAME COLLISION AGAIN ONE BREAKPOINT
          UP. The assistant button is fixed in the bottom right corner of every
          page and its pill is 182px wide; right-aligned, this link ran under it
          at 1440x900 as well, not just on a phone. There is nothing on the left
          of this row, so the corner the button owns is simply not contested. */}
      <div className="mt-9 hidden flex-wrap items-center gap-4 border-t border-white/10 pt-6 sm:flex">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2.5 text-[length:var(--t-action)] font-semibold text-white transition-colors duration-200 hover:text-[var(--v-ring)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
        >
          Start a conversation
          <ArrowRight
            size={17}
            strokeWidth={2.2}
            aria-hidden="true"
            className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
