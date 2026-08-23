import Reveal from "@/components/Reveal";
import { CLIENT_LOGOS, HAS_CLIENT_LOGOS } from "@/lib/proof";

/**
 * The client wall.
 *
 * A GRID, NOT A MARQUEE, AND THAT IS THE POINT OF THE SECTION. This was a
 * scrolling strip, which is the wrong instrument twice over. A ticker you
 * cannot read at speed and cannot stop is decoration wearing the costume of
 * content, and the one thing this section exists to do is be read: these are
 * the names that answer "has anyone serious hired them". Motion actively works
 * against that. A visitor scanning for a company they recognise needs the set
 * to hold still.
 *
 * It also was not rendered anywhere. The component existed, nothing imported
 * it, so the site made no client claim at all.
 *
 * White cards on cream, because a logo needs a consistent ground. Client marks
 * arrive drawn for white, and dropping ten of them straight onto a tinted band
 * gives you ten different halos where the transparent PNGs disagree with the
 * background.
 */
export default function Clients() {
  /* Composed into the proof band rather than owning a section. See the note in
     PlacedPositions. */
  return (
    <div className="mx-auto max-w-[1280px] px-6">
      <div>
        <Reveal>
          <p className="v-eyebrow">Trusted by</p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CLIENT_LOGOS.map((client, i) => (
            <li key={client.name}>
              <Reveal delay={Math.min(i * 0.04, 0.24)}>
                {/* THE CARD APPEARS WITH THE LOGO, NOT BEFORE IT.

                    A white panel exists here to give a logo a consistent
                    ground, because client marks are drawn for white and ten
                    transparent PNGs on a tinted band produce ten different
                    halos. That reason does not apply to a company NAME set in
                    type: framing text in a box says the text is a separate
                    object, and eight boxes around eight words is just eight
                    rectangles. So the frame is conditional on the thing it
                    exists to serve. */}
                <div
                  className={
                    client.file
                      ? "flex h-[104px] items-center justify-center rounded-[14px] bg-white px-6 ring-1 ring-inset ring-[var(--v-ink)]/[0.07]"
                      /* Half the height without a logo in it. 104px is sized
                         for a mark that needs room to breathe inside a card;
                         applied to a line of text it just spaces eight names
                         out until the grid reads as empty. */
                      : "flex h-[52px] items-center justify-center px-4"
                  }
                >
                  {client.file ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/logos/${client.file}`}
                      alt={client.name}
                      loading="lazy"
                      /* Height-capped with width auto. Logos arrive at wildly
                         different aspect ratios, and capping width instead makes
                         a wide wordmark tiny beside a square mark. Optical sizing
                         by height is what makes a mixed set read as one row. */
                      className="max-h-9 w-auto max-w-full object-contain"
                    />
                  ) : (
                    /* The name until the file exists. Set quietly and centred so
                       the card is still a card: a placeholder that shouts is
                       worse than one that waits. */
                    <span className="text-center text-[length:var(--t-small)] font-medium text-[var(--v-muted)]">
                      {client.name}
                    </span>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {!HAS_CLIENT_LOGOS && (
          /* Visible to nobody but the people building the site. The wall is the
             single highest-value asset gap and it should not be possible to
             forget it while looking straight at the section. */
          <p className="sr-only">
            Client logo files have not been supplied yet. See CONTENT-NEEDED.md.
          </p>
        )}
      </div>
    </div>
  );
}
