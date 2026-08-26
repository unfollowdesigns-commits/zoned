"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
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
const LEDE =
  "When the talent decisions are as consequential as the capital decisions, you need more than a search firm. We design talent strategy from the boardroom down, and execute from day one.";

export default function CinematicHero() {
  const reduced = useReducedMotion();
  /* The channel from the typewriter to the field. See WaveSearchApi. */
  const waveApi = React.useRef<WaveSearchApi | null>(null);

  return (
    /* svh, not vh: on a phone the URL bar makes 100vh taller than the screen,
       and a hero that is one screen must actually be one screen. */
    <section className="relative h-svh min-h-[560px] overflow-hidden">
      {/* The stage. Behind everything, driven by the headline. Under reduced
          motion it draws one static frame and the search verbs are no-ops:
          that visitor gets the surface without the performance. */}
      <ParticleWave opacity={0.9} searchApi={waveApi} />

      {/* A foot of shade, so the tail row always has quiet ground. The field
          runs out of the bottom of the frame and is at its nearest and
          sparsest there; the shade also settles that edge against the next
          section. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[34vh] bg-[linear-gradient(180deg,transparent_0%,rgba(5,7,15,0.72)_100%)]"
      />

      <div className="relative mx-auto flex h-full max-w-[1280px] flex-col px-6 pt-[13vh]">
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

        <p className="mt-8 max-w-[52ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]">
          {reduced
            ? LEDE
            : LEDE.split(" ").map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                  <span
                    className="dp-word"
                    style={{ animationDelay: `${(1.0 + i * 0.026).toFixed(3)}s` }}
                  >
                    {word}
                  </span>{" "}
                </React.Fragment>
              ))}
        </p>

        {/* The supporting row sits at the foot from the first frame. It used
            to arrive at the end of the scroll scrub; with no scrub there is no
            end, and a visitor should never have to earn the way into the
            services. */}
        <div className="mt-auto pb-12">
          <Tail />
        </div>
      </div>
    </section>
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

/** The supporting row at the foot of the hero. */
function Tail() {
  return (
    <div className="flex flex-col gap-6 border-t border-white/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
      <ul className="flex flex-wrap gap-x-7 gap-y-2">
        {SERVICES.slice(0, 4).map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="text-[length:var(--t-small)] text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--v-ring)]"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
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
  );
}
