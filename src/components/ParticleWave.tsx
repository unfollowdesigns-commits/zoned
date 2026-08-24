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
 * IT IS A BACKGROUND, AND IT DOES NOT REACT. There was a pointer bump and a set
 * of words riding the surface; both are gone by request. Worth keeping the
 * reason: this sits behind a headline that is the actual thing to read, and a
 * background that answers the mouse invites the mouse. Nothing here needs
 * anyone's attention, so nothing here asks for it.
 */

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

    function draw() {
      if (!buf || !image) return;
      buf.fill(0);
      field();

      const cx = bw / 2;

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
        const dotPx = scale * res * 1.15;

        for (let c = 0; c < cols; c += 1) {
          const wx = (c / (cols - 1) - 0.5) * surfW;
          const n =
            (0.5 * tx[c] + 0.35 * tz[r] + 0.45 * td[c + r] + 0.3 * te[c - r + rows]) /
            1.6;

          const wy = n * AMP;
          const sx = cx + wx * scale * res;
          const sy = (horizon + (camH - wy) * scale) * res;
          if (sx < 0 || sx >= bw || sy < 0 || sy >= bh) continue;

          /* Crests carry the colour and most of the light, but the troughs have
             to stay legible as a surface. A cube here crushed the mid tones so
             far that the sheet read as empty space with a few lit specks: at
             the average height it returned about an eighth of full brightness.
             A square with a real floor keeps the dark blue texture visible and
             still lets the crests be the event. */
          const t = n * 0.5 + 0.5;
          const t2 = t * t;
          const inten = depth * (0.28 + 0.72 * t2);

          /* Deep blue in the troughs, cyan on the crests. */
          const rr = (14 + 76 * t2) | 0;
          const gg = (52 + 158 * t2) | 0;
          const bb = (112 + 143 * t2) | 0;
          const a = (inten * 235) | 0;
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
