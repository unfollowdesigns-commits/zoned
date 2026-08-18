"use client";

import * as React from "react";
import { frameUrl, loadSequence, SequenceAborted } from "@/lib/frame-sequence";
import { useReducedMotion } from "@/lib/motion";

/**
 * A scroll-scrubbed frame sequence on a canvas: the Apple product-page effect.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY A CANVAS SEQUENCE AND NOT `video.currentTime`
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Scrubbing a `<video>` from scroll is the obvious implementation and it is the
 * wrong one, for three reasons that only show up on other people's devices:
 *
 *   1. SEEKING IS QUANTISED TO KEYFRAMES. A normally-encoded MP4 carries a
 *      keyframe every one to two seconds and reconstructs everything between
 *      them from motion vectors. Setting `currentTime` to an arbitrary point
 *      lands on the nearest decodable frame, so a 5-second clip has roughly
 *      three to five real stopping points and the scrub moves in visible
 *      lurches. Encoding all-intra (`-g 1`) fixes the seeking and produces a
 *      file that is typically larger than the entire JPEG sequence, which is
 *      the joke at the centre of this technique.
 *
 *   2. SEEKING IS ASYNCHRONOUS AND COALESCED. `currentTime = x` is a request,
 *      not a draw. The browser services it whenever the demuxer is ready and
 *      is free to drop requests that arrive while one is in flight — which,
 *      during a scroll, is all of them. The picture therefore trails the
 *      scroll and then snaps, and no amount of smoothing on your side fixes it
 *      because the lag is downstream of your code.
 *
 *   3. iOS. Inline video decoding is subject to power and memory policy that
 *      the page does not control; in Low Power Mode decoding is throttled or
 *      suspended outright. A hero that silently freezes on a large fraction of
 *      real traffic is not a hero.
 *
 * Every frame of a sequence is independently decodable, `drawImage` is
 * synchronous, and the frame on screen is the frame this code chose on this
 * tick. It is deterministic, which is the entire argument.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE TWO THINGS THAT MAKE THIS FEEL EXPENSIVE
 * ────────────────────────────────────────────────────────────────────────────
 *
 * FRAMERATE-INDEPENDENT SMOOTHING. The usual smoothing line is
 * `current += (target - current) * 0.1`, which is not a time constant, it is a
 * fraction per *frame*. On a 120Hz iPad it converges twice as fast as on a
 * 60Hz laptop, so the feel of the scrub is a property of the display rather
 * than a decision anyone made, and it changes mid-session when the browser
 * throttles rAF. `1 - exp(-lambda * dt)` is the same easing expressed as a
 * rate per second, so it behaves identically at 30, 60 and 144Hz.
 *
 * NO LAYOUT READS IN THE LOOP. Geometry is measured in a ResizeObserver and
 * cached. The loop reads `scrollY` and writes to a canvas, and a canvas draw
 * does not invalidate layout, so nothing in the frame can force a synchronous
 * reflow. Measuring the wrapper inside the loop — `getBoundingClientRect()` on
 * every tick — is what makes most implementations of this stutter under load.
 */

export type SequenceOverlay = {
  /** Scroll progress (0-1) at which this is fully visible. */
  from: number;
  /** Scroll progress (0-1) at which it begins to leave. */
  to: number;
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "left" | "center";
};

