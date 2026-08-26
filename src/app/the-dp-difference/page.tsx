import type { Metadata } from "next";
import TileArt from "@/components/ui/TileArt";
import PageHero from "@/components/ui/PageHero";
import LightBand from "@/components/ui/LightBand";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowButton from "@/components/ui/GlowButton";
import Reveal from "@/components/Reveal";
import PointerLight from "@/components/ui/PointerLight";

/**
 * The DP Difference.
 *
 * EVERY WORD ON THIS PAGE IS THE CLIENT'S. The brief was explicit that the copy
 * is not to be rewritten into generic recruiting language, so the only editing
 * done here was restoring the line breaks that the brief's own layout implies:
 * "We Flipped the Script." and "And the Stack." are two lines, and the body
 * copy arrived as one run of sentences that the source clearly sets as
 * paragraphs. Nothing has been reworded, shortened or smoothed.
 *
 * THE BRIEF ASKED FOR A PAGE ASSEMBLED FROM WHAT ALREADY EXISTS rather than a
 * new design language, so this uses the established parts: PageHero, LightBand,
 * SectionHeading, GlowButton, Reveal, and the tile treatment from the
 * specializations grid.
 *
 * THE GROUNDS ALTERNATE STRICTLY, dark, paper, dark, paper, and so on, which is
 * what keeps a page of eight consecutive statements from reading as one wall of
 * copy. The brief calls for a dark ground on section 4; a cream band carrying
 * type at display size is the other high-contrast treatment the site already
 * has, and using it there is what preserves the alternation without giving two
 * adjacent sections the same ground.
 *
 * THE ANATOMY VARIES TOO, and that matters more than the colour. A card grid, a
 * two-column split with a ruled ledger, a numbered ledger, and two sections that
 * are nothing but a statement. Sections that are all shaped alike read as
 * generated however good the copy is.
 *
 * No em dashes anywhere, per the brief and the house lint.
 */

export const metadata: Metadata = {
  title: "The DP Difference | District Partners",
  description:
    "We took decades of recruiting experience, kept what works, eliminated what doesn't, and built a search firm for the way companies hire today.",
};

/**
 * Section 3.
 *
 * `icon` selects both the tile's schematic band and its glyph elsewhere.
 * `example` is the worked example that closes each card; it is deliberately
 * absent until the client writes one, because inventing what this stack
 * produces would be a product claim the firm has not made. See the tile markup.
 */
const STACK: Array<{
  icon: string;
  title: string;
  body: string;
  example?: string;
}> = [
  {
    icon: "scan",
    title: "Market Motion Detection",
    body: "Identifies shifts, hiring activity, and emerging talent trends before they become obvious in the broader market.",
  },
  {
    icon: "mapped",
    title: "Predictive Talent Mapping",
    body: "Maps talent markets and identifies the people, companies, and career paths most relevant to a search.",
  },
  {
    icon: "chart",
    title: "Smart Candidate Scoring",
    body: "Helps our team quickly assess and prioritize candidates against the experience and criteria that matter most.",
  },
  {
    icon: "monitor",
    title: "Real-Time Role Intelligence",
    body: "Surfaces changes in roles, organizations, and talent demand so our searches evolve with the market.",
  },
  {
    icon: "layers",
    title: "Hidden Talent Discovery",
    body: "Expands our reach beyond traditional sourcing channels to uncover candidates others may never find.",
  },
  {
    icon: "radar",
    title: "Competitor Activity Radar",
    body: "Tracks relevant hiring and talent movement across the competitive landscape.",
  },
  {
    icon: "care",
    title: "Candidate Sentiment Analytics",
    body: "Helps our recruiters understand candidate engagement, responsiveness, and signals of potential interest.",
  },
  {
    icon: "radio",
    title: "Dynamic Market Pulse",
    body: "Provides current insight into talent supply, compensation, market activity, and search conditions.",
  },
];

