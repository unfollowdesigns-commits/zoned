"use client";

import Link from "next/link";
import { useState } from "react";
import type { ServiceKey } from "@/content/services/types";
import { ServiceGlyph } from "@/components/ServiceGlyph";

type Item = { key: ServiceKey; title: string; tagline: string; href: string };

// Star positions (percent of the stage) — an ascending arc like a rising constellation.
const POS: Record<ServiceKey, [number, number]> = {
  natal: [9, 68],
  psychological: [24, 34],
  relational: [39, 62],
  karmic: [53, 22],
  progressed: [66, 58],
  degrees: [80, 30],
  healing: [92, 66],
};
const EDGES: [ServiceKey, ServiceKey][] = [
  ["natal", "psychological"],
  ["psychological", "relational"],
  ["relational", "karmic"],
  ["karmic", "progressed"],
  ["progressed", "degrees"],
  ["degrees", "healing"],
  ["natal", "relational"],
  ["karmic", "degrees"],
  ["relational", "progressed"],
];

export function Constellation({ items, rtl, cta }: { items: Item[]; rtl: boolean; cta: string }) {
  const [active, setActive] = useState<ServiceKey>("natal");
  const pos = (k: ServiceKey): [number, number] => (rtl ? [100 - POS[k][0], POS[k][1]] : POS[k]);
  const current = items.find((i) => i.key === active)!;

  return (
    <div>
      {/* Desktop: interactive sky */}
      <div className="relative hidden aspect-[2.3/1] w-full md:block" data-reveal="fade">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 230 100" aria-hidden="true">
          {EDGES.map(([a, b], i) => {
            const [x1, y1] = pos(a);
            const [x2, y2] = pos(b);
            const lit = a === active || b === active;
            return (
              <line
                key={i}
                x1={x1 * 2.3}
                y1={y1}
                x2={x2 * 2.3}
                y2={y2}
                className="draw transition-[stroke-opacity] duration-700"
                stroke="#cfae76"
                strokeOpacity={lit ? 0.75 : 0.22}
                strokeWidth={lit ? 0.22 : 0.15}
                pathLength={1000}
                style={{ ["--d" as string]: `${i * 140}ms` }}
              />
            );
          })}
        </svg>
        {items.map((it, i) => {
          const [x, y] = pos(it.key);
          const on = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              onMouseEnter={() => setActive(it.key)}
              onFocus={() => setActive(it.key)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="relative grid h-16 w-16 place-items-center">
                <span className={`absolute inset-0 rounded-full bg-gold/20 blur-xl transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`} />
                <span className={`absolute rounded-full border border-gold/40 transition-all duration-700 ${on ? "h-16 w-16 opacity-100" : "h-6 w-6 opacity-0"}`} />
                <span
                  className={`relative rounded-full bg-gold-bright shadow-[0_0_24px_6px_rgba(236,211,159,0.55)] transition-all duration-500 ${on ? "h-3.5 w-3.5" : "h-2 w-2"}`}
                  style={{ animation: `float-y ${5 + i}s ease-in-out infinite` }}
                />
              </span>
              <span
                className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-display text-lg transition-colors duration-500 ${
                  on ? "text-gold-bright" : "text-ivory/70 group-hover:text-ivory"
                }`}
              >
                {it.title}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 hidden items-center justify-between gap-10 border-t border-line pt-8 md:flex" aria-live="polite">
        <div className="flex items-center gap-6">
          <ServiceGlyph k={current.key} className="h-14 w-14 text-gold" />
          <div>
            <p className="font-display text-3xl text-ivory">{current.title}</p>
            <p className="mt-1 max-w-xl text-mist">{current.tagline}</p>
          </div>
        </div>
        <Link href={current.href} className="btn btn-ghost shrink-0">
          {cta} <span className="rtl-flip">→</span>
        </Link>
      </div>

      {/* Mobile: list */}
      <ul className="grid gap-3 md:hidden">
        {items.map((it, i) => (
          <li key={it.key} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
            <Link href={it.href} className="card flex items-center gap-4 p-5">
              <ServiceGlyph k={it.key} className="h-10 w-10 shrink-0 text-gold" />
              <span>
                <span className="block font-display text-xl text-ivory">{it.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-mist">{it.tagline}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
