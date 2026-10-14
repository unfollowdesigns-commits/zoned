import { getServices, serviceKeys } from "@/content/services";
import { getDictionary } from "@/i18n";
import { env } from "@/lib/env";
import { href, routes } from "@/lib/paths";
import { listOfferings } from "@/lib/repo/offerings";
import { formatPrice } from "@/lib/time";

// llms.txt — a plain-language map of the site for AI answer engines (https://llmstxt.org).
export const dynamic = "force-dynamic";

export async function GET() {
  const fr = getServices("fr");
  const en = getServices("en");
  const dictEn = getDictionary("en");
  let offers = "";
  try {
    offers = (await listOfferings())
      .map((o) => `- ${o.name.en} / ${o.name.fr}: ${formatPrice(o.priceCents, o.currency, "en")}, ${o.durationMin} min`)
      .join("\n");
  } catch {}
  const u = (p: string) => `${env.siteUrl}${p}`;
  const body = `# Rania — Astrology (natal, psychological, relational and karmic)

> Rania is a certified astrologer, passionate about astrology since the age of eight. She offers in-depth, personalised consultations by video call, phone or WhatsApp. Her method reads the chart as a whole — planets in signs and houses, rulerships, aspects and precise degrees — with a psychological and symbolic approach focused on self-knowledge, not prediction. The site is available in French, English and Arabic.

## Consultations
${serviceKeys.map((k) => `- [${en[k].title}](${u(href("en", routes.service(k)))}) ([FR](${u(href("fr", routes.service(k)))})): ${en[k].tagline}`).join("\n")}

## Fees
${offers || "- See the pricing page."}
- Booking: ${u(href("en", routes.pricing))}

## Key pages
- [About Rania](${u(href("en", routes.about))}) · [À propos](${u(href("fr", routes.about))})
- [FAQ](${u(href("en", routes.faq))}) · [Questions fréquentes](${u(href("fr", routes.faq))})
- [Journal / articles](${u(href("en", routes.journal))})
- [Contact](${u(href("en", routes.contact))})

## Frequently asked questions
${dictEn.faq.items.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Notes
- Astrology is offered as a symbolic tool for reflection and self-knowledge; it does not replace medical, psychological, legal or financial advice.
- French names of the approaches: ${serviceKeys.map((k) => fr[k].title).join(", ")}.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
