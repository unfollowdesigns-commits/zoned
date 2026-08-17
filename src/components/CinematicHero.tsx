"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import { SERVICES } from "@/lib/site";

/**
 * Scroll-scrubbed hero: a framed card that physically expands to fill the
 * viewport, with the headline travelling into it as it opens.
 *
 * PINNING IS `position: sticky`, NOT JAVASCRIPT. A tall outer wrapper supplies
 * the scroll length and an inner `sticky top-0 h-screen` element holds while
 * that length is consumed. The compositor drives the pin straight from scroll
 * position, so it cannot desync or jitter. A JS pin writing transforms on every
 * scroll event draws the same picture one frame late, and that single frame is
 * the whole difference between a section that feels expensive and one that
 * feels heavy.
 *
 * THE GROUND IS SET IN HEX, NOT FROM A TOKEN, AND THE CONTAINER MUST NOT CARRY
 * `.v-light`. Two bugs in a row here, both worth keeping written down.
 *
 * First, `--v-cream` is declared inside the `.v-light` rule, so it does not
 * exist outside that scope. Reading it here resolved to nothing, the dark page
 * showed through, and the headline, correctly ink-coloured for a light ground,
 * became a black smear on black.
 *
 * The obvious fix, adding `.v-light` to this container, broke the pin instead:
 * that rule declares `position: relative`, and the kit stylesheet is imported
 * after Tailwind, so it beats `sticky` at equal specificity and the section
 * simply scrolled away. Measured, the card was 2275px above the viewport at the
 * end of the scrub. This is the third time in the project that a kit class
 * carrying `position` has silently overridden a Tailwind positioning utility;
 * the rule is that they never go on the same element.
 *
 * So: no `.v-light` here, and every colour this section needs is stated
 * literally. It depends on no token being in scope.
 *
 * Depends on `overflow-x: clip` rather than `hidden` on html and body. `hidden`
 * on any ancestor silently demotes every descendant sticky to relative, with no
 * error at all. The tokens file sets `clip` for exactly this reason.
 *
 * EVERYTHING IS A PURE FUNCTION OF ONE NORMALIZED PROGRESS VALUE. 0 is the
 * contained card, 1 is edge to edge. Nothing holds state of its own, so no
 * property can drift out of step with another and scrubbing backwards is exact
 * rather than approximate.
 *
 * THE SCRUB IS EASED, NOT LINEAR, AND NOT SPRUNG. Linear mapping is what makes
 * a scroll animation feel mechanical: the card opens at a constant rate and
 * arrives without weight. Every property below is eased through the same curve,
 * so the expansion starts slowly, gathers, and settles. A spring would be the
 * opposite mistake: a spring on a scrubbed value lags the wheel and overshoots
 * on reversal, which reads as the page disagreeing with the person scrolling.
 * Scrubbed motion has to be exact AND shaped, which is what an eased map is.
 *
 * Width, height and radius are interpolated directly rather than faked with a
 * clip path. The honest trade is that this runs layout and paint each frame
 * where a clip would composite; it is taken deliberately, because a growing box
 * re-crops its own `cover` image as it opens and a clip cannot. That re-crop is
 * what sells the card as a window physically widening rather than a mask
 * sliding over a fixed picture. It is one element, on one screen, with
 * `will-change` declared, which is where that cost is affordable.
 */

/** Drop a real photograph here and the section is finished. */
const HERO_IMAGE = "/hero.jpg";

/* easeInOutCubic. Used for every interpolation in the section so the whole
   transformation reads as one move rather than several.
   
   The first attempt here was a hard ease-out, cubicBezier(0.32, 0.72, 0, 1),
   which is the right curve for something ARRIVING under its own power and the
   wrong one for a scrub. Measured, it put the card at 94 percent of full width
   by a quarter of the way through and effectively finished it by half, leaving
   the back sixty percent of a 360vh section with nothing happening in it. That
   is worse than a linear map, not better: the visitor keeps scrolling and the
   page has stopped responding.
   
   A symmetric in-out curve distributes the change across the whole scroll
   instead, so it eases off the start, moves through the middle, and settles into
   the end. Shaped, but still spread. */
