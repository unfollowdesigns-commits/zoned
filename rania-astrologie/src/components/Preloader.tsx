"use client";

import { useEffect, useState } from "react";

/** First-visit intro: a constellation draws itself, then the sky opens. Skipped on later visits. */
export function Preloader() {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("rania:intro") === "1";
      sessionStorage.setItem("rania:intro", "1");
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) document.documentElement.style.setProperty("--intro", "0ms");
    const t1 = setTimeout(() => setState("leaving"), seen || reduced ? 0 : 1700);
    const t2 = setTimeout(() => setState("gone"), seen || reduced ? 300 : 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (state === "gone") return null;
  const pts: [number, number][] = [[20, 70], [38, 40], [58, 52], [76, 26], [94, 44], [112, 30], [128, 62]];
  return (
    <div
      aria-hidden="true"
      style={{ animation: "intro-out .8s 3.2s forwards" }}
      className={`fixed inset-0 z-[90] grid place-items-center bg-ink transition-opacity duration-1000 ${state === "leaving" ? "opacity-0" : "opacity-100"}`}
    >
      <div className={`flex flex-col items-center transition-transform duration-1000 ${state === "leaving" ? "scale-110" : ""}`}>
        <svg viewBox="0 0 148 90" className="w-48 text-gold-bright">
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".6"
            strokeWidth=".6"
            strokeDasharray="200"
            strokeDashoffset="200"
            style={{ animation: "intro-draw 1.6s cubic-bezier(.16,1,.3,1) forwards" }}
          />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 3 ? 2.2 : 1.3} fill="currentColor" style={{ opacity: 0, animation: `intro-star .6s ${i * 0.16}s forwards` }} />
          ))}
        </svg>
        <p className="mt-6 font-display text-2xl tracking-[0.5em] text-ivory/90" style={{ opacity: 0, animation: "intro-star 1s .6s forwards" }}>
          RANIA
        </p>
      </div>
      <style>{`@keyframes intro-draw{to{stroke-dashoffset:0}}@keyframes intro-star{to{opacity:1}}@keyframes intro-out{to{opacity:0;visibility:hidden}}`}</style>
    </div>
  );
}
