"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A search, running. Not a diagram of one.
 *
 * WHAT THIS REPLACED AND WHY. The first attempt was a panel of four rows of
 * dots with a bar beside each, and it was the shape of every SaaS dashboard
 * ever screenshotted: a static picture of a funnel with a stage name changing
 * above it. Nothing in it moved because anything was happening; it moved
 * because a timer said so. That is the difference between a readout and a
 * decoration wearing a readout's clothes.
 *
 * This is a simulation. Candidates enter continuously across the full width
 * of the market at the top, and fall. Three gates cross the field, each with
 * a narrower aperture than the one above it. A candidate that reaches a gate
 * outside its aperture is deflected sideways and fades; one inside it carries
 * on. Every candidate also drifts toward the centre as it falls, so the whole
 * flow converges. What arrives at the bottom is one seat, filled.
 *
 * NOBODY HAS TO BE TOLD WHAT IT MEANS. A funnel drawn as four labelled bars
 * has to be read. A funnel where you can watch most of the flow get turned
 * away at the second gate is understood before the labels are. That is the
 * whole argument for spending a canvas on it.
 *
 * IT CLAIMS NO NUMBERS. The apertures are proportions chosen so the cascade
 * reads, not measured conversion rates, and nothing is counted on screen. A
 * shape is a design statement the firm can correct in a sentence; "3% reach
 * shortlist" would be a performance claim invented for a real firm.
 *
 * THE TEXT IS HTML OVER THE CANVAS, NOT DRAWN INTO IT. Canvas text does not
 * scale with the user's font settings, cannot be selected, and is invisible to
 * assistive technology. The gates are painted; their labels are typeset.
 */

/** Where each gate sits, how much of the width it lets through, and its name. */
const GATES = [
  { y: 0.36, half: 0.3, label: "Screened" },
  { y: 0.585, half: 0.15, label: "Shortlist" },
  { y: 0.79, half: 0.062, label: "Final slate" },
] as const;

/** The seat, at the foot of the cascade. */
const SEAT_Y = 0.925;
/** New candidates per second. Enough that the field always has flow in it. */
const SPAWN_RATE = 26;
/** How hard the flow converges on the centre. A search is directed. */
const CONVERGE = 0.85;

type P = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  /** Bitmask of gates already tested, so each is tested exactly once. */
  seen: number;
  /** Seconds of fade left once turned away. 0 means still in the running. */
  fade: number;
  dead: boolean;
};

