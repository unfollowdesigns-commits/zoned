"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A warping grid of nodes, with the firm's own vocabulary surfacing on it.
 *
 * WHY THE TOPOLOGY IS FIXED, AND WHY THAT IS THE WHOLE POINT. The obvious way
 * to build a field like this is to link any two nodes that come within a
 * radius, which is what the reference implementation does. That is exactly what
 * produces constellations: three nodes near each other make a triangle, and a
 * screen full of triangles is a star map, not a grid. No amount of tuning the
 * radius fixes it, because the triangles are what proximity linking MEANS.
 *
 * So the links are not proximity based at all. Nodes sit on a lattice and each
 * one links to its right and down neighbour, permanently. Those pairs never
 * change, so the figure is a grid by construction: it cannot form a triangle,
 * and links never flicker in and out as nodes drift past each other, which is
 * the other tell of the proximity version.
 *
 * WHAT MOVES, THEN. Each node has a fixed home on the lattice and is displaced
 * from it by two things. A travelling sine gives the whole sheet a slow wave,
 * phase-shifted by lattice position so it reads as one wave crossing the field
 * rather than every node bobbing on its own clock. The pointer shoves nodes
 * outward, and a spring pulls them back. Because the links follow the nodes,
 * the grid bulges around the cursor and settles after it, which is the thing
 * worth looking at: a surface being pushed, rather than dots being scattered.
 *
 * The spring is why the pointer displacement is a velocity rather than a
 * position. Writing position directly, as the reference does, means the grid
 * snaps back the instant the pointer leaves and there is no settle at all.
 *
 * PERFORMANCE. Links are bucketed into a few alpha bands and each band is
 * stroked as one path, so a field of several hundred links is a handful of draw
 * calls rather than one per link. Nodes are one path and one fill. The canvas is
 * backed at devicePixelRatio, because a canvas sized in CSS pixels and stretched
 * to full width is drawn at half resolution on every retina screen.
 *
 * WHY THE WORDS MATTER. On the reference these are ports and hex, because that
 * firm sells proxies. Taking the figure without that takes the decoration and
 * leaves the reason. Here they are the things this firm is actually hired for,
 * and they differ per page because each page is about something different. They
 * rest near invisible and come up under the pointer, so the field is calm until
 * someone moves it.
 */

type Node = {
  /** Lattice home. Never changes. */
  hx: number;
  hy: number;
  /** Displacement from home, and its velocity. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  /** Resolved position for this frame. */
  x: number;
  y: number;
  /** Index of the right and down neighbours, or -1 at the edges. */
  right: number;
  down: number;
  /** Empty for a plain node, a word for a label node. */
  text: string;
  /** Cached text width. Measured once, not per frame. */
  tw: number;
};

/** Lattice spacing in CSS pixels. */
const CELL = 78;
/** Wave amplitude in CSS pixels, and its speed. */
const WAVE = 7;
const WAVE_SPEED = 0.55;
/** Pointer influence radius, and the impulse it applies. */
const REPEL = 165;
const PUSH = 2600;
/** Spring back to home. Damped so the sheet settles rather than ringing. */
const STIFF = 46;
const DAMP = 9;
/** Physics timestep ceiling. Large steps make a spring explode. */
const MAX_STEP = 0.04;
/** Link alpha is quantised into this many bands so each is one stroke call. */
const BANDS = 5;