export type ScrollSequenceProps = {
  /** Directory of frames, e.g. "/sequence/hero" (no trailing slash). */
  dir: string;
  /** How many frames the sequence has. */
  count: number;
  /** Zero-padding width in the filenames. */
  pad?: number;
  /** File extension, without the dot. */
  ext?: string;
  /** Scroll depth of the pinned section, in vh. 300 is the brief's default. */
  depth?: number;
  overlays?: SequenceOverlay[];
  /**
   * Catch-up rate, per second. Higher is tighter to the wheel, lower is more
   * floated. Below about 6 the lag becomes legible as lag rather than as
   * weight; above about 18 there is no perceptible smoothing left.
   */
  smoothing?: number;
  /** Describes the footage for assistive technology. Required: canvas has no alt. */
  label: string;
  className?: string;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Opacity for one overlay at a given progress. Ramps up over the `FADE` band
 * before `from`, holds, then ramps down over the band after `to`.
 */
const FADE = 0.07;
function overlayOpacity(p: number, o: SequenceOverlay): number {
  if (p <= o.from - FADE || p >= o.to + FADE) return 0;
  if (p < o.from) return clamp01((p - (o.from - FADE)) / FADE);
  if (p > o.to) return clamp01(((o.to + FADE) - p) / FADE);
  return 1;
}

export default function ScrollSequence({
  dir,
  count,
  pad = 3,
  ext = "jpg",
  depth = 300,
  overlays = [],
  smoothing = 9,
  label,
  className = "",
}: ScrollSequenceProps) {
  const reduced = useReducedMotion();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const overlayRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const framesRef = React.useRef<HTMLImageElement[] | null>(null);
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  /* Cached geometry. Written only by `measure`, read by the loop. */
  const metrics = React.useRef({ top: 0, range: 1, cssW: 0, cssH: 0, dpr: 1 });

  /* ---- Load ------------------------------------------------------------ */
  React.useEffect(() => {
    const controller = new AbortController();

    /* THE SCROLL LOCK IS CONDITIONAL, and that condition is the whole reason it
       is safe to ship. Locking the document while a mid-page section loads
       would freeze someone who is reading something else entirely. It engages
       only when the visitor is still at the top of the document, which is the
       one case the lock is actually for: a hero that would otherwise be
       scrolled past before its first frame exists. */
    const shouldLock = window.scrollY < 4;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    if (shouldLock) root.style.overflow = "hidden";
    const release = () => {
      if (shouldLock) root.style.overflow = previousOverflow;
    };

    loadSequence({
      count,
      src: (frame) => frameUrl(dir, frame, pad, ext),
      onProgress: ({ ratio }) => setProgress(ratio),
      signal: controller.signal,
    })
      .then((frames) => {
        framesRef.current = frames;
        release();
        setReady(true);
      })
      .catch((error) => {
        release();
        if (error instanceof SequenceAborted) return;
        console.error("[ScrollSequence]", error);
        setFailed(true);
      });

    return () => {
      controller.abort();
      release();
    };
  }, [dir, count, pad, ext]);

  /* ---- Measure, draw, scrub -------------------------------------------- */
  React.useEffect(() => {
    if (!ready || reduced) return;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!wrapper || !canvas || !frames) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let lastDrawn = -1;
    let lastOpacity = overlays.map(() => -1);

    function measure() {
      const rect = wrapper!.getBoundingClientRect();
      const m = metrics.current;
      m.top = rect.top + window.scrollY;
      /* The travel available to the scrub: everything except the last viewport
         of the wrapper, which is the part that is still on screen when the pin
         releases. Guarded against zero so the division cannot produce NaN on a
         collapsed layout. */
      m.range = Math.max(1, wrapper!.offsetHeight - window.innerHeight);

      const cssW = canvas!.clientWidth;
      const cssH = canvas!.clientHeight;
      /* DPR IS CAPPED AT 2 DELIBERATELY. A modern phone reports 3, which on a
         430pt-wide viewport asks for a 1290x2800 backing store: about 14
         megabytes of canvas, re-rasterised on every resize, to show a source
         image that is 1920 across. The third pixel is below the resolving
         power of the display for photographic content and costs a third more
         fill rate on exactly the hardware least able to afford it. */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.round(cssW * dpr);
      const nextH = Math.round(cssH * dpr);

      if (canvas!.width !== nextW || canvas!.height !== nextH) {
        canvas!.width = nextW;
        canvas!.height = nextH;
        /* Writing width or height clears the canvas, so whatever was drawn is
           gone and the frame cache has to be invalidated or the loop will skip
           the redraw as a no-op and leave the section blank after a resize. */
        lastDrawn = -1;
      }
      m.cssW = cssW;
      m.cssH = cssH;
      m.dpr = dpr;
    }

    function draw(index: number) {
      const img = frames![index];
      if (!img) return;
      const { cssW, cssH, dpr } = metrics.current;
      if (cssW === 0 || cssH === 0) return;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* `object-fit: cover`, by hand, because a canvas has no object-fit: its
         backing store is the drawing surface, not a replaced element. Scale to
         whichever axis needs the most and centre the overflow. */
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cssW / iw, cssH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx!.drawImage(img, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
    }

    function paintOverlays(p: number) {
      for (let i = 0; i < overlays.length; i += 1) {
        const el = overlayRefs.current[i];
        if (!el) continue;
        const next = overlayOpacity(p, overlays[i]);
        /* Only touch the DOM when the value actually changed. During the hold
           band this is every overlay, every frame, for nothing. */
        if (Math.abs(next - lastOpacity[i]) < 0.001) continue;
        lastOpacity[i] = next;
        el.style.opacity = String(next);
        /* A short rise as it arrives. Transform and opacity only: both are
           composited, so an overlay costs no layout and no paint. */
        el.style.transform = `translate3d(0, ${((1 - next) * 16).toFixed(2)}px, 0)`;
        /* Not just tidiness. A transparent element is still composited and
           still hit-tested; `hidden` takes it out of both. */
        el.style.visibility = next < 0.01 ? "hidden" : "visible";
      }
    }

    let current = 0;
    let raf = 0;
    let running = false;
    let lastTime = 0;

    function tick(time: number) {
      const m = metrics.current;
      /* dt is clamped because rAF does not fire in a background tab: returning
         to one produces a single enormous delta that would resolve the easing
         in one step and snap the picture. Clamped, it catches up over a handful
         of frames instead.

         THE CEILING IS 0.1, NOT 0.05, and the difference matters on bad
         hardware. A clamp is a lie about how much time passed, so any device
         whose real frame time exceeds it has its easing slowed by exactly the
         ratio between the two: at 0.05 a phone struggling along at 10fps
         (dt = 0.1) advances at half rate, so the scrub falls further behind the
         longer you scroll — the failure mode lands hardest on the devices least
         able to absorb it. 0.1 covers everything down to 10fps honestly and
         still catches the multi-second delta a backgrounded tab produces. */
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = time;

      const target = clamp01((window.scrollY - m.top) / m.range);

      /* The exponential, not a per-frame fraction. See the header. */
      current += (target - current) * (1 - Math.exp(-smoothing * dt));
      /* Snap when close enough to see, so the loop can actually reach a settled
         state and stop rather than asymptoting forever at a sixtieth of a
         pixel per frame. */
      if (Math.abs(target - current) < 0.00025) current = target;

      const index = Math.round(current * (count - 1));
      if (index !== lastDrawn) {
        draw(index);
        lastDrawn = index;
      }
      paintOverlays(current);

      if (current === target) {
        /* Settled: park the loop. A rAF that runs forever keeps the compositor
           and the main thread awake for the life of the page, which on a laptop
           is a measurable battery cost for a section nobody is looking at. */
        running = false;
        lastTime = 0;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function kick() {
      if (running) return;
      running = true;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    }

    /* First paint is not animated: jump straight to wherever the page already
       is. Easing in from zero would play the whole sequence at someone who
       arrived at an anchor halfway down. */
    measure();
    current = clamp01((window.scrollY - metrics.current.top) / metrics.current.range);
    draw(Math.round(current * (count - 1)));
    lastDrawn = Math.round(current * (count - 1));
    paintOverlays(current);

    const observer = new ResizeObserver(() => {
      measure();
      kick();
    });
    observer.observe(wrapper);
    /* THE BODY IS OBSERVED TOO, and leaving it out is a subtle, permanent
       mis-registration rather than a crash.

       `m.top` is this section's offset from the top of the document, so it
       depends on the height of everything ABOVE it — none of which changes this
       section's own box. A web font swapping in and reflowing the lead-in, an
       image arriving without a reserved aspect ratio, an accordion opening: any
       of those move the section without resizing it, the wrapper's observer
       stays silent, and the cached `top` is now wrong by however much shifted.
       The scrub then runs offset by that amount for the rest of the session,
       reaching full progress before the pin releases or never reaching it. */
    observer.observe(document.body);
    /* The wrapper's own box does not change when the viewport gets shorter, but
       `range` depends on innerHeight, so the window needs watching separately. */
    window.addEventListener("resize", kick, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    /* Named, not an inline arrow, so it can actually be removed again. An
       anonymous handler here leaks the whole effect closure — frames, canvas
       context and all — for the life of the document on every remount. */
    const onOrientation = () => {
      measure();
      kick();
    };
    window.addEventListener("orientationchange", onOrientation);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", kick);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [ready, reduced, count, overlays, smoothing]);

  /* ---- Reduced motion -------------------------------------------------- */
  /* No pin, no scrub, no 300vh of scroll that only exists to drive an
     animation this visitor has asked not to see. One frame and the overlay copy
     as ordinary stacked content, which carries the same information. */
  if (reduced) {
    return (
      <section className={`relative ${className}`}>
        <div className="relative h-[70vh] w-full overflow-hidden bg-[#0a0d1c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameUrl(dir, Math.ceil(count / 2), pad, ext)}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
        {overlays.length > 0 && (
          <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-20 sm:grid-cols-2">
            {overlays.map((o) => (
              <div key={o.title}>
                {o.eyebrow && <p className="v-eyebrow">{o.eyebrow}</p>}
                <h2 className="v-display mt-3 text-[length:var(--t-title)]">{o.title}</h2>
                {o.body && (
                  <p className="mt-3 text-[length:var(--t-body)] leading-[1.7] text-[var(--v-muted)]">
                    {o.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{ height: `${depth}vh` }}
    >
      {/* Pinned by sticky, not by JS. The compositor derives the position from
          the scroll offset itself, so it cannot desync or trail by a frame the
          way a scroll listener writing `translateY` always does. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0d1c]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 700ms ease" }}
        />

        {/* Overlays. Positioned once, animated only via opacity and transform
            written directly from the loop — never through React state, which at
            60fps would re-render the tree sixty times a second to change one
            number. */}
        {overlays.map((o, i) => (
          <div
            key={o.title}
            ref={(el) => {
              overlayRefs.current[i] = el;
            }}
            className={`pointer-events-none absolute inset-0 flex flex-col justify-center px-6 sm:px-12 ${
              o.align === "center" ? "items-center text-center" : "items-start"
            }`}
            style={{ opacity: 0, visibility: "hidden", willChange: "opacity, transform" }}
          >
            <div className="mx-auto w-full max-w-[1280px]">
              <div className={o.align === "center" ? "mx-auto max-w-[42ch]" : "max-w-[36ch]"}>
                {o.eyebrow && (
                  <p className="v-eyebrow text-[var(--v-primary)]">{o.eyebrow}</p>
                )}
                <h2
                  className="v-display mt-4 text-balance text-white"
                  style={{
                    fontSize: "var(--t-display-fluid)",
                    lineHeight: "var(--lh-display-fluid)",
                    letterSpacing: "var(--tr-display-fluid)",
                  }}
                >
                  {o.title}
                </h2>
                {o.body && (
                  <p className="mt-5 text-[length:var(--t-lede)] leading-[1.7] text-white/70">
                    {o.body}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* The gate. Present until every frame is decoded, so the section is
            never a black rectangle that suddenly becomes a picture. */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[min(280px,60vw)]">
              <div className="flex items-baseline justify-between">
                <span className="v-eyebrow text-white/50">
                  {failed ? "Unavailable" : "Loading"}
                </span>
                {!failed && (
                  <span className="text-[13px] tabular-nums text-white/40">
                    {Math.round(progress * 100)}%
                  </span>
                )}
              </div>
              <div className="mt-3 h-px w-full overflow-hidden bg-white/15">
                <div
                  className="h-full bg-[var(--v-primary)]"
                  style={{
                    width: `${failed ? 100 : progress * 100}%`,
                    /* A transition rather than a per-frame write: the bar moves
                       at most `count` times, so easing between those steps is
                       what stops it advancing in visible jerks. */
                    transition: "width 240ms cubic-bezier(0.4, 0, 0.2, 1)",
                    background: failed ? "rgba(255,255,255,0.25)" : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
