"use client";

import { CLIENT_LOGOS } from "@/lib/proof";
import { Marquee } from "@/kit/components/Interactions";

/**
 * Client logos.
 *
 * A marquee is for texture, never for information: a ticker you cannot read at
 * speed and cannot stop is decoration wearing the costume of content. These are
 * names rather than claims, the strip pauses on hover, and the full list is
 * readable in the footer, so nothing here is only available in motion.
 *
 * EACH ENTRY RENDERS AS A LOGO THE MOMENT ITS FILE EXISTS, and as type until
 * then. That mixed state is deliberate rather than a compromise: logos can
 * arrive one at a time, and waiting for all eight before any of them shows
 * would mean the strip stays a row of words for as long as the slowest legal
 * approval takes.
 *
 * The name set in type is a placeholder, not a design. A wall of company names
 * in the body face is what a site does when it could not get the logos, and it
 * reads that way to anyone who has seen a real one. See CONTENT-NEEDED.md.
 */
export default function Clients() {
  return (
    <section className="py-16" aria-label="Selected clients">
      <Marquee speed={46}>
        {CLIENT_LOGOS.map((client) =>
          client.file ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={client.name}
              src={`/logos/${client.file}`}
              alt={client.name}
              loading="lazy"
              /* Height-constrained, width auto. Logos arrive at wildly different
                 aspect ratios, and constraining the width instead makes a wide
                 wordmark tiny next to a square mark. Optical sizing by height is
                 what makes a mixed set look like one row.

                 Desaturated and dimmed at rest, true colour on hover: eight
                 brand palettes at full strength in one strip fights everything
                 else on the page and makes the row read as advertising. */
              className="mx-7 h-7 w-auto max-w-[170px] object-contain opacity-60 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span
              key={client.name}
              className="v-display whitespace-nowrap px-7 text-[length:var(--t-heading)] tracking-tight text-[var(--v-muted)] transition-colors duration-200 hover:text-[var(--v-ink)]"
            >
              {client.name}
            </span>
          ),
        )}
      </Marquee>
    </section>
  );
}