/** Section 5. */
const TRANSPARENCY = [
  {
    title: "Real-Time Pipeline Access",
    body: "See our activity, candidate pipeline, and search progress as it happens.",
  },
  {
    title: "Transparency Every Step of the Way",
    body: "From initial outreach through final interviews, you know where the search stands and what we're seeing in the market.",
  },
  {
    title: "Flexibility in Involvement",
    body: "Stay as close to the process as you want. Our approach adapts to the way your team prefers to work.",
  },
  {
    title: "Data-Driven Insights",
    body: "We bring market feedback, candidate intelligence, compensation data, and search insights directly into the process so decisions aren't made in a vacuum.",
  },
];

/** Section 6. */
const EXPERIENCE = [
  {
    title: "Top Talent at Every Level",
    body: "National reach, deep networks, and modern sourcing give us access to talent far beyond the obvious candidate pool.",
  },
  {
    title: "A Better Tech Stack",
    body: "Our technology helps us identify, assess, and engage the right candidates faster and more intelligently.",
  },
  {
    title: "Tailored Talent Strategies",
    body: "Every search is different. We build the strategy around the role, the market, and what your organization actually needs.",
  },
  {
    title: "Proven Search Experience",
    body: "Our team has recruited across functions, industries, geographies, and levels, from critical individual contributors through the C-suite.",
  },
  {
    title: "Relentless Partnership",
    body: "Clear communication, transparency, responsiveness, and accountability are built into how we work.",
  },
];

