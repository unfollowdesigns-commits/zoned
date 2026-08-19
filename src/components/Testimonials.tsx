import Reveal from "@/components/Reveal";
import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import { TESTIMONIALS } from "@/lib/proof";

/**
 * What clients said, in their own words, with their names on it.
 *
 * RENDERS NOTHING WHILE THERE IS NOTHING TO RENDER, and that is the design.
 * The alternatives were a section of invented quotes, which is fabricating
 * evidence, or a visible "testimonials coming soon" panel, which tells every
 * visitor that no client would give one. Absent beats either.
 *
 * The quote is set in the serif, which is the one place on the site besides a
 * pull quote where it appears. That is the whole point of having an accent
 * face: it marks a change of voice. Everything else on the page is the firm
 * talking; this is not, and the type says so before the attribution does.
 */
export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <LightBand>
      <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
        <SectionHeading
          eyebrow="In their words"
          title="What it is like"
          turn="to work with us."
        />

        <ul className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <li key={`${t.company}-${t.name}`}>
              <Reveal delay={Math.min(i * 0.07, 0.28)}>
                <figure className="flex h-full flex-col">
                  <blockquote className="v-serif text-[length:var(--t-lede)] leading-[1.6] text-[var(--v-ink)]">
                    {/* Curly quotes around the text rather than baked into the
                        data, so the copy stays exactly as the client wrote it
                        and nobody has to remember the convention. */}
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-4">
                    {t.photo && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`/testimonials/${t.photo}`}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                        /* `alt=""` because the name is right beside it: reading
                           the face out as well would announce the person twice. */
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-[length:var(--t-small)] font-semibold text-[var(--v-ink)]">
                        {t.name}
                      </p>
                      <p className="text-[length:var(--t-small)] text-[var(--v-muted)]">
                        {t.title}, {t.company}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </LightBand>
  );
}
