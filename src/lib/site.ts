/**
 * Single source of truth for the site's information architecture.
 *
 * Every label and href here is transcribed from the live District Partners
 * navigation. Header, Footer, index pages and route generation all read from
 * this file, so the IA is stated once.
 *
 * `icon` is a string key resolved to a component in components/icons.ts, which
 * keeps this module free of React so server and client components can share it.
 */

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  note?: string;
  badge?: string;
};

export type NavGroup = {
  heading: string;
  items: NavItem[];
};

export const SERVICES: NavItem[] = [
  { label: "Executive Search", href: "/what-we-do/executive-search", icon: "search" },
  { label: "Professional Search", href: "/what-we-do/professional-search", icon: "briefcase" },
  { label: "Interim Solutions", href: "/what-we-do/interim-solutions", icon: "timer" },
  { label: "Fractional", href: "/what-we-do/fractional", icon: "brackets" },
  { label: "Project Support & Expertise", href: "/what-we-do/project-support", icon: "presentation" },
];

export const WHAT_WE_DO_MENU: NavGroup[] = [
  { heading: "Search", items: SERVICES.slice(0, 2) },
  { heading: "Interim Solutions", items: SERVICES.slice(2) },
];

export const FUNCTIONS: NavItem[] = [
  { label: "Finance | Accounting", href: "/who-we-serve/finance-accounting", icon: "calculator" },
  { label: "Technology | Digital | AI", href: "/who-we-serve/technology-digital-ai", icon: "laptop" },
  { label: "Risk | Compliance", href: "/who-we-serve/risk-compliance", icon: "binoculars" },
  { label: "Marketing | Revenue", href: "/who-we-serve/marketing-revenue", icon: "trending" },
];

export const INDUSTRIES: NavItem[] = [
  {
    label: "Professional & Business Services",
    href: "/who-we-serve/professional-business-services",
    icon: "briefcase",
  },
  { label: "Private Capital", href: "/who-we-serve/private-capital", icon: "coins" },
  {
    label: "Tech, AI, & Digital Platforms",
    href: "/who-we-serve/tech-ai-digital-platforms",
    icon: "brain",
  },
  { label: "GovCon & Public Sector", href: "/who-we-serve/govcon-public-sector", icon: "landmark" },
  { label: "Financial Services", href: "/who-we-serve/financial-services", icon: "building" },
  { label: "Wealth Management", href: "/who-we-serve/wealth-management", icon: "trending" },
  {
    label: "Real Estate, Construction, & Manufacturing",
    href: "/who-we-serve/real-estate-construction-manufacturing",
    icon: "factory",
  },
  { label: "Healthcare", href: "/who-we-serve/healthcare", icon: "health" },
];

export const RESOURCES: NavItem[] = [
  { label: "Blog", href: "/resources/blog", icon: "news" },
  { label: "Case Studies", href: "/resources/case-studies", icon: "branch" },
  {
    label: "Current Opportunities",
    href: "/resources/current-opportunities",
    icon: "accessibility",
    badge: "New",
  },
];

export const NEW_TOOLS: NavItem[] = [
  {
    label: "Resume Builder",
    href: "/resources/resume-builder",
    icon: "paperclip",
    note: "Level up your professional profile",
  },
  {
    label: "Job Description Engine",
    href: "/resources/job-description-engine",
    icon: "messages",
    note: "Build a better spec. Attract better candidates.",
  },
];

export const COMPANY: NavItem[] = [
  { label: "About Us", href: "/about" },
  /* Lives at the top level rather than under /about because it is a positioning
     page rather than a fact about the company, and because it has its own hand
     built route. Anything consuming this list to generate /about/[slug] pages
     must therefore filter on the /about/ prefix rather than assume it. */
  { label: "The DP Difference", href: "/the-dp-difference", icon: "brackets" },
  { label: "Meet Our Team", href: "/about/team" },
  { label: "Accolades", href: "/about/accolades" },
  { label: "Careers at DP", href: "/about/careers" },
];

/**
 * The blog's taxonomy, which is deliberately the firm's practice areas rather
 * than a generic set of content buckets. A recruiting firm's archive filtered
 * by "Insights / News / Guides" tells a reader nothing about whether a piece is
 * for them; filtered by the work itself, it does.
 */