export default function DPDifferencePage() {
  return (
    <>
      {/* ---- 1. Hero ---------------------------------------------------- */}
      <PageHero
        eyebrow="The DP Difference"
        title="We learned how the big firms do it. Then we rebuilt it from the ground up."
        standfirst="We took decades of recruiting experience, kept what works, eliminated what doesn't, and built a search firm for the way companies hire today."
        crumbs={[{ label: "Home", href: "/" }, { label: "The DP Difference" }]}
      />

      {/* ---- 2. We flipped the script ------------------------------------ */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <Reveal>
            <h2
              className="v-display max-w-[16ch] text-balance"
              style={{
                fontSize: "var(--t-display-fluid)",
                lineHeight: "var(--lh-display-fluid)",
                letterSpacing: "var(--tr-display-fluid)",
              }}
            >
              We Flipped the Script.{" "}
              <span className="text-[var(--v-primary-deep)]">And the Stack.</span>
            </h2>
          </Reveal>

          {/* Two columns with a wide gutter, so each is its own object rather
              than one paragraph broken in half. */}
          <div className="mt-14 grid max-w-[100ch] gap-x-24 gap-y-10 md:grid-cols-2">
            <Reveal delay={0.08}>
              <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                The big firms taught us the game. They also taught us its limitations.
              </p>
              <p className="mt-6 text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                Legacy systems, layers of process, and outdated tools make it difficult for
                traditional firms to move as quickly as today&rsquo;s talent market demands.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="text-[length:var(--t-body)] leading-[1.75] text-[var(--v-ink)]">
                <strong className="font-semibold">So we built ours backwards.</strong>
              </p>
              <p className="mt-6 text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                We started with experienced recruiters and search leaders, then built a modern
                technology stack around them. Our technology helps us see more of the market,
                move faster, and make better-informed decisions without replacing the judgment
                and relationships that make great recruiting work.
              </p>
            </Reveal>
          </div>

          {/* The closing statement is the memorable line, so it is set apart at
              display size rather than left as the last sentence of a column. */}
          <Reveal delay={0.2}>
            {/* The serif accent, used where it belongs. This is a pull quote:
                the one line on the page that is a claim rather than an
                explanation, set apart from the columns above it. That is the
                editorial role Lora was added for, and keeping it to that role
                is what stops a second face reading as an inconsistency. */}
            <p
              className="v-serif mt-20 max-w-[24ch] text-balance border-t border-[var(--v-border)] pt-12 italic"
              style={{
                fontSize: "clamp(24px, 3vw, 44px)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              The experience of a big firm. Built to move like something much smaller.
            </p>
          </Reveal>
        </div>
      </LightBand>

      {/* ---- 3. Our tech stack ------------------------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <SectionHeading
            eyebrow="Our tech stack"
            title="Smarter tools. Sharper insights."
            turn="Faster wins."
            lede="A few of our favorite features powering the DP tech stack."
          />

          {/* Four across on desktop, stacking naturally, as the brief specifies.
              Deliberately understated: the brief is clear that this page must
              not read as though the firm is selling software, so these use the
              same quiet tile treatment as the specializations grid rather than
              the brighter card the site uses for its own propositions. */}
          <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((item, i) => (
                /* `h-full` has to run the whole way down, li to Reveal to card,
                   or the cards sit at their natural heights and the row ends
                   ragged. Reveal renders a div in between, so skipping it there
                   silently breaks the chain. */
                <li key={item.title} className="h-full">
                  <Reveal delay={Math.min(i * 0.05, 0.25)} className="h-full" fill>
                    {/* `group` and `relative` are what let the pointer light
                        below attach and reveal on hover. */}
                    <div
                      /* Arms the icon redraw. See ui/DrawIcon. */
                      data-draw-group=""
                      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white/[0.055] p-7 transition-colors duration-300 hover:bg-white/[0.085]"
                    >
                      <PointerLight size={220} />
                      {/* LEADS WITH THE PICTURE, NOT WITH A 18px GLYPH. An icon
                          at the top of a card is a label for the card; a band
                          across the top is the card's subject. See ui/TileArt
                          for why these are schematics rather than charts. */}
                      <TileArt name={item.icon} />
                      <h3 className="v-display mt-5 text-[length:var(--t-heading)] leading-[1.3]">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
                        {item.body}
                      </p>

                      {/* THE WORKED EXAMPLE STRIP, WIRED BUT EMPTY.

                          The reference closes each card with a tinted strip
                          carrying a concrete example, and it is the best thing
                          on those cards: it turns a feature name into something
                          a reader can picture. Writing one here would mean
                          inventing what this stack produces, which is a claim
                          about the product that nobody at the firm has made. So
                          the slot exists and renders the moment `example` is
                          filled in above. One line per feature, from them. */}
                      {item.example && (
                        <div className="-mx-7 -mb-7 mt-7 bg-black/25 px-7 py-5">
                          <p className="v-eyebrow mb-1.5">Example</p>
                          <p className="text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
                            {item.example}
                          </p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- 4. Technology is only half of it ---------------------------- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <div className="grid gap-x-24 gap-y-12 md:grid-cols-[1.1fr_1fr]">
            {/* `size="column"` because this heading shares its row. See the
                prop's own note: the full display step is sized for a heading
                that owns the whole measure. */}
            <SectionHeading
              size="column"
              title="The tools are powerful."
              turn="The people using them matter more."
            />

            <Reveal delay={0.1}>
              <p className="text-[length:var(--t-lede)] leading-[1.7] text-[var(--v-ink)]">
                Technology can surface a name. It can&rsquo;t build trust.
              </p>
              <p className="mt-6 text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                Our team brings decades of recruiting, search, consulting, and industry
                experience to every engagement. We know how to interpret what the data is
                telling us, how to reach the people worth reaching, and how to turn market
                intelligence into an actual hire.
              </p>
              <p className="mt-6 text-[length:var(--t-body)] leading-[1.75] text-[var(--v-ink)]">
                <strong className="font-semibold">
                  That combination is where the difference happens.
                </strong>
              </p>
            </Reveal>
          </div>
        </div>
      </LightBand>

      {/* ---- 5. Transparent partnership ---------------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <div className="grid items-start gap-x-20 gap-y-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <SectionHeading
                  size="column"
                  /* Not "Transparent partnership": an eyebrow that restates the
                     headline word for word is a wasted line and makes the
                     heading read twice. */
                  eyebrow="Visibility"
                  title="Transparent Partnership."
                  turn="Seamless Collaboration."
                  lede="Great search shouldn't happen behind closed doors. Our clients have direct visibility into the work, the pipeline, and what we're learning from the market throughout the engagement."
                />
              </Reveal>

              {/* A ruled ledger rather than another card grid. Section 3 above
                  is already a card grid, and repeating it here would make the
                  two sections read as the same section twice. */}
              <ul className="mt-12 border-t border-[var(--v-border)]">
                {TRANSPARENCY.map((item, i) => (
                  <li key={item.title} className="border-b border-[var(--v-border)]">
                    <Reveal delay={Math.min(i * 0.06, 0.24)}>
                      <div className="py-6">
                        <h3 className="v-display text-[length:var(--t-heading)] leading-[1.3]">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-[48ch] text-[length:var(--t-small)] leading-[1.65] text-[var(--v-muted)]">
                          {item.body}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>

            {/* THE CRM SCREENSHOT SLOT.

                The brief asks for the screenshot from the existing DP Difference
                materials and it was not attached, so this is the frame it goes
                into rather than a substitute for it. Nothing invented has been
                put here on purpose: a mocked-up product interface would be a
                picture of software this firm does not sell, presented as though
                it does, and the brief is explicit that the page must not read as
                selling software.

                Dropping the real asset in is one element: replace the contents
                of this frame with an <Image>. The frame, its rim, its shadow and
                its rounding are already the treatment the brief asks for. */}
            <Reveal delay={0.12}>
              <figure className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#0b1024] ring-1 ring-inset ring-white/[0.1] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)]">
                  <div className="absolute inset-0 grid place-items-center px-8 text-center">
                    <div>
                      <p className="v-eyebrow text-[var(--v-primary)]">Asset needed</p>
                      <p className="mt-3 max-w-[34ch] text-[length:var(--t-small)] leading-[1.6] text-[var(--v-muted)]">
                        The CRM screenshot from the existing DP Difference materials belongs
                        here. Send the file and it drops straight into this frame.
                      </p>
                    </div>
                  </div>
                </div>
                <figcaption className="mt-4 text-[length:var(--t-small)] text-[var(--v-muted)]">
                  Client view of a live search.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- 6. The experience ------------------------------------------- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-32">
          <SectionHeading
            eyebrow="Working with us"
            title="The Customer Experience"
            turn="Is Our Sweet Spot."
            lede="Better technology matters. Better recruiting matters. But neither means much if working with your search partner is painful. We built District Partners around the experience we wanted clients to have."
          />

          {/* Numbered, because these are five qualities of one thing rather than
              five separate offers, and a number is the cheapest way to say that
              without another row of icons. */}
          <ol className="mt-16 grid gap-x-20 gap-y-10 md:grid-cols-2">
            {EXPERIENCE.map((item, i) => (
              <li key={item.title}>
                <Reveal delay={Math.min(i * 0.06, 0.24)}>
                  <div className="flex gap-5">
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[length:var(--t-small)] tabular-nums text-[var(--v-primary-deep)]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="v-display text-[length:var(--t-heading)] leading-[1.3]">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-[44ch] text-[length:var(--t-small)] leading-[1.65] text-[var(--v-muted)]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </LightBand>

      {/* ---- 7. Closing statement ---------------------------------------- */}
      <section className="v-dark-band">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6 py-28 sm:py-36">
          <Reveal>
            <p
              className="v-display max-w-[18ch] text-balance"
              style={{
                fontSize: "var(--t-display-fluid)",
                lineHeight: "var(--lh-display-fluid)",
                letterSpacing: "var(--tr-display-fluid)",
              }}
            >
              Experience + Network + Technology.
              <br />
              <span className="text-[var(--v-primary)]">That&rsquo;s the DP Difference.</span>
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-10 max-w-[54ch] text-[length:var(--t-lede)] leading-[1.7] text-[var(--v-muted)]">
              We combine the relationships and judgment of experienced search professionals
              with technology built to make them faster, smarter, and more informed. The
              result is a better way to search.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- 8. CTA ------------------------------------------------------- */}
      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-24 sm:py-28">
          <Reveal>
            <div className="mx-auto max-w-[40ch] text-center">
              <h2
                className="v-display text-balance"
                style={{
                  fontSize: "var(--t-display-fluid)",
                  lineHeight: "var(--lh-display-fluid)",
                  letterSpacing: "var(--tr-display-fluid)",
                }}
              >
                Ready to experience the difference?
              </h2>
              <p className="mt-6 text-[length:var(--t-body)] leading-[1.75] text-[var(--v-muted)]">
                Tell us what you&rsquo;re looking for. We&rsquo;ll show you how we&rsquo;d
                approach it.
              </p>
              <div className="mt-10 flex justify-center">
                <GlowButton href="/contact">Get In Touch</GlowButton>
              </div>
            </div>
          </Reveal>
        </div>
      </LightBand>
    </>
  );
}
