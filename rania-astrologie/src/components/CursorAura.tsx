"use client";

import { useEffect, useRef } from "react";

/** A soft golden halo that trails the cursor on precise pointers. */
export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, raf = 0, scale = 1, ts = 1;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;
      ts = t?.closest?.("a, button, [role=button], input, select, textarea, label") ? 2.2 : 1;
      el.style.opacity = "1";
    };
    const onLeave = () => (el.style.opacity = "0");
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      scale += (ts - scale) * 0.12;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-8 w-8 rounded-full border border-gold/50 opacity-0 mix-blend-screen transition-opacity duration-500 [@media(pointer:fine)]:block"
      style={{ boxShadow: "0 0 40px 6px rgba(207,174,118,0.18)" }}
    />
  );
}
