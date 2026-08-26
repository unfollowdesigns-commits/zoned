"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A wave surface drawn as a field of points in perspective.
 *
 * WHAT MAKES THE REFERENCE LOOK THE WAY IT DOES. The bright ridges are not
 * drawn. The surface is a regular lattice of points, and where it turns
 * edge-on to the camera a whole band of rows projects into almost the same
 * screen row, so the points pile up and that band goes bright. Density is the
 * light. Everything else follows from that: the crests glow because they are
 * where the surface folds, the troughs go dark because the points there spread
 * out, and the far side is finer than the near side because perspective packs
 * it. Painting those ridges directly is the version of this that never looks
 * right, because the highlight would not move with the geometry.
 *
 * WHY IT IS PIXELS AND NOT SHAPES. There are around fifty thousand points on
 * screen. Fifty thousand arc() or fillRect() calls per frame is several times
 * the frame budget on its own, and the density is not negotiable: a few
 * thousand points reads as scattered dots, not as a surface. So the frame is
 * composed in an ImageData buffer, one to five pixel writes per point, and
 * handed to the canvas in a single putImageData. Points blend additively, which
 * is what makes a pile-up brighter than its parts and gives the ridges their
 * bloom for free.
 *
 * WHY THE HEIGHT FIELD IS FOUR TABLES. Four sine lookups per point would be
 * 200,000 Math.sin calls per frame, which is the second budget problem. The
 * field is built instead from four one-dimensional waves, one along each axis
 * and one along each diagonal, each sampled into a small table once per frame
 * and then read by index. That is about a thousand sines per frame rather than
 * 200,000, and the sum of four waves at different angles and speeds does not
 * read as any of them.
 *
 * IT DOES NOT REACT TO THE POINTER. There was a pointer bump and a set of words
 * riding the surface; both are gone by request. Worth keeping the reason: this
 * sits behind a headline that is the actual thing to read, and a background
 * that answers the mouse invites the mouse.
 *
 * IT DOES ANSWER THE HEADLINE, AND THAT IS A DIFFERENT THING. The hero headline
 * types "finding Executives", and this field is the thing being searched: every
 * dot is the market. So the typewriter drives a search IN it, through the
 * searchApi ref below. When a word starts typing, a band of light sweeps the
 * surface and a scatter of candidates glints in its wake; when the word
 * commits, the glints die away until one remains, and that one lifts off the
 * surface and holds bright for as long as the word holds; when the word starts
 * deleting, it settles back and the field is weather again. The pointer asks
 * for attention. The headline IS the content, and the field acting it out is
 * the difference between a background and a stage.
 */

/** What the hero's typewriter is allowed to ask of the field. */
export type WaveSearchApi = {
  /** A word has started typing: sweep the field, glint the candidates. */
  search: (seed: number) => void;
  /** The word committed: collapse the glints to one and hold it. */
  resolve: () => void;
  /** The word is being erased: let the field go back to being weather. */
  release: () => void;
};

/** Candidates per search. Enough to read as a scatter, few enough that the
 *  collapse to one is a visible narrowing rather than a lottery. */
const CAND = 11;

/**
 * THE DIVE. The hero's scroll scrub drives `diveRef` from 0 to 1, and the
 * camera descends toward the surface: height falls away, the waves grow, and
 * the field goes from something looked AT to something flown INTO. This is
 * the scroll transformation that used to belong to a card of stock footage,
 * pointed at the one subject the site actually owns.
 *
 * It is a ref holding a number, not React state, read once per frame. State
 * would re-render a component whose output is a canvas that repaints itself
 * anyway, and a scrubbed value changes every scroll frame.
 */
/*
 * TUNED AGAINST THE FRAME, NOT AGAINST THE PHYSICS. The first pass gave up 62%
 * of the camera height, which is a correct descent and a bad picture: the
 * sheet's screen span is proportional to camera height, so surrendering that
 * much of it shrank the field into the bottom of the frame and left the top
 * two thirds empty. Descending should put you INSIDE the field, not above a
 * smaller copy of it.
 *
 * So the camera gives up less and the amplitude gains far more. The sheet
 * keeps its height and the crests tower past the eye line, which is what being
 * down among waves actually looks like, and the frame stays full.
 */
const DIVE_CAM = 0.42; /* how much of the camera height the dive gives up */
const DIVE_AMP = 1.6; /* how much taller the waves get at full depth */

