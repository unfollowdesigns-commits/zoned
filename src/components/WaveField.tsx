"use client";

// Animated particle wave field, a dot mesh displaced by layered sine waves and
// projected in perspective, so it reads as luminous terrain receding into the
// distance. Canvas rather than DOM: a few thousand points at 60fps costs
// nothing, where the equivalent in elements would not be viable.
//
// Behaviour contract:
//   - purely decorative: fixed, pointer-events:none, aria-hidden, behind content
//   - never contributes to layout or scroll width (position: fixed + clipped)
//   - pauses when the tab is hidden, and renders a single static frame for
//     visitors who asked for reduced motion

import * as React from "react";

interface WaveFieldProps {
  /** Vertical share of the viewport the field occupies, from the bottom. */
  height?: number;
  /** Global opacity of the whole field. */
  opacity?: number;
  className?: string;
}

export function WaveField({ height = 0.86, opacity = 1, className }: WaveFieldProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;

    // The palette, sampled by wave height. RE-SKINNED for District Partners:
    // five steps of --v-primary (#3e7bfa), darkest first. Kept inside the
    // palette deliberately: the crests are exactly where the eye lands, so
    // running the ramp on into cyan or mint would make the brightest, most
    // saturated colour in the field one that appears nowhere else on the site.
    const RAMP: [number, number, number][] = [
      [16, 26, 74],
      [34, 58, 152],
      [62, 123, 250],
      [92, 152, 252],
      [124, 178, 255],
    ];
    function ramp(t: number): [number, number, number] {
      const x = Math.max(0, Math.min(0.999, t)) * (RAMP.length - 1);
      const i = Math.floor(x);
      const f = x - i;
      const a = RAMP[i];
      const b = RAMP[Math.min(RAMP.length - 1, i + 1)];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = Math.round(window.innerHeight * height);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with viewport but stays bounded so phones stay smooth.
      cols = Math.max(38, Math.min(132, Math.round(w / 13)));
      rows = Math.max(22, Math.min(64, Math.round(h / 13)));
    }

    function frame(now: number) {
      if (!running) return;
      const t = reduce ? 8 : now / 1000;

      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      const horizon = h * 0.06;
      const depthSpan = h * 0.98;

      for (let j = 0; j < rows; j++) {
        // v: 0 at the far horizon, 1 nearest the viewer.
        const v = j / (rows - 1);
        // Non-linear so rows bunch toward the horizon, that's the perspective.
        const vv = Math.pow(v, 1.75);
        const persp = 0.28 + v * 0.72;
        const baseY = horizon + vv * depthSpan;

        for (let i = 0; i < cols; i++) {
          const u = i / (cols - 1);
          const x0 = (u - 0.5) * 2;

          // Layered travelling waves. Frequencies are mutually irrational-ish so
          // the field never visibly repeats.
          const z =
            Math.sin(x0 * 2.4 + t * 0.55 + v * 3.1) * 0.5 +
            Math.sin(v * 4.3 - t * 0.42 + x0 * 1.2) * 0.34 +
            Math.sin((x0 + v) * 3.7 - t * 0.31) * 0.22;

          const sx = w * 0.5 + x0 * w * 0.68 * persp;
          const sy = baseY - z * (h * 0.26) * persp;

          if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

          // Crest height drives colour and glow; distance drives size/opacity.
          const crest = (z + 1.06) / 2.12;
          // Sharpen the ramp so wave crests read as bright ribbons rather than
          // an evenly-lit haze, this is what gives the field its structure.
          const lit = Math.pow(crest, 2.1);
          const [r, g, b] = ramp(crest * 0.9 + v * 0.1);
          // Halved from its first value. This is a backdrop: at the old peak of
          // 0.98, with "lighter" compositing stacking overlaps on top, the
          // crests were competing with body text rather than sitting behind it.
          const alpha = (0.04 + lit * 0.44) * (0.28 + persp * 0.72);
          const size = (0.7 + lit * 2.0) * persp;

          ctx!.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
          ctx!.fillRect(sx, sy, size, size);
        }
      }

      ctx!.globalCompositeOperation = "source-over";
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduce) start();
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [height]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        zIndex: -3,
        pointerEvents: "none",
        opacity,
        // Fade the field out toward the top so it merges into the page.
        maskImage:
          "linear-gradient(to top, rgba(0,0,0,0.9) 8%, rgba(0,0,0,0.5) 46%, transparent 88%)",
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0,0,0,0.9) 8%, rgba(0,0,0,0.5) 46%, transparent 88%)",
      }}
    />
  );
}

export default WaveField;
