"use client";

import { CLIENTS } from "@/lib/site";
import { Marquee } from "@/kit/components/Interactions";

/**
 * Client wordmarks.
 *
 * A marquee is for texture, never for information: a ticker you cannot read at
 * speed and cannot stop is decoration wearing the costume of content. These are
 * names rather than claims, the strip pauses on hover, and the full list is
 * readable in the footer, so nothing here is only available in motion.
 */
export default function Clients() {
  return (
    <section className="py-16" aria-label="Selected clients">
      <Marquee speed={46}>
        {CLIENTS.map((name) => (
          <span
            key={name}
            className="v-display whitespace-nowrap px-7 text-[length:var(--t-heading)] tracking-tight text-[var(--v-muted)] transition-colors duration-200 hover:text-[var(--v-ink)]"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
