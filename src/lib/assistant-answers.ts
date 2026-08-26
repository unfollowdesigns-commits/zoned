import {
  SERVICES,
  FUNCTIONS,
  INDUSTRIES,
  RESOURCES,
  NEW_TOOLS,
  STATS,
  LINKEDIN_URL,
} from "@/lib/site";

/**
 * What the assistant knows, and how it decides which answer applies.
 *
 * THIS IS RETRIEVAL, NOT GENERATION, AND THE DIFFERENCE IS THE POINT. The
 * assistant now takes typed input, which is what a visitor expects of anything
 * shaped like a chat. The tempting way to build that is a language model or,
 * worse, a script that accepts the typing and replies with the same canned
 * line regardless. Both fail here for the same reason: this page sells
 * judgement about people, and a widget that invents a service the firm does
 * not offer, a fee it has not quoted, or a timeline it cannot meet does more
 * damage than no widget at all.
 *
 * So every answer below is assembled from what the site already says. The
 * routes come from lib/site, the figures from STATS, the service descriptions
 * from the same `note` the navigation renders. Nothing here states a fact that
 * is not already on a page a visitor can go and read.
 *
 * WHERE THE SITE HAS NO ANSWER, IT SAYS SO. Fees and search timelines are the
 * two things every visitor asks and this firm has not published. Those intents
 * exist and answer honestly rather than being left to the fallback, because
 * "we don't publish that, a partner will tell you directly" is a real answer
 * and a guess dressed as one is not.
 *
 * SCORING IS DELIBERATELY DUMB. Token overlap against a keyword list, longest
 * keyword wins ties. It is a hundred lines rather than a dependency, it is
 * inspectable, and its failure mode is the honest fallback rather than a
 * confident wrong answer. When it does not know, it says it does not know and
 * offers a partner.
 */

export type Reply = {
  /** What the assistant says. Plain sentences, no markdown. */
  text: string;
  /** Routes worth offering alongside it. */
  links?: Array<{ label: string; href: string; external?: boolean }>;
};

type Intent = {
  id: string;
  /** Matched against the visitor's words. Multi-word phrases score higher. */
  keys: string[];
  reply: () => Reply;
};

const svc = (slug: string) => SERVICES.find((s) => s.href.endsWith(slug));

/** One service, answered from its own navigation entry so it cannot drift. */
function serviceReply(slug: string, lead: string): Reply {
  const s = svc(slug);
  if (!s) return { text: lead };
  return {
    text: `${lead} ${s.note ?? ""}`.trim(),
    links: [{ label: s.label, href: s.href }],
  };
}

