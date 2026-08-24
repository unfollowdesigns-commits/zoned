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
 * it. Trying to paint those ridges directly is the version of this that never
 * looks right, because the highlight would not move with the geometry.
 *
 * WHY IT IS PIXELS AND NOT SHAPES. There are about thirty thousand points on
 * screen. Thirty thousand arc() or fillRect() calls per frame is several times
 * the frame budget on its own, and the density is not negotiable: a few
 * thousand points reads as scattered dots, not as a surface. So the frame is
 * composed in an ImageData buffer, one to five pixel writes per point, and
 * handed to the canvas in a single putImageData. Points blend additively, which
 * is what makes a pile-up brighter than its parts and gives the ridges their
 * bloom for free.
 *
 * WHY THE HEIGHT FIELD IS FOUR TABLES. Four sine lookups per point would be
 * 120,000 Math.sin calls per frame, which is the second budget problem. The
 * field is built instead from four one-dimensional waves, one along each axis
 * and one along each diagonal, each sampled into a small table once per frame
 * and then read by index. That is about a thousand sines per frame rather than
 * 120,000, and the sum of four waves at different angles and speeds does not
 * read as any of them.
 *
 * The pointer lifts the surface under it, found by inverting the projection
 * onto the flat plane, so the bump is in the world rather than a glow painted
 * on the screen: it moves correctly with perspective, and it is smaller and
 * further away near the horizon, which a screen-space effect cannot do.
 *
 * The firm's vocabulary rides on the surface. See lib/vocabulary.ts for why
 * those particular words, and why they are different on every page.
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
/** Pointer bump: world radius and lift. */
const BUMP_R = 620;
const BUMP_H = 150;

