"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A drifting network: nodes that find each other and let go.
 *
 * WHY THIS FIGURE ON THIS SITE. A particle field is decoration on most sites and
 * it would be here too, except that this firm's entire product is a network:
 * who knows whom, and which of those connections is close enough to be worth
 * making. Nodes that link when they come near each other and dissolve when they
 * drift apart is not an abstract pattern behind a headline, it is a picture of
 * the business. That is the only reason it earns the frame.
 *
 * FOUR PLACES THIS DEPARTS FROM THE STOCK VERSION OF THIS EFFECT.
 *
 *   1. IT IS NOT `position: fixed` BEHIND THE WHOLE PAGE. The usual recipe pins
 *      one canvas to the viewport for the life of the document. This site
 *      alternates dark and cream bands, so a fixed field would either show
 *      through the cream or need masking against every one of them. It lives
 *      inside the hero instead, which also means the card expanding over it is
 *      a real occlusion rather than a crossfade between two backgrounds.
 *
 *   2. THE POINTER DOES NOT SCATTER THE NODES. Nodes fleeing the cursor is the
 *      default and it reads as a toy: the network's reaction to a person is to
 *      run away from them. Here they give way slightly, and the links near the
 *      pointer BRIGHTEN. The network notices you and shows you more of itself,
 *      which is the behaviour worth having on this particular site.
 *
 *   3. LINK OPACITY IS COMPUTED FROM SQUARED DISTANCE. The stock version calls
 *      Math.sqrt for every pair on every frame to get a distance it then only
 *      uses as a ratio. At this node count that is tens of thousands of square
 *      roots a second for a number that never needed to leave squared space.
 *
 *   4. IT STOPS WHEN NOBODY IS LOOKING. The loop parks when the hero scrolls out
 *      of view and when the tab is hidden. An animation nobody can see is pure
 *      battery, and this one would otherwise run for the entire session on a
 *      page that is ten thousand pixels tall.
 */

/** Node density per million square pixels, and the ceiling that caps it. */
const DENSITY = 46;
const MAX_NODES = 110;
/** Nodes link within this distance. Squared, so the inner loop stays in that space. */
const LINK_DIST = 156;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
/** How close the pointer has to be before the network reacts. */
const POINTER_DIST = 190;
const POINTER_DIST_SQ = POINTER_DIST * POINTER_DIST;

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius, varied so the field has near and far members rather than one size. */
  r: number;
};

export default function NetworkField({
  className = "",
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    /* Off canvas until the pointer actually arrives, so nothing reacts to a
       cursor that was never there. */
    let px = -9999;
    let py = -9999;

    function measure() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      /* Capped at 2. A phone reporting 3 asks for a backing store nine times the
         CSS area, and this is a field of soft dots where the third pixel is
         invisible and the fill cost is not. */
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(MAX_NODES, Math.round((w * h * DENSITY) / 1_000_000));
      if (nodes.length !== target) seed(target);
    }

    function seed(count: number) {
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        /* Slow. The drift should be something you notice on the second look, not
           a screensaver competing with the headline sitting on top of it. */
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.9 + Math.random() * 1.5,
      }));
    }

    function step() {
      ctx!.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        /* Wrapped, not bounced. A node that bounces off an invisible wall draws
           attention to the edge of the canvas; one that wraps makes the field
           read as a window onto something larger. */
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;

        /* The pointer pushes, gently, and only inside its radius. Scaled by how
           close it is so there is no edge to the effect. */
        const dx = n.x - px;
        const dy = n.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < POINTER_DIST_SQ && d2 > 0.01) {
          const force = (1 - d2 / POINTER_DIST_SQ) * 0.42;
          const inv = 1 / Math.sqrt(d2);
          n.x += dx * inv * force;
          n.y += dy * inv * force;
        }
      }

      /* ---- Links -------------------------------------------------------- */
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST_SQ) continue;

          /* Fade from the squared ratio directly. Squaring it again biases the
             falloff so links fade out early and only the genuinely close pairs
             read as connected, which is the whole point of the figure. */
          const t = 1 - d2 / LINK_DIST_SQ;
          let alpha = t * t * 0.5;

          /* Brighter near the pointer: the network shows more of itself where
             someone is looking. Measured to the midpoint of the link so a pair
             lights as a pair. */
          const mx = (a.x + b.x) * 0.5 - px;
          const my = (a.y + b.y) * 0.5 - py;
          const pd2 = mx * mx + my * my;
          if (pd2 < POINTER_DIST_SQ) {
            alpha += (1 - pd2 / POINTER_DIST_SQ) * 0.55;
          }

          ctx!.strokeStyle = `rgba(143, 180, 255, ${alpha.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      /* ---- Nodes -------------------------------------------------------- */
      for (const n of nodes) {
        const dx = n.x - px;
        const dy = n.y - py;
        const near = dx * dx + dy * dy < POINTER_DIST_SQ;
        ctx!.fillStyle = near ? "rgba(190, 214, 255, 0.95)" : "rgba(126, 165, 250, 0.62)";
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame() {
      step();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    measure();

    if (reduced) {
      /* One frame, then nothing. The figure still reads as a network; it simply
         does not move. Returning early with a blank canvas would take the
         picture away from the people who asked only for less motion. */
      step();
      return;
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
    };

    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    /* Parks the loop when the hero is off screen. This page is ten thousand
       pixels tall, so without it the field animates for the whole session while
       nobody can see it. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}