export default function SearchCascade({ className = "" }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let res = 1;
    const pool: P[] = [];
    let spawnAcc = 0;
    /** Decays after a candidate lands, so the seat pulses on arrival. */
    let seatGlow = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;

    function size() {
      const r = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      res = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * res);
      canvas!.height = Math.round(h * res);
      ctx!.setTransform(res, 0, 0, res, 0, 0);
    }

    function spawn() {
      /* Reuse a dead slot before growing the pool: the loop runs for as long
         as the section is on screen, and allocating a new object 26 times a
         second would hand the collector a steady drip of garbage forever. */
      const p = pool.find((q) => q.dead) ?? ({} as P);
      p.x = 0.06 + Math.random() * 0.88;
      p.y = -0.02 - Math.random() * 0.04;
      p.vy = 0.19 + Math.random() * 0.12;
      p.vx = 0;
      p.seen = 0;
      p.fade = 0;
      p.dead = false;
      if (!pool.includes(p)) pool.push(p);
    }

    function step(dt: number) {
      spawnAcc += dt * SPAWN_RATE;
      while (spawnAcc >= 1) {
        spawn();
        spawnAcc -= 1;
      }
      if (seatGlow > 0) seatGlow = Math.max(0, seatGlow - dt * 1.6);

      for (const p of pool) {
        if (p.dead) continue;

        if (p.fade > 0) {
          /* Turned away: it drifts out of the field rather than vanishing,
             because a candidate who was considered and passed over is not the
             same picture as one who was never there. */
          p.x += p.vx * dt;
          p.y += p.vy * 0.35 * dt;
          p.fade -= dt;
          if (p.fade <= 0) p.dead = true;
          continue;
        }

        p.y += p.vy * dt;
        p.x += (0.5 - p.x) * CONVERGE * dt;

        for (let g = 0; g < GATES.length; g += 1) {
          const bit = 1 << g;
          if (p.seen & bit) continue;
          if (p.y < GATES[g].y) continue;
          p.seen |= bit;
          if (Math.abs(p.x - 0.5) > GATES[g].half) {
            p.fade = 0.55 + Math.random() * 0.35;
            p.vx = (p.x < 0.5 ? -1 : 1) * (0.22 + Math.random() * 0.22);
          }
        }

        if (p.y >= SEAT_Y) {
          p.dead = true;
          seatGlow = 1;
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      /* The gates. Drawn as two segments with the aperture left open, so the
         gap IS the filter rather than a symbol for one. */
      for (const g of GATES) {
        const y = g.y * h;
        const left = (0.5 - g.half) * w;
        const right = (0.5 + g.half) * w;
        ctx!.strokeStyle = "rgba(143, 180, 255, 0.34)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(0.04 * w, y);
        ctx!.lineTo(left, y);
        ctx!.moveTo(right, y);
        ctx!.lineTo(0.96 * w, y);
        ctx!.stroke();
        /* Aperture cheeks: a short bright mark either side of the opening, so
           the eye finds the gap immediately. */
        ctx!.strokeStyle = "rgba(190, 214, 255, 0.85)";
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(left - 7, y);
        ctx!.lineTo(left, y);
        ctx!.moveTo(right, y);
        ctx!.lineTo(right + 7, y);
        ctx!.stroke();
      }

      /* Candidates. Squares, not circles: a node is a seat in the house
         grammar, and these are people being considered for one. */
      for (const p of pool) {
        if (p.dead) continue;
        const x = p.x * w;
        const y = p.y * h;
        if (y < -6 || y > h + 6) continue;
        if (p.fade > 0) {
          ctx!.fillStyle = `rgba(143, 180, 255, ${(p.fade * 0.34).toFixed(3)})`;
          ctx!.fillRect(x - 1.5, y - 1.5, 3, 3);
        } else {
          /* Survivors brighten as they descend, so the flow reads as gaining
             confidence rather than merely thinning out. */
          const t = Math.min(1, Math.max(0, p.y / SEAT_Y));
          ctx!.fillStyle = `rgba(${(150 + 90 * t) | 0}, ${(190 + 55 * t) | 0}, 255, ${(0.42 + 0.5 * t).toFixed(3)})`;
          const s = 3 + t * 1.6;
          ctx!.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }

      /* The seat. Always drawn, always filled: the point of the figure is
         that this is the thing the whole cascade arrives at. */
      const sx = 0.5 * w;
      const sy = SEAT_Y * h;
      if (seatGlow > 0) {
        const r = 10 + seatGlow * 26;
        const grd = ctx!.createRadialGradient(sx, sy, 0, sx, sy, r);
        grd.addColorStop(0, `rgba(120, 180, 255, ${(seatGlow * 0.45).toFixed(3)})`);
        grd.addColorStop(1, "rgba(120, 180, 255, 0)");
        ctx!.fillStyle = grd;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      const half = 6 + seatGlow * 1.6;
      ctx!.fillStyle = "rgba(232, 242, 255, 0.98)";
      ctx!.fillRect(sx - half, sy - half, half * 2, half * 2);
      ctx!.strokeStyle = "rgba(120, 180, 255, 0.9)";
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(sx - half, sy - half, half * 2, half * 2);
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
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

    size();

    if (reduced) {
      /* One settled frame: a field part way down, the gates drawn, the seat
         filled. The preference asks for no motion, not for an empty box. */
      for (let i = 0; i < 150; i += 1) spawn();
      for (let i = 0; i < 90; i += 1) step(0.05);
      draw();
      return;
    }

    /* Pre-roll, so the panel is never seen filling from empty: by the time it
       is first painted the cascade is already in full flow. */
    for (let i = 0; i < 120; i += 1) step(0.03);

    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    /* Off screen costs nothing. A canvas loop that keeps running while the
       section is scrolled past shows up as battery drain and never as a bug. */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVis = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return (
    <div
      className={`dp-cascade relative overflow-hidden rounded-[20px] ${className}`}
      role="img"
      aria-label="An animation of a search: candidates enter across the whole market, are filtered at successive gates, and one is placed in the seat."
    >
      <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      {/* Typeset over the paint, never drawn into it. */}
      <div aria-hidden="true" className="relative h-full w-full">
        <p className="dp-cascade-cap" style={{ top: "5%" }}>
          The market
        </p>
        {GATES.map((g) => (
          <p key={g.label} className="dp-cascade-cap" style={{ top: `calc(${g.y * 100}% + 8px)` }}>
            {g.label}
          </p>
        ))}
        <p className="dp-cascade-cap is-seat" style={{ top: `calc(${SEAT_Y * 100}% + 16px)` }}>
          Placed
        </p>
      </div>
    </div>
  );
}