/** Camera. Focal length and the depth slab drawn. Height is derived, see build. */
const FOCAL = 1100;
const Z_NEAR = 900;
const Z_FAR = 2600;
/** Where the flat surface meets the top and bottom of the frame, as fractions
 *  of height. Past 1 at the near edge so the surface runs out of the bottom
 *  rather than stopping inside it. */
const TOP_AT = 0.02;
const BOTTOM_AT = 1.12;
/** How much wider than the viewport the near edge of the surface runs. */
const OVERSCAN = 1.9;
/** Wave height in world units. */
const AMP = 205;

export default function ParticleWave({
  className = "",
  opacity = 1,
  searchApi,
  diveRef,
}: {
  className?: string;
  opacity?: number;
  /** Filled by this component with the search controls. See WaveSearchApi. */
  searchApi?: React.MutableRefObject<WaveSearchApi | null>;
  /** 0 flat overview, 1 down at the surface. Written by the hero's scroll
      scrub, read here once per frame. See THE DIVE above. */
  diveRef?: React.MutableRefObject<number>;
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
    let res = 1;
    let bw = 0;
    let bh = 0;
    let image: ImageData | null = null;
    let buf: Uint32Array | null = null;
    let cols = 0;
    let rows = 0;
    let surfW = 0;
    let horizon = 0;
    let camH = 0;
    /* Height field tables, rebuilt once per frame. */
    let tx = new Float32Array(0);
    let tz = new Float32Array(0);
    let td = new Float32Array(0);
    let te = new Float32Array(0);

    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let clock = 0;

    /* ---- The search ----------------------------------------------------
       One small state machine: idle, sweeping, resolved, releasing. The
       candidates are stored as FRACTIONS of the lattice, not indices, so a
       resize mid-search rebuilds the grid without stranding them. */
    const IDLE = 0;
    const SWEEPING = 1;
    const RESOLVED = 2;
    const RELEASING = 3;
    let phase = IDLE;
    let sweepX = 0;
    let pendingResolve = false;
    let lift = 0;
    const candFx = new Float32Array(CAND);
    const candFr = new Float32Array(CAND);
    const candGlow = new Float32Array(CAND);
    /* Which candidate the search closes on. Always the one placed inside the
       card's resting frame, so the resolution happens in the framed part of
       the picture rather than behind the headline. */
    const CHOSEN = 0;

    function beginSearch(seed: number) {
      /* mulberry32, inline: the scatter must be identical for a given word so
         the figure is art-directable, and different between words so each
         search reads as a different search. */
      let a = (seed * 0x9e3779b9) | 0;
      const rand = () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      for (let i = 0; i < CAND; i += 1) {
        /* Kept off the extreme edges, and out of the far quarter where a
           glint is smaller than a pixel. */
        candFx[i] = 0.14 + rand() * 0.72;
        candFr[i] = 0.3 + rand() * 0.5;
      }
      /* The chosen one lands mid-frame: inside the resting card, clear of the
         headline block on the left. */
      candFx[CHOSEN] = 0.44 + rand() * 0.14;
      candFr[CHOSEN] = 0.52 + rand() * 0.1;
      phase = SWEEPING;
      sweepX = -0.08;
      pendingResolve = false;
    }

    function requestResolve() {
      if (phase === SWEEPING) pendingResolve = true;
      else if (phase === IDLE || phase === RELEASING) {
        /* Resolve with no sweep under way (the first word mounts already
           typed): run the sweep anyway and close on it, so a resolution is
           never shown without the search that produced it. */
        beginSearch(1);
        pendingResolve = true;
      }
    }

    function releaseSearch() {
      if (phase !== IDLE) phase = RELEASING;
      pendingResolve = false;
    }

    /** Advance glints, lift and the sweep front by dt seconds. */
    function stepSearch(dt: number) {
      if (phase === SWEEPING) {
        sweepX += dt / 1.15;
        for (let i = 0; i < CAND; i += 1) {
          /* The sweep IGNITES a glint as its front crosses the candidate:
             cause, then effect, in that order and visibly. */
          if (sweepX >= candFx[i] && candGlow[i] < 0.999) candGlow[i] = 1;
        }
        if (sweepX > 1.12) phase = pendingResolve ? RESOLVED : RELEASING;
      }
      for (let i = 0; i < CAND; i += 1) {
        if (phase === RESOLVED && i === CHOSEN) {
          candGlow[i] = Math.min(1, candGlow[i] + dt * 3);
        } else {
          /* The also-rans fade at a pace the eye can follow. The narrowing IS
             the picture; instantaneous would read as a glitch. */
          candGlow[i] -= candGlow[i] * dt * 1.9;
        }
      }
      const liftTarget = phase === RESOLVED ? 1 : 0;
      lift += (liftTarget - lift) * Math.min(1, dt * 3.2);
      if (phase === RELEASING && lift < 0.01) {
        let sum = 0;
        for (let i = 0; i < CAND; i += 1) sum += candGlow[i];
        if (sum < 0.02) phase = IDLE;
      }
    }

    function build() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      res = Math.min(2, window.devicePixelRatio || 1);
      bw = Math.round(w * res);
      bh = Math.round(h * res);
      canvas!.width = bw;
      canvas!.height = bh;

      image = ctx!.createImageData(bw, bh);
      buf = new Uint32Array(image.data.buffer);

      /* Point spacing is chosen in screen terms, not world terms: about one
         column every five CSS pixels across the near edge is the density where
         the surface stops reading as dots and starts reading as a material. */
      cols = Math.max(90, Math.min(300, Math.round(w / 5)));
      /* ROW COUNT IS THE RIDGE CONTROL. The bright folds are rows piling into
         the same screen line where the surface turns edge-on, so how many rows
         there are IS how bright a fold can get. Columns only affect how solid
         the sheet looks across its width. */
      rows = Math.max(70, Math.min(230, Math.round(h / 5)));
      surfW = (OVERSCAN * w * Z_NEAR) / FOCAL;

      /* CAMERA HEIGHT IS SOLVED FOR, NOT PICKED. A fixed height puts the flat
         surface wherever the arithmetic lands, which at 900px tall left the
         bottom third of the frame empty. Given where the near and far edges
         should sit, there is exactly one camera height that puts them there:
         y(z) = horizon + camH * FOCAL / z, so the near-to-far screen span is
         camH * FOCAL * (1/Z_NEAR - 1/Z_FAR). Solve that for camH and the
         surface fills any viewport it is given. */
      camH = (h * (BOTTOM_AT - TOP_AT)) / (FOCAL * (1 / Z_NEAR - 1 / Z_FAR));
      horizon = h * TOP_AT - (camH * FOCAL) / Z_FAR;

      tx = new Float32Array(cols);
      tz = new Float32Array(rows);
      td = new Float32Array(cols + rows);
      te = new Float32Array(cols + rows);
    }

    function field() {
      const t = clock;
      for (let c = 0; c < cols; c += 1) tx[c] = Math.sin(c * 0.055 + t * 0.9);
      for (let r = 0; r < rows; r += 1) tz[r] = Math.sin(r * 0.085 - t * 0.62);
      for (let k = 0; k < cols + rows; k += 1) {
        td[k] = Math.sin(k * 0.041 + t * 0.44);
        te[k] = Math.sin(k * 0.032 - t * 0.31);
      }
    }

    /** Per-column sweep brightening, rebuilt only while a sweep is running. */
    let sweepBoost = new Float32Array(0);

    function draw() {
      if (!buf || !image) return;
      buf.fill(0);
      field();

      if (sweepBoost.length !== cols) sweepBoost = new Float32Array(cols);
      if (phase === SWEEPING) {
        for (let c = 0; c < cols; c += 1) {
          /* A soft gaussian band around the front. Column-only on purpose:
             one exp per column per frame is nothing, one per point is 50k. */
          const d = (c / (cols - 1) - sweepX) / 0.055;
          sweepBoost[c] = Math.exp(-d * d);
        }
      } else if (sweepBoost[0] !== 0 || sweepBoost[cols - 1] !== 0) {
        sweepBoost.fill(0);
      }

      const cx = bw / 2;

      /* THE DIVE, SOLVED PER FRAME. At 0 these are exactly the built camera.
         As it runs to 1 the camera height falls away and the horizon is
         re-solved by pinning the NEAR edge instead of the far one, so the
         whole sheet sinks and compresses toward the foot of the frame the way
         ground does when descending toward it, while the amplitude grows
         against the shrinking camera height until the crests tower past the
         eye line. Two multiplies and a divide per frame: the cost of the
         entire transformation. */
      const dive = diveRef ? Math.min(1, Math.max(0, diveRef.current)) : 0;
      const dCamH = camH * (1 - DIVE_CAM * dive);
      const dHorizon = dive === 0 ? horizon : h * BOTTOM_AT - (dCamH * FOCAL) / Z_NEAR;
      const dAmp = AMP * (1 + DIVE_AMP * dive);
      /* Nearer means brighter and coarser: the light and the dot size both
         gain with depth so the descent is felt in the material, not only in
         the geometry. */
      const dGain = 1 + 0.35 * dive;

      for (let r = 0; r < rows; r += 1) {
        const fz = r / (rows - 1);
        /* Far rows first, so nearer points land on top where they share a
           pixel. */
        const wz = Z_FAR + (Z_NEAR - Z_FAR) * fz;
        const scale = FOCAL / wz;
        /* Depth fade. The far edge dissolves instead of ending on a hard line,
           but the floor is high: the far half of the surface is the densest
           part of the picture, and fading it to a quarter threw away the
           texture that makes the space read as deep. */
        const depth = 0.45 + 0.55 * fz;
        const dotPx = scale * res * 1.15 * (1 + 0.35 * dive);

        for (let c = 0; c < cols; c += 1) {
          const wx = (c / (cols - 1) - 0.5) * surfW;
          const n =
            (0.5 * tx[c] + 0.35 * tz[r] + 0.45 * td[c + r] + 0.3 * te[c - r + rows]) /
            1.6;

          const wy = n * dAmp;
          const sx = cx + wx * scale * res;
          const sy = (dHorizon + (dCamH - wy) * scale) * res;
          if (sx < 0 || sx >= bw || sy < 0 || sy >= bh) continue;

          /* Crests carry the colour and most of the light, but the troughs have
             to stay legible as a surface. A cube here crushed the mid tones so
             far that the sheet read as empty space with a few lit specks: at
             the average height it returned about an eighth of full brightness.
             A square with a real floor keeps the dark blue texture visible and
             still lets the crests be the event. */
          const t = n * 0.5 + 0.5;
          const t2 = t * t;
          /* The sweep lifts whatever it is passing over: the light finds the
             surface, the surface does not light itself. */
          const sw = sweepBoost[c];
          const inten = depth * (0.28 + 0.72 * t2) * (1 + sw * 0.85) * dGain;

          /* Deep blue in the troughs, cyan on the crests, whitened briefly
             under the sweep. */
          /* Clamped per channel: a value past 255 would bleed into the next
             channel when packed. */
          const rr = Math.min(255, (14 + 76 * t2 + sw * 90) | 0);
          const gg = Math.min(255, (52 + 158 * t2 + sw * 60) | 0);
          const bb = Math.min(255, (112 + 143 * t2 + sw * 40) | 0);
          const a = Math.min(255, (inten * 235) | 0);
          if (a < 3) continue;

          const ix = sx | 0;
          const iy = sy | 0;
          plot(ix, iy, rr, gg, bb, a);
          /* A soft splat so near points read as points rather than as single
             pixels, and so bright ones bloom. Far points are smaller than a
             pixel and splatting them only fogs the horizon. */
          if (dotPx > 1) {
            const s = (a * 0.42) | 0;
            plot(ix + 1, iy, rr, gg, bb, s);
            plot(ix - 1, iy, rr, gg, bb, s);
            plot(ix, iy + 1, rr, gg, bb, s);
            plot(ix, iy - 1, rr, gg, bb, s);
          }
        }
      }

      /* ---- The candidates, over the surface --------------------------------
         Drawn after the field so they sit on top of it, at the exact height the
         surface has THIS frame: a glint that rode its own curve would detach
         from the wave the moment it moved. The chosen one, once resolved,
         lifts off the surface on a visible stem, which is the difference
         between "a bright dot" and "one taken out of the field". */
      for (let i = 0; i < CAND; i += 1) {
        const glow = candGlow[i];
        if (glow < 0.03) continue;
        const c = Math.round(candFx[i] * (cols - 1));
        const r = Math.round(candFr[i] * (rows - 1));
        const fz = r / (rows - 1);
        const wz = Z_FAR + (Z_NEAR - Z_FAR) * fz;
        const scale = FOCAL / wz;
        const wx = (candFx[i] - 0.5) * surfW;
        const n =
          (0.5 * tx[c] + 0.35 * tz[r] + 0.45 * td[c + r] + 0.3 * te[c - r + rows]) /
          1.6;
        const liftW = i === CHOSEN ? lift * 120 : 0;
        const sx = (cx + wx * scale * res) | 0;
        const syS = ((dHorizon + (dCamH - n * dAmp) * scale) * res) | 0;
        const sy = ((dHorizon + (dCamH - n * dAmp - liftW) * scale) * res) | 0;

        const a = Math.min(255, (glow * 255) | 0);
        const half = (a * 0.45) | 0;
        /* THE RESOLUTION IS THE EVENT, SO IT IS ALLOWED TO BE BRIGHT. A glint
           and the chosen seat at the same size made the one moment the loop
           builds to indistinguishable from the also-rans. Once the lift is
           under way the chosen point gains a halo ring and a wider bloom,
           scaled by the lift itself so it grows as the seat rises. */
        if (i === CHOSEN && lift > 0.15) {
          const ring = (a * 0.32 * lift) | 0;
          const soft = (a * 0.14 * lift) | 0;
          for (let dx = -3; dx <= 3; dx += 1) {
            for (let dy = -3; dy <= 3; dy += 1) {
              const d2 = dx * dx + dy * dy;
              if (d2 <= 4) continue; /* the core below draws this part */
              if (d2 <= 9) plot(sx + dx, sy + dy, 170, 215, 255, ring);
              else if (d2 <= 16) plot(sx + dx, sy + dy, 120, 180, 255, soft);
            }
          }
        }
        /* Near-white, warm side of the palette's cyan: the one thing in the
           field that is not field-coloured. */
        plot(sx, sy, 235, 248, 255, a);
        plot(sx + 1, sy, 225, 244, 255, a);
        plot(sx - 1, sy, 225, 244, 255, a);
        plot(sx, sy + 1, 225, 244, 255, a);
        plot(sx, sy - 1, 225, 244, 255, a);
        plot(sx + 2, sy, 160, 210, 255, half);
        plot(sx - 2, sy, 160, 210, 255, half);
        plot(sx, sy + 2, 160, 210, 255, half);
        plot(sx, sy - 2, 160, 210, 255, half);
        plot(sx + 1, sy + 1, 160, 210, 255, half);
        plot(sx - 1, sy + 1, 160, 210, 255, half);
        plot(sx + 1, sy - 1, 160, 210, 255, half);
        plot(sx - 1, sy - 1, 160, 210, 255, half);

        /* The stem: a dotted vertical from the surface point up to the lifted
           seat, so the lift reads as a distance rather than a relocation. */
        if (liftW > 4) {
          const span = syS - sy;
          const steps = Math.max(2, (span / (5 * res)) | 0);
          for (let s = 1; s < steps; s += 1) {
            const yy = (sy + (span * s) / steps) | 0;
            plot(sx, yy, 150, 200, 255, (a * 0.35) | 0);
          }
        }
      }

      ctx!.putImageData(image, 0, 0);
    }

    /** Additive into the frame buffer. Pile-ups are what make the ridges. */
    function plot(x: number, y: number, r: number, g: number, b: number, a: number) {
      if (x < 0 || y < 0 || x >= bw || y >= bh) return;
      const i = y * bw + x;
      const o = buf![i];
      const oa = (o >>> 24) & 255;
      let na = oa + a;
      if (na > 255) na = 255;
      const or_ = o & 255;
      const og = (o >>> 8) & 255;
      const ob = (o >>> 16) & 255;
      buf![i] =
        ((na << 24) |
          ((b > ob ? b : ob) << 16) |
          ((g > og ? g : og) << 8) |
          (r > or_ ? r : or_)) >>>
        0;
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
      last = now;
      clock += dt;
      stepSearch(dt);
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
    /* The controls the typewriter drives. Under reduced motion they are
       no-ops rather than absent, so the caller never has to know. */
    if (searchApi) {
      searchApi.current = reduced
        ? { search: () => {}, resolve: () => {}, release: () => {} }
        : { search: beginSearch, resolve: requestResolve, release: releaseSearch };
    }
    if (reduced) {
      draw();
      return () => {
        if (searchApi) searchApi.current = null;
      };
    }

    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    /* Off screen costs nothing. A full viewport rAF that keeps running while
       the surface is scrolled past is the version of this that shows up as
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
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (searchApi) searchApi.current = null;
    };
  }, [reduced, searchApi]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}
