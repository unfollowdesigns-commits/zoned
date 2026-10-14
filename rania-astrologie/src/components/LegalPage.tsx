import type { LegalDoc } from "@/content/legal";
import { PageHero } from "./ui";

export function LegalPage({ doc, kicker }: { doc: LegalDoc; kicker: string }) {
  return (
    <>
      <PageHero kicker={kicker} title={doc.title} />
      <section className="pb-32">
        <div className="container-narrow space-y-12">
          {doc.sections.map((s, i) => (
            <div key={i} data-reveal>
              <h2 className="t-3 text-ivory">{s.h}</h2>
              {s.p.map((p, j) => (
                <p key={j} className="mt-4 text-ivory/75">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
