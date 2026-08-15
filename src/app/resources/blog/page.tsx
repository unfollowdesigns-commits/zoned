import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/Reveal";
import { BLOG_POSTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog | District Partners",
  description: "Articles and announcements from District Partners.",
};

export default function BlogPage() {
  const [lead, ...rest] = BLOG_POSTS;

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Blog"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Blog" },
        ]}
      />

      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
        {/* promoted lead */}
        <Reveal>
          <Link
            href={`/resources/blog/${lead.slug}`}
            className="g-glass g-ring-accent group block overflow-hidden p-8 sm:p-10"
          >
            <p className="v-eyebrow mb-4">Latest</p>
            <h2 className="v-display max-w-[24ch] text-[clamp(1.5rem,3.4vw,2rem)] leading-[1.15] transition-colors duration-200 group-hover:text-[var(--v-primary)]">
              {lead.title}
            </h2>
            <p className="mt-5 text-[13px] text-[var(--v-muted)]">
              <time dateTime={lead.iso}>{lead.date}</time>
            </p>
          </Link>
        </Reveal>

        {/* ledger rows with the date in a left rail */}
        <ul className="mt-14 border-t border-[var(--v-border)]">
          {rest.map((post, i) => (
            <li key={post.slug} className="border-b border-[var(--v-border)]">
              <Reveal delay={Math.min(i * 0.07, 0.3)}>
                <Link
                  href={`/resources/blog/${post.slug}`}
                  className="group flex flex-col gap-2 py-7 transition-colors duration-200 hover:bg-white/[0.03] sm:flex-row sm:items-baseline sm:gap-10 sm:px-4"
                >
                  <time
                    dateTime={post.iso}
                    className="shrink-0 text-[12.5px] tabular-nums text-[var(--v-muted)] sm:w-28"
                  >
                    {post.date}
                  </time>
                  <span className="v-display max-w-[52ch] text-[18px] leading-[1.35] transition-colors duration-200 group-hover:text-[var(--v-primary)] sm:text-[20px]">
                    {post.title}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
