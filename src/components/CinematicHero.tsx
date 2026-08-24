"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import {
  AnimatePresence,
  cubicBezier,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";
import NetworkField from "@/components/NetworkField";
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

/* The footage that lives inside the card. Third-party CDN for now; self-host it
   at /hero.mp4 before launch so the hero's largest asset is not on a host
   nobody here controls. */
const VIDEO_SRC =
  "https://cdn.sceneai.art/Hero%20Section%20Video/973fa3f6-7715-4e73-9cfd-100ee86285b5.mp4";

const HEADLINE = "Our talent is finding";
/* Longest first: the slot is sized by measuring this one. */
const ROTATING = ["Professionals.", "Executives.", "Operators.", "Yours."];
const LEDE =
  "When the talent decisions are as consequential as the capital decisions, you need more than a search firm. We design talent strategy from the boardroom down, and execute from day one.";

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

/* EVERY EASED RANGE BELOW ENDS WITH A HOLD POINT AT 1, and that is a
   correctness fix rather than a style.

   `useTransform` with a custom `ease` does not clamp the normalized input
   before running the easing function. Given a range of [0, 0.16] and a scroll
   progress of 1, the bezier is solved at t = 6.25, where it returns close to
   zero again, so the mix comes back to its STARTING value. Measured: the
   eyebrow and the lede faded correctly to 0.31 and 0.17 halfway through the
   scrub and were both back at full opacity by the end, sitting on top of the
   fullscreen video.

   Writing each range as [0, x, 1] with the final output repeated keeps the
   mapping monotonic past x, so a value that has finished stays finished. */

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
  /* `top` is the card's distance from the top of the viewport at rest.
  
     MEASURED, TWICE, BECAUSE GUESSING AT IT WAS WRONG BOTH TIMES. Centring the
     card put it across the headline. Anchoring it at 36vh then put its top edge
     at 389px while the lede still ran to 488px, so the paragraph lay over the
     card's top-left corner from the very first frame, which is what "the text
     placement is wrong" was.
  
     The type block ends around 49vh on a 900px viewport, so the card starts at
     56vh with real air between them and nothing can overlap at rest. It is also
     deliberately small: a card that begins at half the screen has very little
     expanding left to do, and the transformation is the entire point of the
     section. 40vh to 100vh is a change worth scrolling for. */
  mobile: { w: 90, h: 30, top: 60, radius: 20 },
  desktop: { w: 66, h: 40, top: 56, radius: 28 },
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

  const scale = useTransform(progress, [0, end, 1], [1 - depth * 0.05, 1, 1], opts);
  const y = useTransform(progress, [0, end, 1], [depth * 26, 0, 0], opts);
  const opacity = useTransform(progress, [0, end * 0.85, 1], [0.55 - depth * 0.2, 0, 0], opts);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 border border-white/[0.07] bg-white/[0.035]"
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

  /* ---- Geometry: the card growing to the edges -------------------------
  
     The expansion runs to 0.94, not 0.86. Measured against the wrapper's real
     bounds, the earlier end put the card at 1438 of 1440px by four fifths of
     the way through, so the last fifth of a 360vh section had nothing left to
     do and the visitor was scrolling a section that had already finished. The
     rim and the shadow follow it out on the same schedule, and only the
     supporting row is left to arrive after that. */
  /* THE CARD IS CLIPPED OPEN, NOT RESIZED, AND THAT IS A CORRECTNESS FIX.

     This used to animate `width`, `height` and `top`. Those are layout
     properties: every scroll frame re-ran layout for the card and everything
     inside it, which is the video, the tint, the shade gradient and the rim.
     Measured, the homepage scored 0.39 cumulative layout shift and every event
     came from this element, while /the-dp-difference and /resources/blog, which
     have the same reveals, glow and gradients but no hero, both scored exactly
     zero. It was this, on its own.

     A clip does the same picture without the cost. The element is always the
     full viewport and always laid out once; only the visible rectangle changes,
     which touches paint and compositing but never layout. `inset()` also takes
     a `round`, so the corner radius comes along for free instead of needing its
     own animated property.

     The rest state maps onto insets directly: the card sits `rest.top` from the
     top, so the bottom inset is whatever is left under it, and the side insets
     are half the width it is not using. */
  const clipTop = useTransform(scrollYProgress, [0, 0.94, 1], [rest.top, 0, 0], opts);
  const clipBottom = useTransform(
    scrollYProgress,
    [0, 0.94, 1],
    [100 - rest.top - rest.h, 0, 0],
    opts,
  );
  const clipSide = useTransform(
    scrollYProgress,
    [0, 0.94, 1],
    [(100 - rest.w) / 2, 0, 0],
    opts,
  );
  const radius = useTransform(scrollYProgress, [0, 0.9, 1], [rest.radius, 0, 0], opts);

  const cardClip = useMotionTemplate`inset(${clipTop}vh ${clipSide}vw ${clipBottom}vh ${clipSide}vw round ${radius}px)`;

  /* The rim is a second clip one pixel larger on every side, sitting behind the
     media, so a hairline of it shows around the opening.

     It has to be done this way. An inset box-shadow or a border is painted on
     the element's own border box, which here is the whole viewport, and the
     clip then throws that ring away. Two clips one pixel apart is the only way
     to draw an edge that follows a clipped shape without going back to
     animating the box itself. */
  const rimClip = useMotionTemplate`inset(calc(${clipTop}vh - 1px) calc(${clipSide}vw - 1px) calc(${clipBottom}vh - 1px) calc(${clipSide}vw - 1px) round ${radius}px)`;
  const rimOpacity = useTransform(scrollYProgress, [0, 0.88, 1], [1, 0, 0], opts);

  /* ---- The image inside it -------------------------------------------- */
  /* Over-scaled at rest and settling to 1, so the photograph is always being
     pushed outward slightly faster than its frame. Two rates rather than one is
     what makes the opening read as physical. */
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.18, 1], opts);
  const imageY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"], opts);

  /* ---- Typography ------------------------------------------------------ */
  /* The headline is white for the whole scrub, and the ground is dark rather
     than paper, which is the first hero's palette carried over. An ink headline
     travelling onto a dark image needs its colour interpolated mid-scroll; a
     white one on a dark ground never has that problem, and the section keeps
     one palette from top to bottom instead of two.
     
     It still travels down into the image as the card opens. Only the colour
     handover is gone. */
  const titleY = useTransform(scrollYProgress, [0, 0.74, 1], ["0vh", "52vh", "52vh"], opts);
  const titleScale = useTransform(scrollYProgress, [0, 0.74, 1], [0.96, 1, 1], opts);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.16, 1], [1, 0, 0], opts);
  /* The lede reads at rest and leaves as the card opens.
  
     It belongs at the top, not at the end: it is the sentence that explains why
     the headline matters, and a visitor who has to scroll a full section before
     getting it has already decided. So it sits under the headline where it is
     read first, then clears out slightly ahead of the card reaching it, because
     a paragraph still fading while an image slides under it reads as a
     collision rather than a hand-off. The services and the call to action
     arrive at the far end to take its place, so the frame is never empty. */
  /* The lede shares the headline's travel, and only its opacity is its own.
     Giving it a separate Y made the two pull apart the moment the scroll
     started, so the block came unglued: the headline moved down into the image
     while the paragraph slid up out of it. They are one block of type and they
     move as one. It fades a little later than the headline's own handover so
     the paragraph is gone before the image edge reaches it, which is the only
     part that needs to differ. */
  const ledeOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [1, 0, 0], opts);

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
      <section className="relative h-screen overflow-hidden">
        <Media />
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
          <p className="mb-10 max-w-[52ch] text-[length:var(--t-lede)] leading-[1.6] text-white/70">
            {LEDE}
          </p>
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
      {/* No background fill: the site's ambient layer (kit Atmosphere, mounted
            in the layout) shows through, so the hero shares the moving ground
            the rest of the page sits on rather than covering it with a flat
            colour. */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The wave field, back. It was removed when the hero was rebuilt by
            subtraction, and that was the wrong thing to cut: it is the site's
            ambient ground rather than an effect competing with the content, and
            without it the dark sections are flat colour. It sits behind the
            card, so the card opening over it is a real occlusion rather than a
            crossfade between two backgrounds. */}
        <NetworkField opacity={0.9} />
        {/* Echoes first, so they sit behind the card. Furthest back drawn first. */}
        <Echo progress={scrollYProgress} depth={2} rest={rest} />
        <Echo progress={scrollYProgress} depth={1} rest={rest} />

        {/* The rim, one pixel proud of the card on every side and behind it, so
            only a hairline shows.

            Without an edge the card is a dark rectangle on a dark ground and
            there is no object for the expansion to be an expansion OF: the
            section reads as a video fading up rather than as a frame opening.
            It has to leave, though. A border around a full-bleed hero is a
            mistake, so it fades out with the radius. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-white/20"
          style={{ clipPath: rimClip, WebkitClipPath: rimClip, opacity: rimOpacity }}
        />

        {/* The card. Always the full viewport, opened by its clip. */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: cardClip,
            WebkitClipPath: cardClip,
            /* `clip-path` only. Naming the old layout properties here would
               promote the layer for changes that no longer happen, and
               `will-change` on a property that is not animating is worse than
               omitting it: it costs the memory of a promoted layer and buys
               nothing. */
            willChange: "clip-path",
          }}
        >
          <Media y={imageY} scale={imageScale} />
        </motion.div>

        {/* Type sits above the card and is not clipped by it. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-6 pt-[11vh]">
            <motion.p
              className="v-eyebrow text-[var(--v-primary)]"
              style={{ opacity: eyebrowOpacity }}
            >
              Talent Infrastructure
            </motion.p>

            <motion.h1
              className="v-display mt-7 max-w-[18ch] text-balance text-white"
              style={{
                y: titleY,
                scale: titleScale,
                transformOrigin: "0% 50%",
                fontSize: "var(--t-hero)",
                lineHeight: "var(--lh-hero)",
                letterSpacing: "var(--tr-hero)",
                willChange: "transform",
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
                <FlipWord words={ROTATING} reduced={reduced} />
              </span>
            </motion.h1>

            <motion.p
              className="mt-8 max-w-[52ch] text-pretty text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-muted)]"
              style={{ opacity: ledeOpacity, y: titleY }}
            >
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
            </motion.p>
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
 * The footage, treated, sitting inside the card.
 *
 * This is the whole point of merging the two heroes: the video is not a
 * background behind the section, it is the CONTENT OF THE CARD, so scrolling
 * expands the frame the video already lives in. Two separate heroes, one with
 * a video ground and one with an expanding card, was a misreading of the brief
 * and gave the page two openings.
 *
 * Desaturated and tinted to the brand hue so the footage lands on-palette
 * whatever it happens to be, with a foot of shade so white type at the bottom
 * always has something to sit on.
 */
function Media({
  y,
  scale,
}: {
  y?: MotionValue<string>;
  scale?: MotionValue<number>;
}) {
  return (
    /* THE MEDIA LAYER IS OVERSIZED, AND IT HAS TO BE.

       This was `inset-0`, exactly the card's box, and then translated by the
       parallax. A layer that is precisely the size of its frame cannot be moved
       within that frame without uncovering the edge it moves away from: at the
       end of the scrub the translate is -3%, so on a 900px viewport the video
       sat from -27 to 873 and left a 27px strip of bare ground along the bottom
       of an otherwise full-bleed hero, right where it meets the next section.
       Measured, not guessed: card 0 to 900, video -27 to 873.

       Scale did not save it either. The scale runs 1.18 down to 1, so it is
       largest exactly where the translation is smallest and offers nothing at
       the end where the gap opens.

       5% against a travel of 3% leaves margin at both extremes, and the card
       clips the excess, so the only visible consequence is that the frame is
       cropped very slightly tighter. */
    <motion.div
      className="absolute bg-[linear-gradient(155deg,#1b2438_0%,#101728_52%,#0a0e1b_100%)]"
      style={{ inset: "-5%", y, scale, willChange: "transform" }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-color"
        style={{ background: "var(--v-primary)", opacity: 0.24 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,20,0.28)_0%,transparent_34%,rgba(6,8,20,0.74)_100%)]"
      />
    </motion.div>
  );
}

/**
 * A word that turns over on a real axis, rather than cross-fading.
 *
 * Both faces stay mounted through the change: AnimatePresence is deliberately
 * not in `mode="wait"`, because waiting leaves the slot empty for a frame and at
 * this size that is a visible stutter. Opacity moves faster than the rotation,
 * so a face is gone before it would be seen edge-on as a flat line. The slot is
 * held open by a hidden copy of the longest word, so the line never reflows.
 */
function FlipWord({ words, reduced }: { words: string[]; reduced: boolean }) {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length, reduced]);

  if (reduced) {
    return <span className="text-[var(--v-ring)]">{words[words.length - 1]}</span>;
  }

  return (
    <span
      className="relative inline-block align-bottom text-[var(--v-ring)]"
      style={{ perspective: "700px" }}
    >
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
            opacity: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
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
