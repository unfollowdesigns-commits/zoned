import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/Reveal";
import PostArt from "@/components/ui/PostArt";
import BlogArchive from "@/components/BlogArchive";
import LightBand from "@/components/ui/LightBand";
import { BLOG_POSTS_BY_DATE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog | District Partners",
  description: "Articles and announcements from District Partners.",
};

/**
 * The blog index: a promoted stack, then a filterable archive.
 *
 * THE SHAPE IS TWO REGISTERS, NOT ONE LONG LIST. An archive presented as a
 * uniform grid asks the reader to evaluate twelve equally-weighted things,
 * which is work, and most leave rather than do it. Promoting a few pieces to
 * full width and letting the rest sit in a grid does the first cut for them:
 * here is what we would put in front of you, and here is everything else if
 * you would rather choose yourself.
 *
 * The promoted cards carry their headline ON the art at display size, so the
 * top of the page reads as three statements rather than as three thumbnails
 * with captions. That is the single thing that separates a publication's index
 * from a list of links.
 */
export default function BlogPage() {
  const featured = BLOG_POSTS_BY_DATE.filter((p) => p.featured);
  /* Everything not promoted, so no post appears twice on the page. */
  const rest = BLOG_POSTS_BY_DATE.filter((p) => !p.featured);

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Blog"
        standfirst="What we are seeing across senior search, interim leadership and the market for talent."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Blog" },
        ]}
      />

      <LightBand>
        <div className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
          {/* ---- Promoted stack ------------------------------------------- */}
          <ul className="flex flex-col gap-8">
            {featured.map((post, i) => (
              <li key={post.slug}>
                <Reveal delay={Math.min(i * 0.08, 0.24)}>
                  <Link
                    href={`/resources/blog/${post.slug}`}
                    className="v-lift group block overflow-hidden rounded-[var(--radius)]"
                  >
                    {/* IN FLOW, NOT TWO ABSOLUTE CORNERS. The chip was pinned
                        top-left and the headline block bottom-left inside a
                        fixed 16:9 box. On a phone that box is 219px tall and
                        these headlines wrap to four lines, so the bottom block
                        grew upward and printed straight through the chip:
                        "INTERIM & FRACTIONAL" rendered on top of "The 5
                        Candidates Who Thrive". Absolute corners only hold while
                        the content is shorter than the box, which is an
                        assumption no headline can be asked to honour.

                        A flex column with the art behind it cannot overlap at
                        any length: the card grows instead. The fixed ratio
                        comes back at `sm`, where the width makes it safe. */}
                    <div className="relative flex min-h-[360px] flex-col justify-between p-6 sm:aspect-[21/8] sm:min-h-0 sm:p-10">
                      <PostArt slug={post.slug} category={post.category} />

                      <span className="relative w-fit rounded-full bg-black/35 px-3 py-1 text-[length:var(--t-label)] font-medium uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm">
                        {post.category}
                      </span>

                      {/* The headline sits on the art, bottom-left, inside a max
                          measure so it never runs the full width of a 21:8 card
                          and becomes a single unreadable line. */}
                      <div className="relative mt-8">
                        <h2
                          className="v-display max-w-[20ch] text-balance text-white transition-colors duration-200 group-hover:text-[var(--v-primary-soft,#a9c4ff)]"
                          style={{
                            fontSize: "clamp(22px, 2.6vw, 40px)",
                            lineHeight: 1.15,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {post.title}
                        </h2>
                        <p className="mt-4 flex items-center gap-2 text-[length:var(--t-small)] text-white/60">
                          <time dateTime={post.iso}>{post.date}</time>
                          <span aria-hidden="true">·</span>
                          <span>{post.readMinutes} min read</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>

          {/* ---- Archive --------------------------------------------------- */}
          {rest.length > 0 && (
            <div className="mt-20 border-t border-[var(--v-border)] pt-12">
              <BlogArchive posts={rest} />
            </div>
          )}
        </div>
      </LightBand>

      {/* ---- Newsletter ------------------------------------------------- */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 sm:py-24">
        <Reveal>
          <div className="mx-auto max-w-[46ch] text-center">
            <p className="v-eyebrow">Subscribe</p>
            <h2
              className="v-display mt-4 text-balance"
              style={{
                fontSize: "var(--t-display-fluid)",
                lineHeight: "var(--lh-display-fluid)",
                letterSpacing: "var(--tr-display-fluid)",
              }}
            >
              Get the latest in your inbox.
            </h2>
            <form
              /* No handler yet: this posts nowhere until there is a list to post
                 to. Left as a real form rather than a decorative one so wiring
                 it up is a single action attribute, and so it is keyboard and
                 screen-reader complete in the meantime. */
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-full border border-[var(--v-border)] bg-transparent px-5 py-3 text-[length:var(--t-small)] outline-none transition-colors duration-200 placeholder:text-[var(--v-muted)]/70 focus-visible:border-[var(--v-primary)]"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--v-primary)] px-6 py-3 text-[length:var(--t-small)] font-medium text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                Submit
              </button>
            </form>
          </div>
        </Reveal>
      </section>
    </>
  );
}
