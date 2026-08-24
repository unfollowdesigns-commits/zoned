/**
 * The words the circuit field surfaces, per page.
 *
 * WHY THIS IS A FILE AND NOT AN ARRAY INSIDE THE COMPONENT. The reference this
 * figure comes from annotates its board with hex and latency, because that firm
 * sells proxies and those are the units of its work. The technique is worth
 * taking; the vocabulary is the part that has to be ours, and it has to change
 * per page or the effect is wallpaper with words on it. A visitor on the
 * interim page should see interim language behind the type.
 *
 * SHORT ENTRIES ONLY. These are set at 10px alongside a trace, so they read as
 * annotation on a board rather than as copy. "Chief Information Security
 * Officer (CISO)" at that size is a sentence lying across the background and
 * competing with the headline; "CISO" is a label. Anything past about twelve
 * characters belongs in the page, not behind it.
 *
 * Every entry is a real thing the firm does or a seat it fills. Nothing here is
 * invented to look technical, which is the trap: a board annotated with
 * plausible nonsense is worse than a plain background, because a reader who
 * stops to look finds out it means nothing.
 */

/** The homepage: the seats, and the ways of working. */
export const VOCAB_HOME = [
  "CFO",
  "CHRO",
  "Controller",
  "VP Eng",
  "CPO",
  "CISO",
  "Retained",
  "Interim",
  "Fractional",
  "Partner-led",
];

/** What We Do: the engagement models. */
export const VOCAB_SERVICES = [
  "Executive",
  "Professional",
  "Interim",
  "Fractional",
  "Project",
  "Retained",
  "Shortlist",
  "Scoped",
];

/** Who We Serve: functions and sectors. */
export const VOCAB_MARKETS = [
  "Finance",
  "Accounting",
  "Technology",
  "Risk",
  "Compliance",
  "Revenue",
  "Private Capital",
  "GovCon",
  "Healthcare",
];

/** The DP Difference: the stack and the method. */
export const VOCAB_DIFFERENCE = [
  "Mapping",
  "Scoring",
  "Signals",
  "Pipeline",
  "Market",
  "Judgement",
  "Transparent",
  "Sourcing",
];

/** Resources and writing. */
export const VOCAB_RESOURCES = [
  "Insight",
  "Market",
  "Benchmarks",
  "Compensation",
  "Trends",
  "Case study",
];
