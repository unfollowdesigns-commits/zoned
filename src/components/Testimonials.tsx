"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReducedMotion } from "@/lib/motion";
import { TESTIMONIALS, type Testimonial } from "@/lib/proof";

/**
 * The testimonial carousel.
 *
 * TWO PARTS OF THE BRIEF CONTRADICTED EACH OTHER AND ONLY ONE CAN BE BUILT.
 * A continuous auto-scrolling marquee is driven by TIME; a sticky 300vh scene
 * whose properties interpolate across scroll progress is driven by SCROLL.
 * Those are two different instruments and a component cannot be both: either
 * the cards move on their own or they move when you do.
 *
 * This is the marquee, and the reason is structural rather than aesthetic. The
 * homepage was measured section by section: the hero is 3240px and the service
 * stack 2441px, so 58 percent of it is already two pinned showpieces and every
 * section carrying an argument is a thin strip beside them. A third 300vh
 * pinned scene would make the page's worst quality worse. The marquee says the
 * same thing in about 600px.
 *
 * NOTHING IS MEASURED PER FRAME. Cards are a uniform width, so a card's centre
 * is arithmetic on the track offset rather than a `getBoundingClientRect` on
 * every card on every tick. That is the difference between a carousel that
 * stays smooth under load and one that fights the rest of the page for layout;
 * this site already paid for that lesson once, in the hero.
 *
 * IT RENDERS NOTHING WHILE THERE IS NOTHING TO RENDER. See lib/proof.ts. A
 * carousel of invented quotes is fabricated evidence, and a visible empty state
 * tells every visitor that no client would give one.
 */

const GAP = 20;
/** Catch-up rate per second for the eased offset. See the note in the loop. */
const SMOOTH = 7;

