"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A drifting node field with proximity links, pointer repulsion, and the firm's
 * own vocabulary surfacing among the nodes.
 *
 * THIS IS THE REFERENCE'S MECHANICS, NOT A REINTERPRETATION OF THEM. Nodes
 * drift at constant velocity and bounce off the edges, a link is drawn between
 * any two within a fixed radius and fades out as that distance grows, the
 * pointer pushes nodes away from it inside a radius, and one node in seven
 * carries a word instead of a dot. That is the reference behaviour, kept.
 *
 * WHAT CHANGED, AND WHY. Four things in the source break once it is a real page
 * rather than a demo tab, and copying them faithfully would be copying bugs.
 *
 * 1. THE CANVAS WAS DRAWN AT HALF RESOLUTION ON EVERY RETINA SCREEN. The source
 *    sets `canvas.width = window.innerWidth` while CSS stretches it to `100vw`,
 *    so on a 2x display every line is a blurry two-pixel smear. Fixed by
 *    backing the canvas at devicePixelRatio and scaling the context.
 *
 * 2. THE LINK PASS WAS THE FRAME BUDGET. At 1920x1080 the source creates 207
 *    nodes and tests every pair, which is 21,528 `Math.sqrt` calls and up to
 *    that many separate `stroke()` submissions per frame. Two changes: pairs
 *    are rejected on squared distance so the square root only runs for the few
 *    hundred that actually link, and links are bucketed into a handful of alpha
 *    bands and stroked as one path per band. That turns several hundred draw
 *    calls into six.
 *
 * 3. A NODE COULD BE DELETED BY A DIVISION. `dirX = dx / distance` is NaN when
 *    the pointer is exactly on a node, and NaN propagates into that node's
 *    position permanently, so it disappears for the rest of the session. Rare
 *    per frame, certain over a long visit.
 *
 * 4. NODES JITTERED AGAINST THE EDGES. The source flips velocity on the border
 *    but never puts the node back inside, so a node the pointer has shoved past
 *    the edge flips its velocity every frame while it sits out there. Position
 *    is clamped as well as reflected.
 *
 * Motion is per second rather than per frame throughout, for the same reason as
 * the hero scrub: the source's `x += vx` moves twice as fast on a 120Hz panel,
 * which makes the feel of the page a property of the display.
 *
 * WHY THE WORDS ARE THE POINT. On the reference they read as ports and hex,
 * because that firm sells proxies and those are the units of its work. Taking
 * the figure without that takes the decoration and leaves the reason. Here they
 * are the seats this firm fills and the ways it works, and they are different
 * on every page, because each page is about something different. They also sit
 * nearly invisible until the pointer is near them, so the field is calm until
 * someone moves, and moving it reads the board rather than disturbing it.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Empty for a dot, a word for a label node. */
  text: string;
  /** Cached text width. Measured once, not per frame. */
  tw: number;
};

/** Link radius, in CSS pixels. From the reference. */
const LINK = 120;
/** Pointer influence radius and shove speed, in CSS pixels and px/s. */
const REPEL = 150;
const REPEL_SPEED = 300;
/** One node per this many square pixels. */
const AREA_PER_NODE = 12000;
const MAX_NODES = 190;
/** Every Nth node carries a word. */
const LABEL_EVERY = 7;
/** Link alpha is quantised into this many bands so each is one stroke call. */
const BANDS = 6;

