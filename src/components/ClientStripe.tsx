"use client";

import Rail from "@/components/ui/Rail";
import { CLIENT_LOGOS, HAS_CLIENT_LOGOS } from "@/lib/proof";
import { useReducedMotion } from "@/lib/motion";

/**
 * The client stripe on the first scroll: a glass shelf the marks stand on,
 * with their reflections in it.
 *
 * WHY A BELT HERE AND A GRID IN THE PROOF BAND, when Clients.tsx argues
 * against marquees. Both are right, because the two placements do different
 * jobs. The proof band answers "has anyone serious hired them", which needs a
 * set that holds still and can be scanned for a name. This stripe sits under
 * the firm's opening statement, where the job is the first-glance impression
 * that real companies stand behind the copy above. Ambience up top, the
 * record below. Same data, so a logo file added to lib/proof.ts lands in
 * both at once.
 *
 * THE REFLECTION IS WHAT MAKES IT A SHELF. A mirrored copy of each mark,
 * flipped, faded and slightly blurred, under a hairline. Without it the
 * stripe is a row of words floating in a rounded box; with it the marks are
 * OBJECTS standing on a polished surface, which is the quality the glass is
 * there to claim. Costs a second copy of some text and one blur.
 *
 * Belt physics are the shared Rail: slow drift, driven by scroll, reversing
 * with it. Under reduced motion the same marks render as a static centred
 * row that wraps, and the reflection stays, because it was never motion.
 */

function Mark({ name, file }: { name: string; file?: string }) {
  const face = file ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/logos/${file}`}
      alt=""
      loading="lazy"
      className="max-h-8 w-auto max-w-[160px] object-contain"
    />
  ) : (
    /* The wordmark until the file exists. Quiet, and sized like a logo would
       be, so the swap changes the pixels and not the layout. */
    <span className="whitespace-nowrap text-[length:var(--t-small)] font-semibold tracking-[-0.01em] text-[var(--v-ink)]/60">
      {name}
    </span>
  );

  return (
    <span className="dp-cs-mark" aria-hidden="true">
      <span className="dp-cs-face">{face}</span>
      <span className="dp-cs-mirror">{face}</span>
    </span>
  );
}

export default function ClientStripe() {
  const reduced = useReducedMotion();

  return (
    <div>
      {/* The glass shelf. One border, spent here: the marks inside are
          frameless, because twelve outlined tiles inside an outlined stripe
          is the outline habit again. */}
      <div className="relative overflow-hidden rounded-[18px] border border-[var(--v-ink)]/[0.06] bg-white/55 py-7 shadow-[0_18px_40px_-32px_rgba(16,23,40,0.35)] backdrop-blur-md">
        {/* The polish line the reflections hang from. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-8 top-[58%] h-px bg-[var(--v-ink)]/[0.05]"
        />
        {reduced ? (
          <div className="flex flex-wrap justify-center">
            {CLIENT_LOGOS.map((c) => (
              <Mark key={c.name} {...c} />
            ))}
          </div>
        ) : (
          <Rail direction={-1} baseSpeed={1.1}>
            {CLIENT_LOGOS.map((c) => (
              <Mark key={c.name} {...c} />
            ))}
          </Rail>
        )}
      </div>

      {/* The stripe is decorative to assistive technology; the client list is
          stated properly in the proof band's grid. */}
      {!HAS_CLIENT_LOGOS && (
        <p className="sr-only">
          Client logo files have not been supplied yet. See CONTENT-NEEDED.md.
        </p>
      )}
    </div>
  );
}
