/**
 * Proof: the logos and the testimonials.
 *
 * WHY THIS IS ITS OWN MODULE. Everything else on this site is something the
 * firm says about itself. This is the only file holding things other people
 * said, and named companies the firm actually worked for, which is the
 * difference between a brochure and evidence. It is separated so it is obvious
 * when it is empty, because an empty proof file is the single most important
 * fact about the state of the site.
 *
 * NOTHING IN HERE MAY BE INVENTED. A fabricated testimonial is a quote put in a
 * real person's mouth and a logo wall of companies that were never clients is a
 * false claim about commercial relationships. Both are the kind of thing that
 * ends up in a legal letter rather than a design review. If a field has no real
 * value yet it stays empty and the component renders nothing.
 */

export type ClientLogo = {
  /** Legal or trading name, used as the image's alt text. */
  name: string;
  /**
   * Filename inside public/logos/. Undefined means no logo file has been
   * supplied yet and the name renders as type instead.
   *
   * A wall of company names set in the body face is what a site does when it
   * could not get the logos, and it reads that way to anyone who has seen a
   * real one. It is a placeholder, not a design.
   */
  file?: string;
};

/**
 * Clients named on the live District Partners homepage.
 *
 * The names are real and transcribed from their own site. The logo files are
 * not here yet. See CONTENT-NEEDED.md.
 */
export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Walker & Dunlop" },
  { name: "Riveron" },
  { name: "OTJ" },
  { name: "Guidehouse" },
  { name: "BRG" },
  { name: "Washington Commanders" },
  { name: "ChamberOfCommerce.com" },
  { name: "MAI Capital Management" },
];

/** True once at least one real logo file exists, which is what the logo wall waits for. */
export const HAS_CLIENT_LOGOS = CLIENT_LOGOS.some((c) => Boolean(c.file));

export type Testimonial = {
  /** Exactly as given. Not tightened, not shortened, not made punchier. */
  quote: string;
  name: string;
  /** Job title at the time of the engagement. */
  title: string;
  company: string;
  /** Filename inside public/testimonials/. Optional: a quote without a face still works. */
  photo?: string;
};

/**
 * EMPTY ON PURPOSE, AND THE SECTION RENDERS NOTHING UNTIL IT IS NOT.
 *
 * This is the largest single gap on the site. A search firm sells judgement,
 * and judgement is the one claim that cannot be self-asserted: the reader
 * discounts anything the firm says about its own quality and accepts almost
 * anything a named client says. The reference site this one is measured
 * against puts a real person's face, name and title on a card, and that one
 * card does more for credibility than any amount of motion work.
 *
 * Filling this in with plausible-sounding quotes would be inventing evidence.
 * See the note at the top of this file.
 */
export const TESTIMONIALS: Testimonial[] = [];
