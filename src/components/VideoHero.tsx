"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion";

/**
 * Video hero with a four-second staggered entrance.
 *
 * The structure and choreography are taken from the supplied brief; the palette
 * and type are this site's. Every colour in that brief maps onto a token here
 * rather than being pasted in: the near-black ground becomes --v-bg, the purple
 * primary becomes the DP blue, the grey body text becomes --v-muted, the raised
 * chrome becomes --v-surface. Hard-coding another brand's hexes is how a site
 * ends up with two palettes fighting three sections apart.
 *
 * THE ENTRANCE IS CSS KEYFRAMES, NOT FRAMER, and that is the same reasoning as
 * the preloader. This runs on load, above the fold, before hydration has
 * necessarily finished. A Framer element renders at its `initial` values in the
 * server HTML, so an `initial` of opacity 0 would leave the headline invisible
 * until React catches up, which on a cold connection is most of the four
 * seconds the sequence is meant to occupy. CSS starts at first paint with no
 * JavaScript involved.
 *
 * Every animated element uses `animation-fill-mode: both`. The backwards fill
 * is what holds a word off-stage through its delay; without it every word
 * paints at full opacity first and then jumps to the start of its own
 * animation, which is a flash of the entire finished headline before it plays.
 */

/* The video stays. The dashboard mockup that came with it did not: that was a
   screenshot of somebody else's task-management product, complete with their
   logo and their invented users, which on a search firm's homepage reads as
   another company's product presented as this one's.
   
   Worth doing before launch, though not blocking: this is a third-party CDN, so
   the hero's largest asset is served from a host nobody here controls. If it
   moves or rate-limits, the hero loses its background. Self-hosting it at
   /hero.mp4 removes that dependency and lets it be compressed for the crop it
   is actually shown in. */
const VIDEO_SRC =
  "https://cdn.sceneai.art/Hero%20Section%20Video/973fa3f6-7715-4e73-9cfd-100ee86285b5.mp4";

const HEADLINE = "Our talent is finding";
/* Longest first: the slot is sized by measuring this one, so it must genuinely
   be the widest or the headline reflows mid-flip. */
const ROTATING = ["Professionals.", "Executives.", "Operators.", "Yours."];
const LEDE =
  "When the talent decisions are as consequential as the capital decisions, you need more than a search firm. We design talent strategy from the boardroom down.";

/**
 * Splits a string into words and animates each one in turn.
 *
 * Words, not characters: at hero size a per-character stagger takes long enough
 * that the sentence cannot be read while it plays, and a headline nobody can
 * read is a worse headline however good the effect is.
 *
 * The spaces are real spaces between spans rather than margins, so the sentence
 * still copies, still wraps naturally, and still reads correctly to a screen
 * reader as one string.
 */
