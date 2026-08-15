import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "/tmp/claude-0/-home-user-zoned/e1851772-0b98-50fd-b78d-ec7dd39ba43a/scratchpad/shots";
fs.mkdirSync(OUT, { recursive: true });
const URL = "http://localhost:3100/";
const results = [];
const log = (s) => { console.log(s); results.push(s); };

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// ---- 5. Console check + 4. Screenshots + 6. Horizontal overflow ----
for (const w of [1440, 1280, 768, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  const msgs = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") msgs.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => msgs.push(`pageerror: ${e.message}`));

  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/home-${w}.png`, fullPage: true });

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  log(`[${w}px] overflow scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth} -> ${overflow.scrollWidth === overflow.clientWidth ? "OK" : "FAIL"}`);
  log(`[${w}px] console errors/warnings: ${msgs.length === 0 ? "none" : JSON.stringify(msgs)}`);
  await ctx.close();
}

// ---- 7. Hover / focus probe on a service tile ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(800);

  const tile = page.getByTestId("service-tile").first();
  await tile.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  const fp = async () => page.evaluate(() => {
    const tile = document.querySelector('[data-testid="service-tile"]'); const svg = tile && tile.querySelector("svg");
    if (!svg) return "no-svg";
    return Array.from(svg.querySelectorAll("path,circle")).map((n) => {
      const r = n.getBoundingClientRect();
      return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
    }).join("|");
  });

  const before = await fp();
  await tile.hover();
  await page.waitForTimeout(600);
  const during = await fp();
  await page.mouse.move(1300, 700);
  await page.waitForTimeout(1600);
  const after = await fp();

  log(`[hover] animates (during !== before): ${during !== before ? "OK" : "FAIL"}`);
  log(`[hover] returns to rest (after === before): ${after === before ? "OK" : "FAIL"}`);
  await ctx.close();
}

// ---- 8. prefers-reduced-motion probe ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1000);

  const fp = async () => page.evaluate(() => {
    const tile = document.querySelector('[data-testid="service-tile"]'); const svg = tile && tile.querySelector("svg");
    if (!svg) return "no-svg";
    return Array.from(svg.querySelectorAll("path,circle")).map((n) => {
      const r = n.getBoundingClientRect();
      return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
    }).join("|");
  });

  const tile = page.getByTestId("service-tile").first();
  await tile.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const before = await fp();
  await tile.hover();
  await page.waitForTimeout(700);
  const during = await fp();
  log(`[reduced-motion] geometry does NOT change: ${during === before ? "OK" : "CHANGED (review)"}`);

  // hero must not be stuck invisible
  const heroOpacity = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? getComputedStyle(h1).opacity : "no-h1";
  });
  log(`[reduced-motion] h1 opacity: ${heroOpacity} -> ${Number(heroOpacity) > 0.9 ? "OK" : "FAIL (invisible)"}`);
  await page.screenshot({ path: `${OUT}/home-reduced-1440.png`, fullPage: true });
  await ctx.close();
}

// ---- 10. Blank-frame sample on the hero word loop ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(500);
  let blank = 0;
  for (let i = 0; i < 40; i++) {
    const visible = await page.evaluate(() => {
      const spans = document.querySelectorAll("h1 .inline-grid > span");
      let maxOp = 0;
      spans.forEach((s) => { maxOp = Math.max(maxOp, parseFloat(getComputedStyle(s).opacity) || 0); });
      return maxOp;
    });
    if (visible < 0.35) blank++;
    await page.waitForTimeout(300);
  }
  log(`[hero loop] blank frames out of 40 samples: ${blank} -> ${blank === 0 ? "OK" : "FAIL"}`);
  await ctx.close();
}

// ---- 9. Keyboard pass ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const seq = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "none";
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== "none" && cs.outlineWidth !== "0px";
      return `${el.tagName}:${(el.textContent || "").trim().slice(0, 24)}|focusRing=${outline}`;
    });
    seq.push(info);
  }
  log(`[keyboard] first 10 tab stops:\n  ${seq.join("\n  ")}`);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/results.txt`, results.join("\n"));
console.log("\n=== DONE ===");