export default function NodeField({
  labels,
  className = "",
  opacity = 1,
}: {
  /** The words that surface on the grid. Page specific by design. */
  labels: string[];
  className?: string;
  opacity?: number;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  /* Stringified so a caller passing an inline array literal does not re-seed
     the whole grid on every render. */
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
    let clock = 0;

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

      /* One cell of bleed on every side. The wave and the pointer both move
         nodes, and a lattice that stops exactly at the edge shows its border as
         a row of links that end in mid air. */
      const cols = Math.ceil(w / CELL) + 2;
      const rows = Math.ceil(h / CELL) + 2;
      nodes = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c;
          /* A small fixed jitter per node, from its own coordinates rather than
             from Math.random. A perfect lattice reads as graph paper; a jittered
             one reads as a mesh. Deterministic so a resize does not reshuffle
             the whole field. */
          const j = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          const jitter = (j - Math.floor(j) - 0.5) * CELL * 0.28;
          const j2 = Math.sin(c * 39.3468 + r * 11.135) * 24634.6345;
          const jitter2 = (j2 - Math.floor(j2) - 0.5) * CELL * 0.28;

          /* Scattered rather than every Nth, so the words do not line up into
             columns of their own. */
          const isText = (c * 5 + r * 3) % 13 === 0;

          nodes.push({
            hx: (c - 1) * CELL + jitter,
            hy: (r - 1) * CELL + jitter2,
            ox: 0,
            oy: 0,
            vx: 0,
            vy: 0,
            x: 0,
            y: 0,
            right: c < cols - 1 ? i + 1 : -1,
            down: r < rows - 1 ? i + cols : -1,
            text: isText ? words[(c + r * 3) % words.length].toUpperCase() : "",
            tw: 0,
          });
        }
      }
      resolve(0);
    }

    /** Writes each node's position for this frame: home, plus wave, plus spring. */
    function resolve(dt: number) {
      for (const n of nodes) {
        if (dt > 0) {
          if (px > -9000) {
            const dx = n.x - px;
            const dy = n.y - py;
            const d2 = dx * dx + dy * dy;
            /* The lower bound is not fussiness. At distance zero the direction
               is 0/0, and a NaN written into a velocity is permanent: that node
               and its four links are gone for the rest of the session. */
            if (d2 < REPEL * REPEL && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const k = (REPEL - d) / REPEL;
              n.vx += (dx / d) * k * PUSH * dt;
              n.vy += (dy / d) * k * PUSH * dt;
            }
          }
          /* Damped spring back to home. Velocity rather than position, so the
             sheet settles after the pointer leaves instead of snapping. */
          n.vx += (-STIFF * n.ox - DAMP * n.vx) * dt;
          n.vy += (-STIFF * n.oy - DAMP * n.vy) * dt;
          n.ox += n.vx * dt;
          n.oy += n.vy * dt;
        }

        /* Phase from lattice position, so this is one wave crossing the field
           rather than every node bobbing on its own clock. */
        const p = n.hx * 0.011 + n.hy * 0.017;
        n.x = n.hx + n.ox + Math.sin(clock * WAVE_SPEED + p) * WAVE;
        n.y = n.hy + n.oy + Math.cos(clock * WAVE_SPEED * 0.82 + p * 1.3) * WAVE;
      }
    }

    function draw() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ---- Grid lines ---------------------------------------------------
         Right and down neighbours only. Fixed pairs, so this is a grid by
         construction and never a constellation. Brightness follows proximity to
         the pointer, so the sheet lights where it is being touched, and the
         bands keep that to one stroke call each. */
      for (const b of bands) b.length = 0;
      const NEAR = 250;
      const NEAR_SQ = NEAR * NEAR;
      for (const n of nodes) {
        for (const j of [n.right, n.down]) {
          if (j < 0) continue;
          const m = nodes[j];
          const mx = (n.x + m.x) / 2;
          const my = (n.y + m.y) / 2;
          let k = 0;
          if (px > -9000) {
            const dx = mx - px;
            const dy = my - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < NEAR_SQ) k = 1 - d2 / NEAR_SQ;
          }
          const band = Math.min(BANDS - 1, Math.floor(k * BANDS));
          const run = bands[band];
          run.push(n.x, n.y, m.x, m.y);
        }
      }
      ctx!.lineWidth = 1;
      for (let i = 0; i < BANDS; i += 1) {
        const run = bands[i];
        if (run.length === 0) continue;
        const k = (i + 0.5) / BANDS;
        /* A floor so the grid is always faintly there, and a rise so the part
           under the pointer is clearly the part being touched. */
        const a = 0.07 + k * 0.34;
        ctx!.strokeStyle = `rgba(143, 180, 255, ${a.toFixed(3)})`;
        ctx!.beginPath();
        for (let j = 0; j < run.length; j += 4) {
          ctx!.moveTo(run[j], run[j + 1]);
          ctx!.lineTo(run[j + 2], run[j + 3]);
        }
        ctx!.stroke();
      }

      /* ---- Junctions ----------------------------------------------------
         One path, one fill, for the same reason as the lines. */
      ctx!.fillStyle = "rgba(176, 206, 255, 0.34)";
      ctx!.beginPath();
      for (const n of nodes) {
        ctx!.moveTo(n.x + 1.1, n.y);
        ctx!.arc(n.x, n.y, 1.1, 0, Math.PI * 2);
      }
      ctx!.fill();

      /* A hot core on the junctions the pointer is over. */
      if (px > -9000) {
        const HOT = 150 * 150;
        ctx!.fillStyle = "rgba(226, 238, 255, 0.9)";
        ctx!.beginPath();
        for (const n of nodes) {
          const dx = n.x - px;
          const dy = n.y - py;
          if (dx * dx + dy * dy > HOT) continue;
          ctx!.moveTo(n.x + 1.8, n.y);
          ctx!.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        }
        ctx!.fill();
      }

      /* ---- Words --------------------------------------------------------
         Set to the house eyebrow: uppercase, medium, wide tracking. The
         reference uses monospace because its labels are hex and port numbers;
         ours are English terms, and monospace would make them read as code the
         firm does not write. */
      ctx!.font = "500 10px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx!.letterSpacing = "0.09em";
      ctx!.textBaseline = "middle";
      const WNEAR = 200 * 200;
      for (const n of nodes) {
        if (n.text === "") continue;
        /* The lattice has a cell of bleed on every side so the links do not end
           in mid air at the border. Those outer nodes should carry lines, not
           words: a label hung off a node beyond the edge has nowhere to sit. */
        if (n.x < 0 || n.x > w || n.y < 0 || n.y > h) continue;
        /* Nearly invisible at rest, full near the pointer. The field should be
           calm until someone moves, and a word should feel found rather than
           printed on the background. */
        let a = 0.1;
        const dx = n.x - px;
        const dy = n.y - py;
        const d2 = dx * dx + dy * dy;
        if (px > -9000 && d2 < WNEAR) a += (1 - d2 / WNEAR) * 0.84;
        ctx!.fillStyle = `rgba(168, 200, 255, ${a.toFixed(3)})`;

        /* Measured once per node, not per frame. */
        if (n.tw === 0) n.tw = ctx!.measureText(n.text).width;
        /* Flips to the left of its junction rather than running off the canvas,
           then clamps. A word sliced by the right edge reads as a rendering
           fault, and these move, so any fixed layout eventually puts one there.
           The clamp is the part that actually holds: flipping alone still
           overflows for a node close enough to the edge that its own width no
           longer fits on either side. */
        const flipped = n.x + 9 + n.tw > w ? n.x - 9 - n.tw : n.x + 9;
        const x = Math.max(4, Math.min(flipped, w - n.tw - 4));
        ctx!.fillText(n.text, x, n.y);
      }
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;
      clock += dt;
      /* Substepped. A damped spring integrated in one large step overshoots and
         then diverges, and frame times spike on any real page, so the ceiling
         has to be on the physics step rather than on the frame. */
      let rest = dt;
      while (rest > 0) {
        const s = Math.min(rest, MAX_STEP);
        resolve(s);
        rest -= s;
      }
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
