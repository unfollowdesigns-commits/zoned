/**
 * The long-form content for a service page.
 *
 * WHY A TEMPLATE AND NOT FIVE HAND-BUILT PAGES. The supplied design for
 * Professional Search runs thirteen sections and ends on a link to Interim
 * Solutions, which is the tell that every service page is the same page with
 * different words in it. Building one by hand and then copying it four times is
 * how five pages end up with five slightly different section rhythms, and it is
 * exactly the drift the shared heading component exists to prevent.
 *
 * So the page is a renderer and this file is the content. Adding the next
 * service is an entry here, not a route.
 *
 * EVERY SECTION IS OPTIONAL, AND THAT IS THE POINT. A section renders only when
 * its content exists, so a page fills in progressively as copy arrives instead
 * of standing empty or, worse, being padded out with invented prose. Nothing in
 * this file may be written on the firm's behalf: seat titles, case studies,
 * quotes and answers are all claims about what they do and who hired them.
 */

export type ProcessStep = { title: string; body?: string };

export type FunctionArea = {
  /** Matches a label in FUNCTIONS where possible, so the two stay in step. */
  label: string;
  href?: string;
  icon?: string;
  /** The seats placed in this function. Client-supplied only. */
  seats?: string[];
};

export type ServiceContent = {
  /** The line under the page title. */
  headline?: string;
  lede?: string;

  functionsHeading?: string;
  functions?: FunctionArea[];

  approachHeading?: string;
  approachTurn?: string;
  /** "How we search": a few named commitments. Bodies are client copy. */
  approach?: Array<{ title: string; body?: string }>;

  placementsHeading?: string;
  /** Titles actually placed. Factual, so client-supplied only. */
  placements?: string[];

  fitHeading?: string;
  /** "When this fits": the qualifying criteria. */
  fit?: string[];

  industriesHeading?: string;
  /** Pulled from the real IA rather than restated here. */
  showIndustries?: boolean;

  processHeading?: string;
  process?: ProcessStep[];

  faqHeading?: string;
  faq?: Array<{ q: string; a: string }>;
};

/**
 * Professional Search.
 *
 * WHAT IS FILLED IN AND WHAT IS NOT. The section structure and headings below
 * are read off the supplied design. The industries come from the site's own IA,
 * so they are real. Everything absent is absent on purpose:
 *
 *   - Seat titles under each function, and the "Who We Place" list. These state
 *     which roles the firm places. Reading them off a low-resolution image and
 *     guessing at the ones that will not resolve puts made-up seats on a
 *     services page.
 *   - The body under each "How We Search" commitment.
 *   - The "When Professional Search fits" criteria.
 *   - The U.S. Chamber of Commerce case study. A named client engagement is the
 *     single least inventable thing on the page.
 *   - The testimonial. Standing rule for this build: quotes attributed to real
 *     people are never written here.
 *   - The FAQ answers.
 *
 * Send the text and it drops in; no further design work is needed for any of it.
 */
const PROFESSIONAL_SEARCH: ServiceContent = {
  headline: "Below the C-suite, the function still needs to run.",

  functionsHeading: "Four functions. Decades of search experience.",

  approachHeading: "How we",
  approachTurn: "search.",
  approach: [
    { title: "Partner-Led" },
    { title: "Network-Driven" },
    { title: "Accountable" },
    /* The Inc. 5000 ranking is the one claim here the site already carries: see
       the "inc-5000-washington-dc-no-1" post in the blog ledger. */
    { title: "An Inc. 5000 ranked firm" },
  ],

  placementsHeading: "Who we place",

  fitHeading: "When Professional Search fits",

  industriesHeading: "Industries we know deeply.",
  showIndustries: true,

  processHeading: "How Professional Search works",
  process: [
    { title: "Define the mandate" },
    { title: "Build the strategy" },
    { title: "Identify and evaluate" },
    { title: "Coordinate the process" },
    { title: "Secure and support" },
  ],

  faqHeading: "Questions, answered.",
};

/** Keyed by the slug in /what-we-do/[slug]. */
export const SERVICE_CONTENT: Record<string, ServiceContent> = {
  "professional-search": PROFESSIONAL_SEARCH,
};

/** True when a service has enough content to render more than the scaffold. */
export function hasContent(c: ServiceContent | undefined): c is ServiceContent {
  return Boolean(c && (c.headline || c.functions || c.process || c.approach));
}