const SCRUB = cubicBezier(0.65, 0, 0.35, 1);

/**
 * The card's resting size, in viewport units, per breakpoint.
 *
 * A phone needs a proportionally larger card. At 74vw the resting state on a
 * 390px screen is a 289px-wide card, which reads as a thumbnail rather than as
 * a hero being framed, and the expansion afterwards has nothing to be a
 * transformation OF. The radius scales with it for the same reason: 34px on a
 * card that size is a pill.
 */
const REST = {
  /* `top` is the card's distance from the top of the viewport at rest, and it
     exists because centring the card was the bug. A 64vh card centred spans
     18vh to 82vh, and the headline above it lands between 13vh and 32vh, so the
     two occupied the same band and the type sat across the card's corner. The
     card is anchored from the top instead and starts below the headline. It is
     also shorter at rest, because a card that starts nearly full height has
     very little expanding left to do. */
  mobile: { w: 88, h: 44, top: 42, radius: 22 },
  desktop: { w: 72, h: 52, top: 36, radius: 34 },
};

function useRest() {
  const [rest, setRest] = React.useState(REST.desktop);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setRest(mq.matches ? REST.desktop : REST.mobile);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return rest;
}

/**
 * An echoed card behind the primary one, collapsing into it as the scroll opens.
 *
 * Scale and opacity only, both eased on the same curve as the card. The echoes
 * are finished well before the card reaches the edges: a layer still visible at
 * seventy percent reads as a seam rather than as depth.
 */
function Echo({
  progress,
  depth,
  rest,
}: {
  progress: MotionValue<number>;
  /** 1 is the layer immediately behind the card, 2 the one behind that. */
  depth: number;
  rest: { w: number; h: number; top: number; radius: number };
}) {
  const end = 0.32;
  const opts = { ease: SCRUB } as const;

  const scale = useTransform(progress, [0, end], [1 - depth * 0.05, 1], opts);
  const y = useTransform(progress, [0, end], [depth * 26, 0], opts);
  const opacity = useTransform(progress, [0, end * 0.85], [0.55 - depth * 0.2, 0], opts);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 border border-[rgba(18,21,31,0.10)] bg-[#e9e5da]"
      style={{
        top: `${rest.top}vh`,
        width: `${rest.w}vw`,
        height: `${rest.h}vh`,
        borderRadius: rest.radius,
        x: "-50%",
        y,
        scale,
        opacity,
        willChange: "transform, opacity",
      }}
    />
  );
}

