"use client";

import { CLIENTS } from "@/lib/site";

export default function Clients() {
  return (
    <section className="py-14" aria-label="Selected clients">
      <div className="v-marquee relative overflow-hidden">
        {/* edge fades so names enter and leave rather than being cut */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--v-bg)] to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--v-bg)] to-transparent"
          aria-hidden="true"
        />
        <div className="v-marquee-track">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 items-center gap-14 pr-14"
              aria-hidden={copy === 1}
            >
              {CLIENTS.map((name) => (
                <li
                  key={name}
                  className="v-display whitespace-nowrap text-[19px] tracking-tight text-[var(--v-muted)] transition-colors duration-200 hover:text-[var(--v-ink)]"
                >
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