export default function ParticleWave({
  labels,
  className = "",
  opacity = 1,
}: {
  /** The words that surface on the wave. Page specific by design. */
  labels: string[];
  className?: string;
  opacity?: number;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  /* Stringified so a caller passing an inline array literal does not re-seed
     the field on every render. */
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
    /* Label anchors, as indices into the lattice. */
    let anchors: Array<{ c: number; r: number; text: string; tw: number }> = [];

    let raf = 0;
    let running = false;
    let visible = true;
    let px = -9999;
    let py = -9999;
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

      /* Point spacing is chosen in screen terms, not world terms. About one
         column every six CSS pixels across the near edge is the density where
         the surface stops reading as dots and starts reading as a material. */
      cols = Math.max(90, Math.min(300, Math.round(w / 5)));
      /* ROW COUNT IS THE RIDGE CONTROL. The bright folds are rows piling into the
         same screen line where the surface turns edge-on, so how many rows there
         are IS how bright a fold can get. Columns only affect how solid the
         sheet looks across its width. */
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

      /* Anchored left of centre and spread through the depth slab. Left of
         centre because a word runs rightward from its anchor, and starting one
         near the right edge means it spends its life fading out against the
         frame. Spread through depth because that is the point: the same word
         set at four different distances is what makes the space read as space
         rather than as a picture of a space. */
      anchors = words.map((word, i) => ({
        c: Math.round((0.05 + (((i * 7 + 3) % 17) / 17) * 0.55) * (cols - 1)),
        r: Math.round((0.14 + (((i * 5) % 11) / 11) * 0.72) * (rows - 1)),
        text: word.toUpperCase(),
        tw: 0,
      }));
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

    /** Height at a lattice point, from the four tables. */
    function heightAt(c: number, r: number) {
      return (
        (0.5 * tx[c] + 0.35 * tz[r] + 0.45 * td[c + r] + 0.3 * te[c - r + rows]) /
        1.6
      );
    }

    function draw() {
      if (!buf || !image) return;
      buf.fill(0);
      field();

      const cx = bw / 2;
      /* The pointer, inverted back onto the flat plane, so the bump lives in the
         world. py maps to a depth, and that depth scales how far px is from the
         centre in world units. */
      let bumpX = 0;
      let bumpZ = -1e9;
      if (px > -9000) {
        const dy = py - horizon;
        if (dy > 1) {
          const z = (camH * FOCAL) / dy;
          if (z > Z_NEAR * 0.5 && z < Z_FAR * 2) {
            bumpZ = z;
            bumpX = ((px - w / 2) * z) / FOCAL;
          }
        }
      }
      const bumpR2 = BUMP_R * BUMP_R;

      for (let r = 0; r < rows; r += 1) {
        const fz = r / (rows - 1);
        /* Far rows first, so nearer points overwrite them where they land on the
           same pixel. */
        const wz = Z_FAR + (Z_NEAR - Z_FAR) * fz;
        const scale = FOCAL / wz;
        /* Depth fade. The far edge dissolves instead of ending on a hard line,
           but the floor is high: the far half of the surface is the densest part
           of the picture, and fading it to a quarter threw away the texture that
           makes the space read as deep. */
        const depth = 0.45 + 0.55 * fz;
        const dotPx = scale * res * 1.15;

        for (let c = 0; c < cols; c += 1) {
          const wx = (c / (cols - 1) - 0.5) * surfW;
          let n = heightAt(c, r);

          if (bumpZ > -1e8) {
            const ddx = wx - bumpX;
            const ddz = wz - bumpZ;
            const d2 = ddx * ddx + ddz * ddz;
            if (d2 < bumpR2) {
              const k = 1 - d2 / bumpR2;
              n += (BUMP_H / AMP) * k * k;
            }
          }

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
      labelsPass();
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

    /**
     * Projects a lattice point to CSS-pixel screen space.
     *
     * `flat` ignores the wave and projects the point onto the base plane. Used
     * for the labels' orientation, so their axis is the space's axis rather
     * than whatever the surface happens to be doing under each one.
     */
    function project(c: number, r: number, flat = false) {
      const ci = c < 0 ? 0 : c > cols - 1 ? cols - 1 : c;
      const ri = r < 0 ? 0 : r > rows - 1 ? rows - 1 : r;
      const fz = ri / (rows - 1);
      const wz = Z_FAR + (Z_NEAR - Z_FAR) * fz;
      const scale = FOCAL / wz;
      const wx = (ci / (cols - 1) - 0.5) * surfW;
      const wy = flat ? 0 : heightAt(ci, ri) * AMP;
      return {
        x: w / 2 + wx * scale,
        y: horizon + (camH - wy) * scale,
        s: scale,
      };
    }

    /**
     * The words, lying ON the surface rather than floating over it.
     *
     * THE TRANSFORM IS TAKEN FROM THE SURFACE, NOT COMPUTED FROM AN ANGLE. Two
     * neighbouring lattice points are projected, one a step along x and one a
     * step into depth, and the screen vectors between them become the text's
     * two basis vectors. That single trick gets everything at once: the type
     * shrinks correctly with distance, foreshortens as the plane recedes, and
     * tilts with the local slope of the wave, so a word sitting on a crest
     * leans the way the crest leans. Deriving it from a fixed rotation angle
     * would give flat type at a jaunty angle, which is the thing that always
     * looks stuck on rather than part of the picture.
     *
     * Canvas glyph space has y pointing down, and increasing row means nearer
     * the camera, which is also down. So the row basis is the glyph's down
     * direction with no sign fix, and the words read the right way up lying on
     * the surface.
     */
    function labelsPass() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      /* Font size is in WORLD units here, not pixels, because the matrix below
         carries screen pixels per world unit. */
      ctx!.font = "600 26px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx!.letterSpacing = "0.1em";
      ctx!.textBaseline = "middle";

      const worldPerCol = surfW / (cols - 1);
      const worldPerRow = (Z_FAR - Z_NEAR) / (rows - 1);
      const DC = 4;
      const DR = 4;
      const NEARSQ = 210 * 210;

      for (const an of anchors) {
        /* Position rides the wave. Orientation does NOT.

           Taking the basis from the surface made every word pick up whatever
           slope happened to be under it, so one leaned up, the next leaned down,
           and the set read as scattered rather than as type lying in a space.
           The basis comes from the flat plane instead, so all of them share one
           axis and converge on the same vanishing point, which is what makes
           them read as being IN the perspective. The wave still carries them up
           and down; it just no longer spins them. */
        const p0 = project(an.c, an.r);
        const p0f = project(an.c, an.r, true);
        const pu = project(an.c + DC, an.r, true);
        const pv = project(an.c, an.r + DR, true);

        /* Screen pixels per world unit, along the surface's own two axes. */
        const lx = DC * worldPerCol;
        const lz = DR * worldPerRow;
        const m11 = (pu.x - p0f.x) / lx;
        const m12 = (pu.y - p0f.y) / lx;

        /* LAID BACK, NOT LAID FLAT, AND THIS IS A LEGIBILITY FIX RATHER THAN A
           STYLE CHOICE. The surface's own depth basis foreshortens type by about
           two and a half to one at this camera, which is physically correct for
           words lying on a ground plane and unreadable at 10px. Blending that
           basis toward screen-upright keeps the depth scaling and the lean the
           surface gives it while opening the glyphs back up. Zero would be flat
           on the surface, one would be a flat billboard ignoring it. */
        const UPRIGHT = 0.6;
        const m21 = ((pv.x - p0f.x) / lz) * (1 - UPRIGHT);
        const m22 = ((pv.y - p0f.y) / lz) * (1 - UPRIGHT) + p0.s * UPRIGHT;

        if (an.tw === 0) an.tw = ctx!.measureText(an.text).width;
        /* Where the word ends, in screen space, so it can fade out before it
           reaches the frame edge rather than being sliced by it. */
        const endX = p0.x + an.tw * m11;
        const endY = p0.y + an.tw * m12;
        if (p0.x < -40 || p0.y < -40 || p0.y > h + 40) continue;

        /* Nearly invisible at rest, full near the pointer. The surface should be
           calm until someone moves, and a word should feel found rather than
           printed on the background. */
        let a = 0.12;
        const dx = p0.x - px;
        const dy = p0.y - py;
        const d2 = dx * dx + dy * dy;
        if (px > -9000 && d2 < NEARSQ) a += (1 - d2 / NEARSQ) * 0.82;

        /* Fade at every frame edge, so a word leaving the picture dissolves
           instead of being cut. */
        const edge = Math.min(
          1,
          Math.max(0, Math.min(p0.x, endX) / 48),
          Math.max(0, (w - Math.max(p0.x, endX)) / 48),
          Math.max(0, Math.min(p0.y, endY) / 40),
          Math.max(0, (h - Math.max(p0.y, endY)) / 40),
        );
        if (edge <= 0.01) continue;

        ctx!.fillStyle = `rgba(176, 208, 255, ${(a * edge).toFixed(3)})`;
        ctx!.setTransform(
          m11 * res,
          m12 * res,
          m21 * res,
          m22 * res,
          p0.x * res,
          p0.y * res,
        );
        ctx!.fillText(an.text, 0, 0);
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
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
