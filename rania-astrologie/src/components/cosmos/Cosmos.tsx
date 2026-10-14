"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Engine } from "./engine";
import { modeFromPath } from "./modes";

export default function Cosmos({ rtl }: { rtl: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const pathname = usePathname();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
    const onLost = () => setFailed(true);
    canvas.addEventListener("cosmos:lost", onLost);

    // Start the cosmos once the page is idle so it never competes with first paint.
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 300);
    const load = () => import("./engine");
    const ready = new Promise<Awaited<ReturnType<typeof load>>>((resolve, reject) => idle(() => load().then(resolve, reject)));
    ready
      .then(({ createEngine }) => {
        if (cancelled) return;
        try {
          // `?cosmos=force` renders even on software GL (QA screenshots only).
          const force = new URLSearchParams(window.location.search).get("cosmos") === "force";
          engineRef.current = createEngine(canvas, { reducedMotion, mobile, rtl, force });
          engineRef.current.setMode(modeFromPath(window.location.pathname), rtl);
          requestAnimationFrame(() => setReady(true));
        } catch (e) {
          console.warn("[cosmos] WebGL unavailable, using static sky.", e);
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      canvas.removeEventListener("cosmos:lost", onLost);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    // The engine lives for the whole session; mode/direction updates go through setMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setMode(modeFromPath(pathname), rtl);
  }, [pathname, rtl]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 cosmos-fallback">
      {!failed && (
        <canvas
          ref={canvasRef}
          className="block h-[100lvh] w-full transition-opacity duration-[2000ms]"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}
      <div className="vignette" />
    </div>
  );
}