export default function CinematicHero() {
  const wrap = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rest = useRest();

  /* `start start` to `end end`: progress reaches exactly 1 on the frame the pin
     releases, so the transformation finishes as the section lets go and there is
     no dead scroll at either end of it. */
  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });

  const opts = { ease: SCRUB } as const;

  /* ---- Geometry: the card growing to the edges ------------------------- */
  const w = useTransform(scrollYProgress, [0, 0.86], [rest.w, 100], opts);
  const h = useTransform(scrollYProgress, [0, 0.86], [rest.h, 100], opts);
  /* The card rises to the top of the viewport as it grows, so it opens upward
     and outward from where it sat rather than inflating around a fixed centre. */
  const t = useTransform(scrollYProgress, [0, 0.86], [rest.top, 0], opts);
  const radius = useTransform(scrollYProgress, [0, 0.8], [rest.radius, 0], opts);
  const width = useMotionTemplate`${w}vw`;
  const height = useMotionTemplate`${h}vh`;
  const top = useMotionTemplate`${t}vh`;

  /* ---- The image inside it -------------------------------------------- */
  /* Over-scaled at rest and settling to 1, so the photograph is always being
     pushed outward slightly faster than its frame. Two rates rather than one is
     what makes the opening read as physical. */
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.18, 1], opts);
  const imageY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"], opts);

  /* ---- Typography ------------------------------------------------------ */
  /* The headline starts above the card in ink on the light ground, travels down
     into the image, and turns white. One element rather than two cross-fading:
     a cross-fade double-strikes the letterforms through the middle of the
     handover, and at this size that is glaring. The colour is interpolated so
     it flips exactly where the image edge passes under the text. */
  const titleY = useTransform(scrollYProgress, [0, 0.74], ["0vh", "52vh"], opts);
  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.46],
    ["#12151f", "#12151f", "#ffffff"],
  );
  const titleScale = useTransform(scrollYProgress, [0, 0.74], [0.96, 1], opts);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0], opts);

  /* ---- Supporting content --------------------------------------------- */
  /* Arrives only in the last quarter, once the image is effectively full bleed.
     Anything earlier competes with the transformation that is the point. */
  const tailOpacity = useTransform(scrollYProgress, [0.76, 0.96], [0, 1], opts);
  const tailY = useTransform(scrollYProgress, [0.76, 0.96], [22, 0], opts);

  /* No scroll length, no pin, no scrub under reduced motion: the section
     renders its finished state once, at viewport height. Animating nothing is
     correct here. Animating the same thing faster is not. */
  if (reduced) {
    return (
      <section className="relative h-screen overflow-hidden bg-[#f2efe7]">
        <Photo />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1280px] px-6 pb-14">
          <h1
            className="v-display mb-10 max-w-[18ch] text-balance text-white"
            style={{
              fontSize: "var(--t-hero)",
              lineHeight: "var(--lh-hero)",
              letterSpacing: "var(--tr-hero)",
            }}
          >
            Our talent is finding yours.
          </h1>
          <Tail />
        </div>
      </section>
    );
  }

  return (
    /* 360vh. The transformation has five things happening in it, and at 200vh
       they all land inside one flick of a trackpad. Long enough to be watched,
       short enough that nobody is scrolling through a section that has already
       finished. */
    <div ref={wrap} className="relative h-[360vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#f2efe7]">
        {/* Echoes first, so they sit behind the card. Furthest back drawn first. */}
        <Echo progress={scrollYProgress} depth={2} rest={rest} />
        <Echo progress={scrollYProgress} depth={1} rest={rest} />

        {/* The card. Centred, growing to the viewport on both axes. */}
        <motion.div
          className="absolute left-1/2 overflow-hidden"
          style={{
            top,
            width,
            height,
            borderRadius: radius,
            x: "-50%",
            willChange: "width, height, top, border-radius",
          }}
        >
          <Photo y={imageY} scale={imageScale} />
        </motion.div>

        {/* Type sits above the card and is not clipped by it. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-6 pt-[11vh]">
            <motion.p
              className="v-eyebrow text-[var(--v-primary-deep)]"
              style={{ opacity: eyebrowOpacity }}
            >
              Talent Infrastructure
            </motion.p>

            <motion.h1
              className="v-display mt-7 max-w-[18ch] text-balance"
              style={{
                y: titleY,
                scale: titleScale,
                color: titleColor,
                transformOrigin: "0% 50%",
                fontSize: "var(--t-hero)",
                lineHeight: "var(--lh-hero)",
                letterSpacing: "var(--tr-hero)",
                willChange: "transform",
              }}
            >
              Our talent is finding yours.
            </motion.h1>
          </div>

          <motion.div
            className="pointer-events-auto absolute inset-x-0 bottom-0 mx-auto max-w-[1280px] px-6 pb-14"
            style={{ opacity: tailOpacity, y: tailY }}
          >
            <Tail />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * The photograph, treated.
 *
 * Desaturated and tinted to the brand hue, so a raw file dropped in still lands
 * on-palette. With no file present the tinted ground shows through instead,
 * which is a finished surface rather than a broken image, and the whole
 * choreography still reads while the real photograph is being sourced.
 */
function Photo({
  y,
  scale,
}: {
  y?: MotionValue<string>;
  scale?: MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ y, scale, willChange: "transform" }}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(155deg,#1b2438_0%,#101728_52%,#0a0e1b_100%)]"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center 28%",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-color"
        style={{ background: "var(--v-primary)", opacity: 0.24 }}
      />
      {/* A foot of shade, so white type at the bottom always has something to
          sit on whatever the photograph is doing there. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,rgba(6,8,20,0.74)_100%)]"
      />
    </motion.div>
  );
}

/** The supporting row that arrives at the end of the scrub. */
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
