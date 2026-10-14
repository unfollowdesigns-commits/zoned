export const serviceKeys = [
  "natal",
  "psychological",
  "relational",
  "karmic",
  "progressed",
  "degrees",
  "healing",
] as const;
export type ServiceKey = (typeof serviceKeys)[number];

export function isServiceKey(v: unknown): v is ServiceKey {
  return typeof v === "string" && (serviceKeys as readonly string[]).includes(v);
}

export type ServiceContent = {
  title: string;
  short: string;
  tagline: string;
  lede: string;
  intro: string[];
  explores: string[];
  sections?: { title: string; body: string[] }[];
  approach: string[];
  questions: string[];
  note?: string;
  seoDescription: string;
  /** Direct question/answer pairs — rendered on the page and as FAQPage structured data (SEO/AEO). */
  faq: { q: string; a: string }[];
};

export type ServiceCatalog = Record<ServiceKey, ServiceContent>;
