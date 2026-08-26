import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import NavLedger from "@/components/ui/NavLedger";
import AwaitingCopy from "@/components/ui/AwaitingCopy";
import ServiceDetail from "@/components/ServiceDetail";
import Stats from "@/components/Stats";
import CtaBand from "@/components/CtaBand";
import { SERVICES } from "@/lib/site";
import { SERVICE_CONTENT, hasContent } from "@/lib/services";

function find(slug: string) {
  return SERVICES.find((s) => s.href === `/what-we-do/${slug}`);
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.href.split("/").pop()! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = find(slug);
  if (!service) return {};
  return {
    title: `${service.label} | District Partners`,
    description: `${service.label} from District Partners, an independent, partner-led talent advisory firm.`,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = find(slug);
  if (!service) notFound();

  const others = SERVICES.filter((s) => s.href !== service.href);
  const content = SERVICE_CONTENT[slug];

  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title={service.label}
        /* The headline under the title is the page's actual argument, so it
           belongs to the content rather than to the route. */
        standfirst={content?.headline}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "What We Do", href: "/what-we-do" },
          { label: service.label },
        ]}
      />

      {hasContent(content) ? (
        <>
          <ServiceDetail content={content} others={others} />
          {/* The firm's real numbers, shared with the homepage rather than
              restated, so a figure can never drift between the two. */}
          <Stats />
          <CtaBand />
        </>
      ) : (
        <>
          <Section className="py-16 sm:py-20">
            <AwaitingCopy page={service.label} />
          </Section>
          <Section title="Other ways we work" className="py-14 sm:py-16">
            <NavLedger items={others} />
          </Section>
        </>
      )}
    </>
  );
}
