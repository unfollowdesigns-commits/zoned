"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A circuit of orthogonal traces, with the firm's own vocabulary surfacing on it.
 *
 * WHAT THE REFERENCE ACTUALLY IS. The site this comes from is not a
 * constellation of drifting nodes; that was my first reading and it was wrong.
 * It is a board: axis-aligned runs turning at right angles, pulses travelling
 * along them, and small labels appearing and fading at the junctions. Comparing
 * two screenshots of the same page shows the labels in different places with
 * different values, which is the tell that they surface over time rather than
 * being painted into the background.
 *
 * WHY THE LABELS ARE THE WHOLE IDEA. On the reference they read as hex and
 * latency, because that firm sells proxies and those are the units of its work.
 * Copying the figure without that would be copying the decoration and leaving
 * the reason behind. So here they are the seats this firm fills and the ways it
 * works: CFO, Controller, Retained, Interim. The background is quietly naming
 * the business, and it says something different on each page because each page
 * is about something different.
 *
 * That is also why `labels` is a prop with no default worth relying on. A
 * caller that passes nothing gets a board with no voice, which is the failure
 * this component exists to avoid.
 *
 * PERFORMANCE. The traces never move, so they are rasterised once into an
 * offscreen canvas and blitted each frame. Only the pulses and the labels are
 * redrawn, which keeps a full-viewport animation at a handful of draw calls
 * instead of several hundred paths per frame.
 */

type Seg = { x1: number; y1: number; x2: number; y2: number; len: number; mx: number; my: number };
type Trace = { segs: Seg[]; total: number };
type Pulse = { trace: number; dist: number; speed: number };
type Node = { x: number; y: number; text: string; t: number; period: number };

const GRID = 64;
/** Trace count per million square pixels. */
const DENSITY = 40;
const MAX_TRACES = 58;