const INTENTS: Intent[] = [
  {
    id: "greeting",
    keys: ["hello", "hi", "hey", "good morning", "good afternoon"],
    reply: () => ({
      text: "Welcome to District Partners. Tell me what you are trying to do and I will point you at the right place, or pick one of the starting points below.",
    }),
  },
  {
    id: "services",
    keys: ["what do you do", "services", "offer", "what we do", "help with", "capabilities"],
    reply: () => ({
      text: `Five ways in, all run by the same partners: ${SERVICES.map((s) => s.label).join(", ")}.`,
      links: [{ label: "What We Do", href: "/what-we-do" }],
    }),
  },
  {
    id: "executive",
    keys: ["executive search", "c-suite", "csuite", "ceo", "cfo", "coo", "cto", "board", "chief"],
    reply: () => serviceReply("executive-search", "Executive Search is the one for board and C-suite seats."),
  },
  {
    id: "professional",
    keys: ["professional search", "manager", "director", "mid level", "individual contributor"],
    reply: () => serviceReply("professional-search", "That is Professional Search."),
  },
  {
    id: "interim",
    keys: ["interim", "temporary", "cover", "gap", "urgent", "someone now", "stopgap", "maternity"],
    reply: () => serviceReply("interim-solutions", "Interim Solutions covers that."),
  },
  {
    id: "fractional",
    keys: ["fractional", "part time", "part-time", "few days a week", "not full time"],
    reply: () => serviceReply("fractional", "Fractional is the fit."),
  },
  {
    id: "project",
    keys: ["project", "implementation", "remediation", "scoped", "programme", "program", "audit"],
    reply: () => serviceReply("project-support", "Project Support and Expertise handles bounded work."),
  },
  {
    id: "functions",
    keys: ["function", "finance", "accounting", "technology", "digital", "risk", "compliance", "marketing", "revenue", "ai"],
    reply: () => ({
      text: `Four practices, each with its own network: ${FUNCTIONS.map((f) => f.label).join(", ")}.`,
      links: FUNCTIONS.map((f) => ({ label: f.label, href: f.href })),
    }),
  },
  {
    id: "industries",
    keys: ["industry", "industries", "sector", "private capital", "govcon", "healthcare", "wealth", "real estate", "manufacturing"],
    reply: () => ({
      text: `We work across ${INDUSTRIES.length} industries, including ${INDUSTRIES.slice(0, 4).map((i) => i.label).join(", ")}.`,
      links: [{ label: "Who We Serve", href: "/who-we-serve" }],
    }),
  },
  {
    id: "fees",
    keys: ["cost", "price", "pricing", "fee", "fees", "how much", "rate", "retainer", "budget"],
    reply: () => ({
      /* Deliberately not answered with a number. The site publishes none, and
         inventing one is the single most damaging thing this widget could do. */
      text: "Fees are not published, and I am not going to guess at one. They depend on the seat, the scope and whether the engagement is retained or interim. A partner will give you a straight answer on a first call.",
      links: [{ label: "Talk to a partner", href: "/contact" }],
    }),
  },
  {
    id: "timeline",
    keys: ["how long", "timeline", "how fast", "speed", "when can", "turnaround", "lead time"],
    reply: () => ({
      text: "Interim talent deploys within days. A retained search runs to a considered process rather than a published number of weeks, because the shortlist is the product. A partner will tell you what your seat realistically takes.",
      links: [
        { label: "Compare the engagements", href: "/what-we-do" },
        { label: "Talk to a partner", href: "/contact" },
      ],
    }),
  },
  {
    id: "location",
    keys: ["where", "location", "based", "nationwide", "remote", "washington", "dc", "office"],
    reply: () => ({
      text: "District Partners is an independent, partner-led firm built to serve clients wherever they need us most.",
      links: [{ label: "About Us", href: "/about" }],
    }),
  },
  {
    id: "candidate",
    keys: ["job", "jobs", "role", "roles", "apply", "candidate", "resume", "cv", "opportunit", "hiring me", "looking for work"],
    reply: () => ({
      text: "Open roles are listed under Current Opportunities, and the resume builder is free to use.",
      links: [
        ...RESOURCES.filter((r) => r.href.includes("current-opportunities")).map((r) => ({
          label: r.label,
          href: r.href,
        })),
        ...NEW_TOOLS.map((t) => ({ label: t.label, href: t.href })),
      ],
    }),
  },
  {
    id: "tools",
    keys: ["job description", "tool", "engine", "write a spec", "resume builder"],
    reply: () => ({
      text: "There are two tools on the site, both free and both open in the browser.",
      links: NEW_TOOLS.map((t) => ({ label: t.label, href: t.href })),
    }),
  },
  {
    id: "proof",
    keys: ["clients", "who have you", "track record", "results", "numbers", "stats", "case stud", "references"],
    reply: () => ({
      text: STATS.map((s) => `${s.prefix ?? ""}${s.value.toLocaleString()}${s.unit ?? ""} ${s.label.toLowerCase()}`).join(". ") + ".",
      links: [
        { label: "Case Studies", href: "/resources/case-studies" },
        { label: "The DP Difference", href: "/the-dp-difference" },
      ],
    }),
  },
  {
    id: "about",
    keys: ["who are you", "about", "team", "partners", "founded", "history", "difference"],
    reply: () => ({
      text: "An independent, partner-led firm. Every search is led by a senior recruiter with at least a decade of experience, and most of the team are former practitioners.",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Meet Our Team", href: "/about/team" },
        { label: "The DP Difference", href: "/the-dp-difference" },
      ],
    }),
  },
  {
    id: "insights",
    keys: ["blog", "article", "insight", "read", "news", "writing"],
    reply: () => ({
      text: "What we are seeing across senior search, interim leadership and the market for talent.",
      links: [{ label: "Blog", href: "/resources/blog" }],
    }),
  },
  {
    id: "contact",
    keys: ["contact", "talk", "call", "speak", "email", "get started", "book", "reach"],
    reply: () => ({
      text: "You speak to the partner who would run the work, not a qualifier who hands you off. A partner responds within one business day.",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "LinkedIn", href: LINKEDIN_URL, external: true },
      ],
    }),
  },
];

/** Lowercase, strip punctuation, collapse whitespace. */
function normalise(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Pick the best intent for a typed question.
 *
 * A phrase match is worth its own length, so "how much" beats a stray "much",
 * and a two-word key beats a one-word one on the same input. Anything scoring
 * zero falls through to the honest fallback rather than the nearest guess.
 */
export function answer(input: string): Reply {
  const text = normalise(input);
  if (!text) {
    return { text: "Ask me anything about the firm, or pick a starting point below." };
  }

  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const key of intent.keys) {
      if (text.includes(key)) score = Math.max(score, key.length);
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best) {
    return {
      text: "I do not have an answer for that on the site, and I would rather say so than invent one. A partner will though, usually within a business day.",
      links: [
        { label: "Talk to a partner", href: "/contact" },
        { label: "What We Do", href: "/what-we-do" },
      ],
    };
  }
  return best.reply();
}

/** The line the panel opens on. */
export const WELCOME =
  "Welcome to District Partners. Ask me what you are trying to do, or pick a starting point below.";
