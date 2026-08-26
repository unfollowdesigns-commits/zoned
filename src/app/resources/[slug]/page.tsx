import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import AwaitingCopy from "@/components/ui/AwaitingCopy";
import { RESOURCES, NEW_TOOLS } from "@/lib/site";

/* Both of these have hand-built static sibling routes, which beat this dynamic
   one for their paths. They are filtered out rather than merely shadowed
   because generateStaticParams below would otherwise prerender a second,
   unreachable copy of each at build time. */
const HAND_BUILT = new Set(["/resources/blog", "/resources/job-description-engine"]);
const ALL = [...RESOURCES, ...NEW_TOOLS].filter((r) => !HAND_BUILT.has(r.href));

function find(slug: string) {
  return ALL.find((r) => r.href === `/resources/${slug}`);
}

export function generateStaticParams() {
  return ALL.map((r) => ({ slug: r.href.split("/").pop()! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) return {};
  return {
    title: `${entry.label} | District Partners`,
    description: entry.note ?? `${entry.label} from District Partners.`,
  };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) notFound();

  const others = [...RESOURCES, ...NEW_TOOLS].filter((r) => r.href !== entry.href);

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={entry.label}
        standfirst={entry.note}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: entry.label },
        ]}
      />

      <Section className="py-16 sm:py-20">
        <AwaitingCopy page={entry.label} />
      </Section>

      <Section title="More resources" className="py-14 sm:py-16">
        <NavLedger items={others} />
      </Section>
    </>
  );
}