export default function NodeField({
  labels,
  className = "",
  opacity = 1,
}: {
  /** The words that surface in the field. Page specific by design. */
  labels: string[];
  className?: string;
  opacity?: number;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  /* Stringified so a caller passing an inline array literal does not re-seed
     the whole field on every render. */
  const labelKey = labels.join("|");

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const words = labelKey.split("|").filter(Boolean);
    if (words.length === 0) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let px = -9999;
    let py = -9999;
    let last = 0;

    /* Reused across frames so the link pass allocates nothing. Each band holds
       a flat run of x1,y1,x2,y2. */
    const bands: number[][] = Array.from({ length: BANDS }, () => []);

    function build() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(MAX_NODES, Math.round((w * h) / AREA_PER_NODE));
      nodes = [];
      for (let i = 0; i < count; i += 1) {
        const isText = i % LABEL_EVERY === 0;
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          /* The reference's +/-0.4 px per frame, expressed per second. */
          vx: (Math.random() - 0.5) * 48,
          vy: (Math.random() - 0.5) * 48,
          r: isText ? 0 : Math.random() * 1.6 + 0.9,
          text: isText ? words[(i / LABEL_EVERY) % words.length].toUpperCase() : "",
          tw: 0,
        });
      }
    }

    function step(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        /* Reflect AND clamp. Reflecting alone leaves a node that the pointer
           pushed out of bounds flipping its velocity every frame while it stays
           out there, which looks like a stuck, vibrating dot on the edge. */
        if (n.x < 0) {
          n.x = 0;
          n.vx = Math.abs(n.vx);
        } else if (n.x > w) {
          n.x = w;
          n.vx = -Math.abs(n.vx);
        }
        if (n.y < 0) {
          n.y = 0;
          n.vy = Math.abs(n.vy);
        } else if (n.y > h) {
          n.y = h;
          n.vy = -Math.abs(n.vy);
        }

        if (px > -9000) {
          const dx = px - n.x;
          const dy = py - n.y;
          const d2 = dx * dx + dy * dy;
          /* The lower bound is not fussiness. At distance zero the direction is
             0/0, and a NaN written into a position is permanent: that node is
             gone for the rest of the session. */
          if (d2 < REPEL * REPEL && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (REPEL - d) / REPEL;
            n.x -= (dx / d) * force * REPEL_SPEED * dt;
            n.y -= (dy / d) * force * REPEL_SPEED * dt;
          }
        }
      }
    }

    function draw() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ---- Links --------------------------------------------------------
         Pairs are rejected on squared distance, so the square root only runs
         for the few hundred that actually link rather than for all twenty-odd
         thousand. Survivors are bucketed by alpha and each bucket is stroked
         once, because a stroke() per link is what makes this pattern expensive
         at full-viewport scale. */
      for (const b of bands) b.length = 0;
      const LINK_SQ = LINK * LINK;
      for (let a = 0; a < nodes.length; a += 1) {
        const na = nodes[a];
        for (let b = a + 1; b < nodes.length; b += 1) {
          const nb = nodes[b];
          const dx = na.x - nb.x;
          const dy = na.y - nb.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= LINK_SQ) continue;
          const k = 1 - Math.sqrt(d2) / LINK;
          const band = Math.min(BANDS - 1, Math.floor(k * BANDS));
          const run = bands[band];
          run.push(na.x, na.y, nb.x, nb.y);
        }
      }
      ctx!.lineWidth = 0.8;
      for (let i = 0; i < BANDS; i += 1) {
        const run = bands[i];
        if (run.length === 0) continue;
        /* Band centre, so a band reads as the average of what it holds. */
        const k = (i + 0.5) / BANDS;
        ctx!.strokeStyle = `rgba(143, 180, 255, ${(k * 0.3).toFixed(3)})`;
        ctx!.beginPath();
        for (let j = 0; j < run.length; j += 4) {
          ctx!.moveTo(run[j], run[j + 1]);
          ctx!.lineTo(run[j + 2], run[j + 3]);
        }
        ctx!.stroke();
      }

      /* ---- Nodes --------------------------------------------------------
         One path, one fill, for the same reason as the links. */
      ctx!.fillStyle = "rgba(176, 206, 255, 0.7)";
      ctx!.beginPath();
      for (const n of nodes) {
        if (n.r === 0) continue;
        ctx!.moveTo(n.x + n.r, n.y);
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx!.fill();

      /* A hot core on the few nodes nearest the pointer, so the thing under the
         cursor is visibly the thing being touched rather than just an area that
         got brighter. */
      if (px > -9000) {
        /* WIDER THAN THE REPULSION RADIUS, ON PURPOSE. Nodes are shoved out to
           REPEL and cannot be closer than that, so a hot radius inside it would
           light nothing and the effect would be dead code that looks correct in
           review. Reaching past it lights the ring the shove creates, which is
           the part there is actually something to see. */
        const HOT = 230 * 230;
        ctx!.fillStyle = "rgba(232, 241, 255, 0.95)";
        ctx!.beginPath();
        for (const n of nodes) {
          if (n.r === 0) continue;
          const dx = n.x - px;
          const dy = n.y - py;
          if (dx * dx + dy * dy > HOT) continue;
          ctx!.moveTo(n.x + n.r + 0.6, n.y);
          ctx!.arc(n.x, n.y, n.r + 0.6, 0, Math.PI * 2);
        }
        ctx!.fill();
      }

      /* ---- Words --------------------------------------------------------
         Set to the house eyebrow: uppercase, medium, wide tracking. The
         reference uses 11px monospace because its labels are hex and port
         numbers; ours are English words, and monospace would make them read as
         code the firm does not write. */
      ctx!.font = "500 10px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx!.letterSpacing = "0.09em";
      ctx!.textBaseline = "middle";
      const NEAR = 190 * 190;
      for (const n of nodes) {
        if (n.r !== 0) continue;
        /* Nearly invisible at rest, full near the pointer. The field should be
           calm until someone moves, and the words should feel found rather than
           printed on the background. */
        let a = 0.1;
        const dx = n.x - px;
        const dy = n.y - py;
        const d2 = dx * dx + dy * dy;
        if (px > -9000 && d2 < NEAR) a += (1 - d2 / NEAR) * 0.84;
        ctx!.fillStyle = `rgba(168, 200, 255, ${a.toFixed(3)})`;

        /* Measured once per node, not per frame. */
        if (n.tw === 0) n.tw = ctx!.measureText(n.text).width;
        /* Flips to the left of its node rather than running off the canvas. A
           word sliced by the right edge reads as a rendering fault, and these
           drift, so any fixed layout will eventually put one there. */
        const x = n.x + 9 + n.tw > w ? n.x - 9 - n.tw : n.x + 9;
        ctx!.fillText(n.text, x, n.y);
      }
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    build();
    if (reduced) {
      draw();
      return;
    }

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
    };

    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    /* Off screen costs nothing. A full viewport rAF that keeps running while
       the field is scrolled past is the version of this that shows up as
       battery drain on a laptop and never as a visible bug. */
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
    window.addEventListener("blur", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, labelKey]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}
