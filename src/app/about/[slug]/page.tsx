import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import AwaitingCopy from "@/components/ui/AwaitingCopy";
import { COMPANY } from "@/lib/site";

/* Filtered on the prefix, not on "not the index". COMPANY now carries an entry
   that lives at the top level and has its own route, and the old test would have
   generated a second, empty /about/the-dp-difference page for it. */
const CHILDREN = COMPANY.filter((c) => c.href.startsWith("/about/"));

function find(slug: string) {
  return CHILDREN.find((c) => c.href === `/about/${slug}`);
}

export function generateStaticParams() {
  return CHILDREN.map((c) => ({ slug: c.href.split("/").pop()! }));
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
    description: `${entry.label} at District Partners.`,
  };
}

export default async function AboutSubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) notFound();

  return (
    <>
      <PageHero
        eyebrow="About"
        title={entry.label}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: entry.label },
        ]}
      />

      <Section className="py-16 sm:py-20">
        <AwaitingCopy page={entry.label} />
      </Section>

      <Section title="Elsewhere in About" className="py-14 sm:py-16">
        <NavLedger items={[{ label: "About Us", href: "/about" }, ...CHILDREN.filter((c) => c.href !== entry.href)]} />
      </Section>
    </>
  );
}
