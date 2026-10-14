"use client";

import { useEffect, useRef, useState } from "react";

type Step = { title: string; body: string };

/**
 * Pinned section: an engraved dial turns one notch per method step as the visitor scrolls.
 * Degrees are drawn around it — the method is literally "degree by degree".
 */
export function MethodDial({ steps, kicker, title }: { steps: Step[]; kicker: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const n = steps.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const index = Math.min(n - 1, Math.floor(progress * n * 0.999));
  const rotation = -progress * (360 - 360 / n);

  const ticks = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2;
    const len = i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5;
    return { x1: 200 + Math.cos(a) * 180, y1: 200 + Math.sin(a) * 180, x2: 200 + Math.cos(a) * (180 - len), y2: 200 + Math.sin(a) * (180 - len), major: i % 10 === 0 };
  });

  return (
    <>
      {/* Desktop pinned experience */}
      <div ref={ref} className="relative hidden md:block" style={{ height: `${n * 70 + 60}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center">
          <div className="container-x grid w-full grid-cols-12 items-center gap-10">
            <div className="col-span-5">
              <p className="eyebrow">{kicker}</p>
              <h2 className="t-2 mt-5 text-ivory">{title}</h2>
              <div className="relative mt-12 min-h-[11rem]">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out-expo)]"
                    style={{
                      opacity: i === index ? 1 : 0,
                      transform: `translateY(${(i - index) * 18}px)`,
                      filter: i === index ? "none" : "blur(4px)",
                    }}
                    aria-hidden={i !== index}
                  >
                    <p className="font-display text-gold-bright text-lg">
                      {String(i + 1).padStart(2, "0")} <span className="text-faint">/ {String(n).padStart(2, "0")}</span>
                    </p>
                    <h3 className="t-3 mt-3 text-ivory">{s.title}</h3>
                    <p className="mt-3 max-w-md text-mist">{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-1.5">
                {steps.map((_, i) => (
                  <span key={i} className={`h-px flex-1 transition-colors duration-500 ${i <= index ? "bg-gold" : "bg-line"}`} />
                ))}
              </div>
            </div>
            <div className="col-span-7 flex justify-center">
              <div className="relative aspect-square w-full max-w-[560px]">
                <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-gold" aria-hidden="true">
                  <defs>
                    <radialGradient id="dialGlow">
                      <stop offset="0" stopColor="#ecd39f" stopOpacity=".18" />
                      <stop offset="1" stopColor="#ecd39f" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="200" cy="200" r="150" fill="url(#dialGlow)" />
                  <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "200px 200px", transition: "transform 0.25s linear" }}>
                    <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth=".7" />
                    <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth=".6" />
                    {ticks.map((t, i) => (
                      <line key={i} {...t} stroke="currentColor" strokeOpacity={t.major ? 0.8 : 0.35} strokeWidth={t.major ? 0.9 : 0.6} />
                    ))}
                    {steps.map((_, i) => {
                      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                      const on = i === index;
                      return (
                        <g key={i}>
                          <line x1={200} y1={200} x2={200 + Math.cos(a) * 150} y2={200 + Math.sin(a) * 150} stroke="currentColor" strokeOpacity={on ? 0.7 : 0.12} strokeWidth=".6" />
                          <circle cx={200 + Math.cos(a) * 150} cy={200 + Math.sin(a) * 150} r={on ? 6 : 3} fill={on ? "#ecd39f" : "#cfae76"} fillOpacity={on ? 1 : 0.5} style={{ transition: "r .5s, fill-opacity .5s" }} />
                          <text
                            x={200 + Math.cos(a) * 118}
                            y={200 + Math.sin(a) * 118}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="13"
                            fill="currentColor"
                            fillOpacity={on ? 1 : 0.4}
                            transform={`rotate(${-rotation} ${200 + Math.cos(a) * 118} ${200 + Math.sin(a) * 118})`}
                            className="font-display"
                          >
                            {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][i]}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                  <polygon points="200,10 195,0 205,0" fill="#ecd39f" />
                  <circle cx="200" cy="200" r="3" fill="#ecd39f" />
                  <text x="200" y="232" textAnchor="middle" fontSize="11" letterSpacing="3" fill="#a9a3b8">
                    {Math.round(progress * 360)}°
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: simple list */}
      <div className="container-x md:hidden">
        <p className="eyebrow" data-reveal>{kicker}</p>
        <h2 className="t-2 mt-5 text-ivory" data-reveal>{title}</h2>
        <ol className="mt-10 space-y-8">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-5" data-reveal style={{ ["--d" as string]: `${i * 50}ms` }}>
              <span className="font-display text-xl text-gold-bright">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-2xl text-ivory">{s.title}</span>
                <span className="mt-1 block text-mist">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
