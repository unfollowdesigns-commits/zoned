import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/SiteLink";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import AwaitingCopy from "@/components/ui/AwaitingCopy";
import { BLOG_POSTS } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: `${post.title} | District Partners` };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        eyebrow={post.date}
        title={post.title}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/resources/blog" },
          { label: post.title.length > 40 ? `${post.title.slice(0, 40)}…` : post.title },
        ]}
      />

      <Section className="py-16 sm:py-20">
        <AwaitingCopy page="article">
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--v-muted)]">
            The title and publication date shown above are the real ones, taken from the
            District Partners navigation. The article body is what is still needed.
          </p>
        </AwaitingCopy>

        <div className="mt-10">
          <Link
            href="/resources/blog"
            className="text-[14px] font-medium text-[var(--v-muted)] transition-colors hover:text-[var(--v-primary)]"
          >
            &larr; All Articles
          </Link>
        </div>
      </Section>
    </>
  );
}
