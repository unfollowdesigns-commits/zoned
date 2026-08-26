"use client";

import * as React from "react";
import Link from "@/components/SiteLink";
import PostArt from "@/components/ui/PostArt";
import Reveal from "@/components/Reveal";
import type { BlogPost } from "@/lib/site";

/**
 * The filterable half of the blog index.
 *
 * FILTER CHIPS RATHER THAN THE REFERENCE'S FOUR SELECT MENUS. Four dropdowns
 * imply a large archive that needs narrowing down two axes at a time; used on
 * an archive of this size they are furniture that makes the page look busier
 * and the collection look emptier. A single row of chips shows the whole
 * taxonomy at a glance, takes one click instead of three, and states how many
 * pieces exist in each area without the reader having to go and find out.
 *
 * The filter is client state and nothing else on the page is, which is why this
 * is a component rather than the page: the featured stack above stays a server
 * component and ships no JavaScript.
 */
export default function BlogArchive({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = React.useState<string>("All");

  /* Only categories that actually have posts. Offering a filter that returns
     nothing is a dead end the reader has to back out of. */
  const categories = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const shown = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* ---- Filter row ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="All" count={posts.length} active={active === "All"} onClick={() => setActive("All")} />
        {categories.map(([category, count]) => (
          <Chip
            key={category}
            label={category}
            count={count}
            active={active === category}
            onClick={() => setActive(category)}
          />
        ))}
      </div>

      {/* `aria-live` because the grid below changes without navigation, and a
          screen reader otherwise gets no indication that anything happened. */}
      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "article" : "articles"}
        {active === "All" ? "" : ` in ${active}`}
      </p>

      {/* ---- Grid ---------------------------------------------------------- */}
      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {shown.map((post, i) => (
          <li key={post.slug}>
            {/* The delay is capped and keyed off the position within the visible
                set, so a filtered view does not stagger from whatever index the
                post happened to hold in the full archive. */}
            <Reveal delay={Math.min(i * 0.05, 0.25)}>
              <Link href={`/resources/blog/${post.slug}`} className="group block">
                <div className="v-lift relative aspect-[16/10] overflow-hidden rounded-[var(--radius)]">
                  <PostArt slug={post.slug} category={post.category} />
                  <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[length:var(--t-label)] font-medium uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="flex items-center gap-2 text-[length:var(--t-small)] text-[var(--v-muted)]">
                    <time dateTime={post.iso}>{post.date}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readMinutes} min read</span>
                  </p>
                  <h3 className="v-display mt-2 text-[length:var(--t-heading)] leading-[1.3] transition-colors duration-200 group-hover:text-[var(--v-primary)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-[length:var(--t-small)] leading-[1.65] text-[var(--v-muted)]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      /* `aria-pressed` rather than a visual-only selected state: without it the
         control announces as an ordinary button and nothing conveys which
         filter is currently applied. */
      aria-pressed={active}
      /* `ring-1 ring-inset` rather than `border`: an outline that lives on the
         edge instead of in the box means the selected and unselected states are
         the same size, so the row does not reflow by a pixel per chip as the
         selection moves. The unselected state is a soft surface rather than an
         outline, which is the part that had aged: a hairline-outlined pill is
         the 2020 tag, and next to a solid selected chip it reads as two
         unrelated components rather than two states of one. */
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[length:var(--t-small)] font-medium ring-1 ring-inset transition-[background-color,box-shadow,color,transform] duration-200 ${
        active
          ? "bg-[var(--v-primary)] text-white ring-transparent"
          : "bg-[var(--v-ink)]/[0.045] text-[var(--v-muted)] ring-[var(--v-ink)]/[0.07] hover:-translate-y-px hover:bg-[var(--v-ink)]/[0.075] hover:text-[var(--v-ink)]"
      }`}
    >
      {label}
      {/* The count sits in its own well rather than as dimmed text beside the
          label, so it reads as metadata attached to the chip instead of as part
          of the category's name. */}
      <span
        className={`grid min-w-[1.35rem] place-items-center rounded-full px-1 py-px text-[length:var(--t-label)] tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-[var(--v-ink)]/[0.07] text-[var(--v-muted)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