function AnimatedText({
  text,
  className,
  style,
  as: Tag = "p",
  start = 0,
  step = 0.055,
  reduced,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "p";
  /** Seconds before the first word moves. */
  start?: number;
  /** Seconds between words. */
  step?: number;
  reduced: boolean;
}) {
  if (reduced) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={style}>
      {text.split(" ").map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            className="dp-word"
            style={{ animationDelay: `${(start + i * step).toFixed(3)}s` }}
          >
            {word}
          </span>
          {i < text.split(" ").length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/**
 * A word that turns over, on a real axis.
 *
 * NOT A CROSS-FADE. The version this replaces faded one word into another in
 * place, which is the carousel every generated landing page ships and reads as
 * a text effect rather than as a thing happening. This rotates about the
 * horizontal axis with perspective and a deep transform origin, so the outgoing
 * word turns away and the incoming one turns up behind it: two faces of the
 * same solid, not two images blended.
 *
 * Both words are mounted through the change. AnimatePresence is deliberately
 * NOT in `mode="wait"` here, because waiting leaves a frame with the slot empty
 * between exit and enter, and at this size an empty frame every few seconds is
 * a visible stutter in the headline.
 *
 * The slot is sized by a hidden copy of the longest word rather than by
 * whichever word is showing, so the line never reflows as it turns. Getting
 * this wrong is what makes rotating headlines jitter the text beside them.
 */
function FlipWord({ words, reduced }: { words: string[]; reduced: boolean }) {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    /* Starts after the entrance has finished. A word turning over while the
       sentence around it is still arriving reads as two animations colliding. */
    const kick = setTimeout(() => {
      const id = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
      timer.current = id;
    }, 2600);
    return () => {
      clearTimeout(kick);
      if (timer.current) clearInterval(timer.current);
    };
  }, [words.length, reduced]);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  if (reduced) {
    return <span className="text-[var(--v-ring)]">{words[words.length - 1]}</span>;
  }

  return (
    <span
      className="relative inline-block align-bottom text-[var(--v-ring)]"
      style={{ perspective: "700px" }}
    >
      {/* Invisible sizer: holds the slot open at the widest word. */}
      <span aria-hidden="true" className="invisible block">
        {words[0]}
      </span>
      <span className="sr-only">{words[i]}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={words[i]}
          aria-hidden="true"
          className="absolute left-0 top-0 whitespace-nowrap"
          style={{ transformOrigin: "50% 50% -0.55em", backfaceVisibility: "hidden" }}
          initial={{ rotateX: -92, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 92, opacity: 0 }}
          transition={{
            rotateX: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
            /* Opacity moves faster than the rotation, so the face is gone
               before it would otherwise be seen edge-on as a flat line. */
            opacity: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function VideoHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--v-bg)]">
      {/* The video sits at the very back and is never covered by a flat scrim.
          What keeps the type legible is a gradient that is opaque only where the
          words actually are, so the footage stays visible everywhere else. A
          full-surface overlay is the usual approach and it wastes the video. */}
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        /* Decorative: it carries no information the copy does not. */
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--v-bg)_0%,rgba(6,8,20,0.82)_38%,rgba(6,8,20,0.35)_68%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 pb-[clamp(7rem,16vh,12rem)] pt-[clamp(7rem,14vh,11rem)]">
        <h1
          className="v-display max-w-[16ch] text-balance"
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
                style={reduced ? undefined : { animationDelay: `${(0.35 + i * 0.055).toFixed(3)}s` }}
              >
                {word}
              </span>{" "}
            </React.Fragment>
          ))}
          {/* The turning word arrives with the rest, then starts rotating. */}
          <span
            className={reduced ? undefined : "dp-word"}
            style={reduced ? undefined : { animationDelay: "0.57s" }}
          >
            <FlipWord words={ROTATING} reduced={reduced} />
          </span>
        </h1>

        <AnimatedText
          reduced={reduced}
          text={LEDE}
          start={1.05}
          step={0.028}
          className="mt-8 max-w-[54ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
        />

        {/* Buttons arrive as one block once the words have finished, not word by
            word: a control that assembles itself reads as broken rather than as
            choreographed. They also close the section now that the borrowed
            mockup is gone, so the sequence ends on the thing worth clicking. */}
        <div
          className={reduced ? "mt-10 flex flex-wrap gap-4" : "dp-rise mt-10 flex flex-wrap gap-4"}
          style={reduced ? undefined : { animationDelay: "2.2s" }}
        >
          <Link
            href="/contact"
            className="v-lift v-e2 rounded-xl bg-[var(--v-primary)] px-8 py-3.5 text-[length:var(--t-action)] font-medium text-white hover:bg-[var(--v-primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
          >
            Get started
          </Link>
          <Link
            href="/what-we-do"
            className="v-lift v-e1 rounded-xl border border-white/10 bg-[var(--v-surface)] px-8 py-3.5 text-[length:var(--t-action)] font-medium text-white hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
          >
            How it works
          </Link>
        </div>

      </div>
    </section>
  );
}