export default function CircuitField({
  labels,
  className = "",
  opacity = 1,
}: {
  /** The words that surface on the board. Page-specific by design. */
  labels: string[];
  className?: string;
  opacity?: number;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  /* Stringified so a caller passing an inline array literal does not re-seed
     the whole board on every render. */
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
    let traces: Trace[] = [];
    let allSegs: Seg[] = [];
    let pulses: Pulse[] = [];
    let nodes: Node[] = [];
    let still: HTMLCanvasElement | null = null;
    let raf = 0;
    let running = false;
    let visible = true;
    let px = -9999;
    let py = -9999;
    let last = 0;

    const snap = (v: number) => Math.round(v / GRID) * GRID;

    function build() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(MAX_TRACES, Math.round((w * h * DENSITY) / 1_000_000));
      traces = [];
      nodes = [];

      for (let i = 0; i < count; i += 1) {
        /* An L or a Z between two snapped points. Right angles only: a diagonal
           anywhere in this figure and it stops reading as a board. */
        const x1 = snap(Math.random() * w);
        const y1 = snap(Math.random() * h);
        const x2 = snap(Math.random() * w);
        const y2 = snap(Math.random() * h);
        const horizontalFirst = Math.random() < 0.5;
        const mid = horizontalFirst ? { x: x2, y: y1 } : { x: x1, y: y2 };

        const pts = [
          { x: x1, y: y1 },
          mid,
          { x: x2, y: y2 },
        ];
        const segs: Seg[] = [];
        let total = 0;
        for (let k = 0; k < pts.length - 1; k += 1) {
          const a = pts[k];
          const b = pts[k + 1];
          const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
          if (len < 1) continue;
          segs.push({
            x1: a.x,
            y1: a.y,
            x2: b.x,
            y2: b.y,
            len,
            mx: (a.x + b.x) / 2,
            my: (a.y + b.y) / 2,
          });
          total += len;
        }
        if (segs.length) traces.push({ segs, total });
      }

      /* A label at roughly every third trace end, so the board is annotated
         rather than covered. Phase-shifted so they do not all breathe together,
         which would read as the whole page blinking. */
      for (let i = 0; i < traces.length; i += 1) {
        if (i % 3 !== 0) continue;
        const end = traces[i].segs[traces[i].segs.length - 1];
        nodes.push({
          x: end.x2,
          y: end.y2,
          text: words[i % words.length],
          t: Math.random() * 10,
          period: 7 + Math.random() * 6,
        });
      }

      /* Flattened once so the pointer pass below is a loop over an array of
         about a hundred segments rather than a nested walk of the traces. */
      allSegs = traces.flatMap((t) => t.segs);

      pulses = traces.map((_, i) => ({
        trace: i,
        dist: Math.random() * traces[i].total,
        speed: 26 + Math.random() * 44,
      }));

      /* The traces are static, so they are drawn once here and blitted every
         frame after. Redrawing forty multi-segment paths per frame for a
         picture that never changes is the usual reason an effect like this
         costs more than it looks like it should. */
      still = document.createElement("canvas");
      still.width = canvas!.width;
      still.height = canvas!.height;
      const sc = still.getContext("2d");
      if (sc) {
        sc.setTransform(dpr, 0, 0, dpr, 0, 0);
        sc.strokeStyle = "rgba(126, 165, 250, 0.2)";
        sc.lineWidth = 1;
        sc.beginPath();
        for (const tr of traces) {
          for (const s of tr.segs) {
            sc.moveTo(s.x1 + 0.5, s.y1 + 0.5);
            sc.lineTo(s.x2 + 0.5, s.y2 + 0.5);
          }
        }
        sc.stroke();
        /* A pad at every corner and end, the way a real board has one. */
        sc.fillStyle = "rgba(143, 180, 255, 0.42)";
        for (const tr of traces) {
          for (const s of tr.segs) {
            sc.fillRect(s.x2 - 1.5, s.y2 - 1.5, 3, 3);
          }
        }
      }
    }

    /** Walks `dist` along a trace and returns the point there. */
    function pointAt(tr: Trace, dist: number) {
      let d = dist % tr.total;
      for (const s of tr.segs) {
        if (d <= s.len) {
          const f = s.len === 0 ? 0 : d / s.len;
          return { x: s.x1 + (s.x2 - s.x1) * f, y: s.y1 + (s.y2 - s.y1) * f };
        }
        d -= s.len;
      }
      const last = tr.segs[tr.segs.length - 1];
      return { x: last.x2, y: last.y2 };
    }

    function draw(dt: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      if (still) ctx!.drawImage(still, 0, 0);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ---- The board reacts around the pointer --------------------------
      
         THIS IS THE HOVER EFFECT, and its absence is most of why the field read
         as flat. Everything else here is ambient: it runs whether or not
         anyone is there, so within a second the eye files it as wallpaper. A
         board that brightens where you point stops being a backdrop and starts
         being a surface you are touching.
      
         It lights whole SEGMENTS rather than a soft circular blob. A radial
         glow over a circuit reads as a smudge sitting on top of it; lighting
         the runs themselves means the light is travelling in the traces, which
         is what the picture is about. */
      const LIT = 240;
      const LIT_SQ = LIT * LIT;
      if (px > -9000) {
        ctx!.lineWidth = 1.2;
        ctx!.shadowColor = "rgba(120, 170, 255, 0.9)";
        for (const sg of allSegs) {
          const dx = sg.mx - px;
          const dy = sg.my - py;
          const d2 = dx * dx + dy * dy;
          if (d2 > LIT_SQ) continue;
          const k = 1 - d2 / LIT_SQ;
          ctx!.shadowBlur = 10 * k;
          ctx!.strokeStyle = `rgba(176, 206, 255, ${(k * 0.7).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(sg.x1 + 0.5, sg.y1 + 0.5);
          ctx!.lineTo(sg.x2 + 0.5, sg.y2 + 0.5);
          ctx!.stroke();
          /* The pad at the end of a lit run comes up hot, so the junctions read
             as the things the light is arriving at. */
          ctx!.fillStyle = `rgba(226, 238, 255, ${(k * 0.95).toFixed(3)})`;
          ctx!.fillRect(sg.x2 - 2, sg.y2 - 2, 4, 4);
        }
        ctx!.shadowBlur = 0;
      }

      /* ---- Pulses ------------------------------------------------------- */
      for (const p of pulses) {
        const tr = traces[p.trace];
        if (!tr) continue;
        p.dist = (p.dist + p.speed * dt) % tr.total;
        const head = pointAt(tr, p.dist);
        /* 64 rather than 30. A short streak reads as a moving dot; the length
           is what makes it read as something travelling at speed. */
        const tail = pointAt(tr, (p.dist - 64 + tr.total) % tr.total);

        /* Drawn as a short bright run rather than a dot, because what reads as
           a signal is the streak behind it. Only straight when head and tail
           are on the same segment; across a corner the gradient would cut, so
           it is skipped for that frame and nobody sees the gap. */
        if (head.x === tail.x || head.y === tail.y) {
          const g = ctx!.createLinearGradient(tail.x, tail.y, head.x, head.y);
          g.addColorStop(0, "rgba(143, 180, 255, 0)");
          g.addColorStop(0.7, "rgba(170, 200, 255, 0.4)");
          g.addColorStop(1, "rgba(226, 238, 255, 1)");
          ctx!.strokeStyle = g;
          ctx!.lineWidth = 1.6;
          /* BLOOM, and it is the single biggest reason this was flat. A hairline
             at full alpha is still a hairline: what makes a light read as a
             light is the halo around it, because that is how a bright thing
             behaves against a dark ground in every photograph anyone has seen.
             Canvas shadow gives it for one property rather than a second
             blurred pass. */
          ctx!.shadowColor = "rgba(120, 170, 255, 0.95)";
          ctx!.shadowBlur = 9;
          ctx!.beginPath();
          ctx!.moveTo(tail.x, tail.y);
          ctx!.lineTo(head.x, head.y);
          ctx!.stroke();
          ctx!.shadowBlur = 0;
        }
        /* The head is a hot core with its own halo, drawn after the streak so
           it sits on top of it. */
        ctx!.shadowColor = "rgba(150, 190, 255, 1)";
        ctx!.shadowBlur = 8;
        ctx!.fillStyle = "rgba(238, 245, 255, 1)";
        ctx!.fillRect(head.x - 1.5, head.y - 1.5, 3, 3);
        ctx!.shadowBlur = 0;
      }

      /* ---- Labels ------------------------------------------------------- */
      ctx!.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx!.textBaseline = "middle";
      for (const n of nodes) {
        n.t += dt;
        /* A slow breath, mostly off. The word should feel found rather than
           displayed. */
        const cycle = (n.t % n.period) / n.period;
        let a = Math.max(0, Math.sin(cycle * Math.PI)) * 0.42;

        /* And it comes fully up near the pointer, which is the interaction the
           reference has and the reason it is worth building: moving the mouse
           reads the board rather than disturbing it. */
        const dx = n.x - px;
        const dy = n.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240) a = Math.min(1, a + (1 - d2 / (240 * 240)) * 0.95);
        if (a < 0.02) continue;

        ctx!.fillStyle = `rgba(160, 195, 255, ${a.toFixed(3)})`;
        ctx!.fillText(n.text, n.x + 8, n.y);
      }
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;
      draw(dt);
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
      draw(0);
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
