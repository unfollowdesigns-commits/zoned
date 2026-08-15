/**
 * Crawls every route on the running site and checks, per route and per width:
 * console errors, horizontal overflow, a visible h1, and no element left
 * stranded invisible after a full scroll pass.
 *
 * Usage: node scripts/crawl.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.env.SHOT_DIR ?? null;

const ROUTES = [
  "/",
  "/what-we-do",
  "/what-we-do/executive-search",
  "/what-we-do/professional-search",
  "/what-we-do/interim-solutions",
  "/what-we-do/fractional",
  "/what-we-do/project-support",
  "/who-we-serve",
  "/who-we-serve/finance-accounting",
  "/who-we-serve/technology-digital-ai",
  "/who-we-serve/risk-compliance",
  "/who-we-serve/marketing-revenue",
  "/who-we-serve/professional-business-services",
  "/who-we-serve/private-capital",
  "/who-we-serve/tech-ai-digital-platforms",
  "/who-we-serve/govcon-public-sector",
  "/who-we-serve/financial-services",
  "/who-we-serve/wealth-management",
  "/who-we-serve/real-estate-construction-manufacturing",
  "/who-we-serve/healthcare",
  "/resources",
  "/resources/blog",
  "/resources/blog/candidates-who-thrive-as-independent-consultants",
  "/resources/blog/inc-5000-washington-dc-no-1",
  "/resources/blog/understanding-the-big-picture-accounting-career",
  "/resources/case-studies",
  "/resources/current-opportunities",
  "/resources/resume-builder",
  "/resources/job-description-engine",
  "/about",
  "/about/team",
  "/about/accolades",
  "/about/careers",
  "/contact",
  "/privacy",
  "/terms",
  "/this-route-does-not-exist",
];

const WIDTHS = [1440, 390];
const failures = [];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const problems = [];
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

    const res = await page.goto(BASE + route, { waitUntil: "load" });
    const expect404 = route === "/this-route-does-not-exist";
    const status = res?.status();
    if (expect404 ? status !== 404 : status !== 200) {
      failures.push(`${route} @${width}: HTTP ${status}`);
    }

    await page.waitForTimeout(500);

    // full scroll pass so every whileInView reveal fires
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= H; y += 400) {
      await page.evaluate((s) => window.scrollTo(0, s), y);
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(700);

    const checks = await page.evaluate(() => {
      const de = document.documentElement;
      const h1 = document.querySelector("h1");
      const stranded = Array.from(document.querySelectorAll("[style*='opacity']"))
        .filter((el) => {
          const text = (el.textContent || "").trim();
          if (!text) return false;
          return parseFloat(getComputedStyle(el).opacity) < 0.9;
        })
        .map((el) => (el.textContent || "").trim().slice(0, 40));
      return {
        scrollWidth: de.scrollWidth,
        clientWidth: de.clientWidth,
        h1: h1 ? (h1.textContent || "").trim().slice(0, 50) : null,
        h1Opacity: h1 ? getComputedStyle(h1.closest("[style]") || h1).opacity : null,
        stranded,
      };
    });

    if (checks.scrollWidth !== checks.clientWidth) {
      failures.push(
        `${route} @${width}: overflow ${checks.scrollWidth} vs ${checks.clientWidth}`,
      );
    }
    if (!checks.h1) failures.push(`${route} @${width}: no h1`);
    if (checks.h1 && Number(checks.h1Opacity) < 0.9) {
      failures.push(`${route} @${width}: h1 invisible (opacity ${checks.h1Opacity})`);
    }
    // the hero's rotating words are intentionally stacked at opacity 0
    const realStranded = checks.stranded.filter(
      (t) => !["Professionals.", "Leaders.", "Solutions.", "Yours."].includes(t),
    );
    if (realStranded.length) {
      failures.push(`${route} @${width}: stranded invisible ${JSON.stringify(realStranded)}`);
    }
    // A 404 route legitimately logs a failed document load; that is the
    // response under test, not a defect.
    const realProblems = expect404
      ? problems.filter((p) => !/status of 404/.test(p))
      : problems;
    if (realProblems.length) {
      failures.push(`${route} @${width}: console ${JSON.stringify(realProblems)}`);
    }

    if (OUT && width === 1440) {
      const name = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    }

    await page.close();
  }
  await ctx.close();
  console.log(`swept ${ROUTES.length} routes @${width}`);
}

await browser.close();

if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  failures.forEach((f) => console.log("  -", f));
  process.exit(1);
}
console.log(`\nAll ${ROUTES.length} routes clean at ${WIDTHS.join(" and ")}px.`);
