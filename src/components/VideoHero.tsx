"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
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

/* Replace both with District Partners assets before launch. They are third
   party URLs from the brief, and the mockup in particular is a productivity
   dashboard, which is the wrong subject for a search firm: it should be the
   client's own work, a placement, or a team. */
const VIDEO_SRC =
  "https://cdn.sceneai.art/Hero%20Section%20Video/973fa3f6-7715-4e73-9cfd-100ee86285b5.mp4";
const MOCKUP_SRC =
  "https://cdn.sceneai.art/Hero%20section%20image/f818ffa9-3074-43cc-8ca5-953c97da9edd.png";

const HEADLINE = "Our talent is finding yours.";
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

      <div className="relative mx-auto max-w-[1400px] px-6 pb-0 pt-[clamp(7rem,14vh,11rem)]">
        <AnimatedText
          as="h1"
          reduced={reduced}
          text={HEADLINE}
          start={0.35}
          className="v-display max-w-[16ch] text-balance"
          style={{
            fontSize: "var(--t-hero)",
            lineHeight: "var(--lh-hero)",
            letterSpacing: "var(--tr-hero)",
          }}
        />

        <AnimatedText
          reduced={reduced}
          text={LEDE}
          start={1.05}
          step={0.028}
          className="mt-8 max-w-[54ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
        />

        {/* Buttons arrive as one block once the words have finished, not word by
            word: a control that assembles itself reads as broken rather than as
            choreographed. */}
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

        {/* The mockup, rounded on its top corners only so it reads as rising out
            of the fold rather than as a floating card. overflow-hidden is what
            makes the image respect those corners. */}
        <div
          className={
            reduced
              ? "mx-auto mt-[clamp(4rem,9vh,6.5rem)] w-full max-w-[1180px] overflow-hidden rounded-t-[24px] border border-white/10 bg-[var(--v-bg-2)] v-e3"
              : "dp-scale-in mx-auto mt-[clamp(4rem,9vh,6.5rem)] w-full max-w-[1180px] overflow-hidden rounded-t-[24px] border border-white/10 bg-[var(--v-bg-2)] v-e3"
          }
          style={reduced ? undefined : { animationDelay: "2.8s" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MOCKUP_SRC}
            alt=""
            aria-hidden="true"
            className="block h-auto w-full"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