export const BLOG_CATEGORIES = [
  "Executive Search",
  "Interim & Fractional",
  "Private Capital",
  "Finance & Accounting",
  "Market Insight",
  "Firm News",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogPost = {
  title: string;
  date: string;
  iso: string;
  slug: string;
  category: BlogCategory;
  /** Rendered under the title in the ledger and on cards. */
  excerpt: string;
  /** Minutes, shown in the metadata row. */
  readMinutes: number;
  /** Promoted into the large card stack at the top of the index. */
  featured?: boolean;
  /**
   * TRUE MEANS THE COPY IS A STAND-IN AND MUST NOT SHIP.
   *
   * Three of the entries below are the real posts, transcribed from the live
   * site's navigation. The rest exist because an index built for a featured
   * stack plus a filterable grid cannot be judged with three items in it, and
   * the layout had to be verified against a realistic archive.
   *
   * They are marked rather than merely mentioned so the check is mechanical:
   * `BLOG_POSTS.some(p => p.placeholder)` is a build-time assertion anyone can
   * add, and no one has to remember which titles were invented. Replace them
   * with the real archive and delete the flag.
   */
  placeholder?: boolean;
};

/** Posts surfaced in the About mega-menu on the live site. */
export const BLOG_POSTS: BlogPost[] = [
  {
    title: "The 5 Candidates Who Thrive as Independent Consultants, and the 2 Who Shouldn't",
    date: "Mar 5, 2026",
    iso: "2026-03-05",
    slug: "candidates-who-thrive-as-independent-consultants",
    category: "Interim & Fractional",
    excerpt:
      "Independent work rewards a particular temperament. Here is who it suits, who it does not, and how to tell before you commit.",
    readMinutes: 6,
    featured: true,
  },
  {
    title: "District Partners Ranks No. 1 in Washington, D.C. on the 2023 Inc. 5000",
    date: "Mar 15, 2024",
    iso: "2024-03-15",
    slug: "inc-5000-washington-dc-no-1",
    category: "Firm News",
    excerpt:
      "The firm placed first in the District and among the fastest-growing private companies in the country.",
    readMinutes: 3,
    featured: true,
  },
  {
    title: "Understanding the Big Picture to Get Ahead in Your Accounting Career",
    date: "Feb 13, 2020",
    iso: "2020-02-13",
    slug: "understanding-the-big-picture-accounting-career",
    category: "Finance & Accounting",
    excerpt:
      "The technical work gets you hired. Understanding what the numbers are for is what gets you promoted.",
    readMinutes: 5,
    featured: true,
  },

  /* ---- Stand-ins. See `placeholder` above. Delete on receipt of the real
     archive; none of the copy below came from District Partners. ---- */
  {
    title: "What a Retained Search Actually Buys You",
    date: "Jan 22, 2026",
    iso: "2026-01-22",
    slug: "what-retained-search-buys",
    category: "Executive Search",
    excerpt:
      "The fee difference is the visible part. The difference in who takes your call is the part that decides the outcome.",
    readMinutes: 7,
    placeholder: true,
  },
  {
    title: "The First Finance Hire After a Close",
    date: "Dec 4, 2025",
    iso: "2025-12-04",
    slug: "first-finance-hire-after-close",
    category: "Private Capital",
    excerpt:
      "Sponsors reach for a CFO first. Often the seat that changes the next twelve months is one level down.",
    readMinutes: 6,
    placeholder: true,
  },
  {
    title: "Why Counteroffers Keep Working, and What to Do About It",
    date: "Oct 30, 2025",
    iso: "2025-10-30",
    slug: "why-counteroffers-keep-working",
    category: "Executive Search",
    excerpt:
      "A counteroffer accepted is a process that failed earlier than anyone noticed. The fix is upstream.",
    readMinutes: 5,
    placeholder: true,
  },
  {
    title: "Fractional Leadership Is Not a Discount",
    date: "Sep 9, 2025",
    iso: "2025-09-09",
    slug: "fractional-leadership-is-not-a-discount",
    category: "Interim & Fractional",
    excerpt:
      "Buying a fraction of a senior operator works when the mandate is bounded. It fails when it is a way of avoiding a decision.",
    readMinutes: 6,
    placeholder: true,
  },
  {
    title: "Compensation Bands Are Moving Again",
    date: "Aug 14, 2025",
    iso: "2025-08-14",
    slug: "compensation-bands-are-moving",
    category: "Market Insight",
    excerpt:
      "What we are seeing across senior finance, technology and risk mandates in the mid-Atlantic this year.",
    readMinutes: 4,
    placeholder: true,
  },
  {
    title: "The Scorecard We Run Before Taking a Search",
    date: "Jul 1, 2025",
    iso: "2025-07-01",
    slug: "scorecard-before-taking-a-search",
    category: "Executive Search",
    excerpt:
      "Some mandates cannot be filled as written. Catching that in week one is worth more than a fast shortlist.",
    readMinutes: 8,
    placeholder: true,
  },
];

/** Newest first, so every surface that lists posts agrees on the order. */
export const BLOG_POSTS_BY_DATE = [...BLOG_POSTS].sort((a, b) =>
  a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0,
);

export const LINKEDIN_URL = "https://www.linkedin.com/company/district-partners";

/** Client names from the homepage logo strip. */
export const CLIENTS = [
  "Walker & Dunlop",
  "Riveron",
  "OTJ",
  "Guidehouse",
  "BRG",
  "Washington Commanders",
  "ChamberOfCommerce.com",
  "MAI Capital Management",
];

/** Figures as published on the homepage. */
export type Stat = {
  /** The figure itself, so it can count rather than sit there. */
  value: number;
  /** Rendered before the figure at full size. */
  prefix?: string;
  /** Rendered after the figure as a superscript. */
  unit?: string;
  label: string;
};

export const STATS: Stat[] = [
  { value: 1100, unit: "+", label: "Professionals delivered to 187 clients" },
  { value: 30, unit: "+", label: "Clients who've engaged us 5+ times" },
  { value: 90, prefix: ">", unit: "%", label: "Of clients through referrals" },
  { value: 100, unit: "%", label: "Placement on retainers" },
];

/**
 * Frequently placed positions.
 *
 * Read from the homepage screenshot, which is low resolution, so these need
 * confirming against the live site before launch. Anything unreadable was left
 * out rather than guessed at.
 */
export const PLACED_POSITIONS = [
  "Chief Financial Officer (CFO)",
  "Chief Human Resources Officer",
  "VP of Engineering",
  "Controller",
  "Chief Product Officer (CPO)",
  "Chief Information Security Officer (CISO)",
];

export const FOOTER_COLUMNS: NavGroup[] = [
  { heading: "What We Do", items: SERVICES },
  { heading: "Who We Serve", items: [...FUNCTIONS, ...INDUSTRIES.slice(0, 2)] },
  { heading: "Resources", items: [...RESOURCES, ...NEW_TOOLS] },
  { heading: "About", items: [...COMPANY, { label: "Contact", href: "/contact" }] },
];