export default function Testimonials({
  items = TESTIMONIALS,
  heading = true,
}: {
  items?: Testimonial[];
  /** Off for previews that supply their own frame. */
  heading?: boolean;
}) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLElement | null>>([]);
  const nudge = React.useRef<(dir: 1 | -1) => void>(() => {});
  const [paused, setPaused] = React.useState(false);

  const count = items.length;
  /* Doubled so the track can wrap without a seam. Tripled when there are very
     few, because two copies of three cards is not wide enough to fill a desktop
     viewport and the loop point becomes visible as a gap. */
  const reps = count === 0 ? 0 : count < 5 ? 3 : 2;
  const loop = React.useMemo(
    () => Array.from({ length: reps }, () => items).flat(),
    [items, reps],
  );

  React.useEffect(() => {
    if (count === 0 || reduced) return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const root = rootRef.current;
    if (!viewport || !track || !root) return;

    let cardW = 0;
    let step = 0;
    let span = 0;
    let vw = 0;
    let current = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    let hovered = false;

    function measure() {
      vw = viewport!.clientWidth;
      /* Nearly full width on a phone with a sliver of the next card showing, so
         it is obvious the row continues. On desktop under half the viewport, so
         both neighbours are visible and the centre card has something to be the
         centre OF. */
      cardW = vw < 640 ? Math.min(vw - 56, 420) : Math.min(vw * 0.42, 460);
      step = cardW + GAP;
      span = step * count;
      track!.style.setProperty("--card-w", `${cardW}px`);
    }

    function paint() {
      /* The centre of the viewport, in track coordinates. */
      const focus = -current + vw / 2;
      for (let i = 0; i < loop.length; i += 1) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const centre = i * step + cardW / 2;
        const d = Math.abs(centre - focus) / step;
        /* Continuous, not a binary active class. A card is never "the active
           one": it is however close to the centre it happens to be, and every
           property follows that distance without a threshold to snap across. */
        const k = Math.max(0, 1 - d);
        const scale = 0.9 + k * 0.1;
        const op = 0.32 + k * 0.68;
        el.style.transform = `translate3d(${i * step}px,0,0) scale(${scale.toFixed(4)})`;
        el.style.opacity = op.toFixed(3);
        el.style.setProperty("--focus", k.toFixed(3));
      }
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;

      if (!hovered) target -= 34 * dt;

      /* Framerate independent, for the same reason as the hero scrub: a
         per-frame fraction converges twice as fast on a 120Hz display, so the
         feel of the carousel would be a property of the panel rather than a
         decision. */
      current += (target - current) * (1 - Math.exp(-SMOOTH * dt));

      /* Both values wrap together, so the eased gap between them survives the
         seam. Wrapping only `current` makes the track lurch a full span at the
         loop point, which is the classic visible jump in this pattern. */
      if (current <= -span) {
        current += span;
        target += span;
      } else if (current > 0) {
        current -= span;
        target -= span;
      }

      track!.style.transform = `translate3d(${current}px,0,0)`;
      paint();
      raf = requestAnimationFrame(frame);
    }

    /* MINUS, NOT PLUS. The idle drift is `target -= 34 * dt`, so falling
       target is the row advancing: the next quote arrives from the right. An
       arrow labelled Next therefore has to move target the same way the clock
       does, or the control and the animation disagree about which way forward
       is and the button walks back through quotes already read. */
    nudge.current = (dir) => {
      target -= dir * step;
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      paint();
    });
    ro.observe(viewport);

    const onEnter = () => {
      hovered = true;
      setPaused(true);
    };
    const onLeave = () => {
      hovered = false;
      setPaused(false);
    };
    /* THE ROOT, NOT THE VIEWPORT, AND THE ARROWS ARE THE REASON. Pausing only
       over the cards means the row is still drifting while you are aiming at
       Next, so each click lands one step onto a moving target and the second
       click is fighting the clock. Reaching for the control is already the
       signal that someone wants to drive. */
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    /* Focus counts as hover. Tabbing into a card while the row keeps sliding
       moves the thing under the keyboard, which is the version of this control
       that cannot be used without a mouse. */
    root.addEventListener("focusin", onEnter);
    root.addEventListener("focusout", onLeave);

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      viewport.removeEventListener("pointerenter", onEnter);
      viewport.removeEventListener("pointerleave", onLeave);
      viewport.removeEventListener("focusin", onEnter);
      viewport.removeEventListener("focusout", onLeave);
    };
  }, [count, loop.length, reduced]);

  if (count === 0) return null;

  /* REDUCED MOTION GETS A GRID, NOT A FROZEN CAROUSEL. The cards are absolutely
     positioned and laid out by the transform the loop writes, so bailing out of
     the effect and rendering the same markup would stack every card on top of
     the others at the left edge. An accessibility branch that produces a broken
     layout is worse than no branch, and it is invisible in testing unless you
     actually turn the preference on. */
  if (reduced) {
    return (
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          {heading && (
            <SectionHeading
              eyebrow="In their words"
              title="What it is like"
              turn="to work with us."
            />
          )}
          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {items.map((t) => (
              <li
                key={`${t.company}-${t.name}`}
                className="rounded-[20px] bg-white p-8 ring-1 ring-inset ring-[var(--v-ink)]/[0.08]"
              >
                <blockquote className="v-serif text-[length:var(--t-lede)] leading-[1.5] text-[var(--v-ink)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-[length:var(--t-small)] font-semibold text-[var(--v-ink)]">
                  {t.name}
                </p>
                <p className="text-[length:var(--t-small)] text-[var(--v-muted)]">
                  {t.title}, {t.company}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </LightBand>
    );
  }

  const body = (
    <div ref={rootRef}>
      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        /* The row dissolves at both edges instead of being cut. A carousel that
           stops dead at the viewport edge announces the boundary; one that fades
           reads as a row continuing past the frame. */
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          className="relative h-[330px] will-change-transform"
          style={{ ["--card-w" as string]: "420px" }}
        >
          {loop.map((t, i) => (
            <figure
              key={`${t.company}-${t.name}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              /* Duplicates exist only to make the loop seamless, so everything
                 past the first pass is hidden from assistive technology and the
                 real list is stated once below. */
              aria-hidden={i >= count ? "true" : undefined}
              className="absolute left-0 top-0 flex h-full w-[var(--card-w)] flex-col justify-between rounded-[20px] bg-white p-8 ring-1 ring-inset ring-[var(--v-ink)]/[0.08] shadow-[0_20px_60px_-30px_rgba(18,21,31,0.28)]"
              style={{ transformOrigin: "50% 50%", willChange: "transform, opacity" }}
            >
              <blockquote className="v-serif text-[length:var(--t-lede)] leading-[1.5] text-[var(--v-ink)]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-4">
                {t.photo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/testimonials/${t.photo}`}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[length:var(--t-small)] font-semibold text-[var(--v-ink)]">
                    {t.name}
                  </p>
                  <p className="truncate text-[length:var(--t-small)] text-[var(--v-muted)]">
                    {t.title}, {t.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* ---- Controls ------------------------------------------------------ */}
      <div className="mt-10 flex items-center gap-3">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => nudge.current(dir)}
            aria-label={dir === -1 ? "Previous testimonial" : "Next testimonial"}
            className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-inset ring-[var(--v-ink)]/[0.14] text-[var(--v-ink)] transition-[background-color,box-shadow] duration-200 hover:bg-[var(--v-ink)]/[0.05] hover:ring-[var(--v-primary)]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ring)]"
          >
            {dir === -1 ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
          </button>
        ))}
        <span className="sr-only" aria-live="polite">
          {paused ? "Carousel paused" : "Carousel playing"}
        </span>
      </div>

      {/* The moving row is decorative to a screen reader, so the quotes are
          stated once, in order, for anything not watching it. */}
      <ul className="sr-only">
        {items.map((t) => (
          <li key={`${t.company}-${t.name}`}>
            {t.quote} {t.name}, {t.title}, {t.company}
          </li>
        ))}
      </ul>
    </div>
  );

  if (!heading) return body;

  return (
    <LightBand>
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
        <SectionHeading
          eyebrow="In their words"
          title="What it is like"
          turn="to work with us."
        />
        <div className="mt-14">{body}</div>
      </div>
    </LightBand>
  );
}
