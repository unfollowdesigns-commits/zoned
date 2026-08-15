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
  { label: "GovCon & Public Sector", href: "/who-we-serve/govcon-public-sector", icon: "briefcase" },
  { label: "Financial Services", href: "/who-we-serve/financial-services", icon: "building" },
  { label: "Wealth Management", href: "/who-we-serve/wealth-management", icon: "brain" },
  {
    label: "Real Estate, Construction, & Manufacturing",
    href: "/who-we-serve/real-estate-construction-manufacturing",
    icon: "landmark",
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
  { label: "Meet Our Team", href: "/about/team" },
  { label: "Accolades", href: "/about/accolades" },
  { label: "Careers at DP", href: "/about/careers" },
];

export type BlogPost = {
  title: string;
  date: string;
  iso: string;
  slug: string;
};

/** Posts surfaced in the About mega-menu on the live site. */
export const BLOG_POSTS: BlogPost[] = [
  {
    title: "The 5 Candidates Who Thrive as Independent Consultants, and the 2 Who Shouldn't",
    date: "Mar 5, 2026",
    iso: "2026-03-05",
    slug: "candidates-who-thrive-as-independent-consultants",
  },
  {
    title: "District Partners Ranks No. 1 in Washington, D.C. on the 2023 Inc. 5000",
    date: "Mar 15, 2024",
    iso: "2024-03-15",
    slug: "inc-5000-washington-dc-no-1",
  },
  {
    title: "Understanding the Big Picture to Get Ahead in Your Accounting Career",
    date: "Feb 13, 2020",
    iso: "2020-02-13",
    slug: "understanding-the-big-picture-accounting-career",
  },
];

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
