#!/usr/bin/env node
/**
 * Turns a video into the JPEG sequence that ScrollSequence scrubs.
 *
 *   node scripts/extract-frames.mjs --in hero.mp4 --out public/sequence/hero \
 *     --count 120 --width 1920 --quality 5
 *
 * WHY A FIXED COUNT RATHER THAN A FIXED FRAMERATE. The scrub maps scroll
 * position onto frame index, so what matters is how many frames exist, not what
 * rate they were shot at. Asking for exactly N frames spread across the clip
 * makes the scroll depth and the frame count independent of the source, so
 * swapping a 4-second clip for a 9-second one changes nothing downstream.
 *
 * ON SIZING. 1920 wide is the sensible ceiling for a full-bleed hero: the
 * component caps device pixel ratio at 2, so a 1920 source covers a 960pt
 * viewport at full density, and beyond that you are paying bytes for detail no
 * display resolves during a scroll. If the sequence is going in a card rather
 * than full bleed, size it to the card and the total drops quadratically.
 *
 * ON QUALITY. mjpeg -q:v runs 2 (best) to 31 (worst); 4-6 is the band where
 * artefacts stay invisible against motion. Sequences are seen for one frame
 * each, in motion, so they tolerate far more compression than a still would.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

/* ---- Arguments --------------------------------------------------------- */
const args = process.argv.slice(2);
function arg(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  if (fallback !== undefined) return fallback;
  console.error(`Missing required argument: --${name}`);
  process.exit(1);
}
const has = (name) => args.includes(`--${name}`);

const input = resolve(arg("in"));
const outDir = resolve(arg("out"));
const count = Number(arg("count", "120"));
const width = Number(arg("width", "1920"));
const quality = Number(arg("quality", "5"));

if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}
if (!Number.isFinite(count) || count < 2) {
  console.error("--count must be a number of at least 2");
  process.exit(1);
}

/* ---- Locating ffmpeg ---------------------------------------------------- */
/* Playwright ships a static ffmpeg build for video capture. If the machine has
   no system ffmpeg, that copy is already on disk and works fine here, which
   saves asking anyone to install anything. */
function findFfmpeg() {
  const candidates = ["ffmpeg"];
  const pwRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (existsSync(pwRoot)) {
    for (const entry of readdirSync(pwRoot)) {
      if (!entry.startsWith("ffmpeg")) continue;
      for (const rel of ["ffmpeg-linux", "ffmpeg-mac", "ffmpeg-win64.exe"]) {
        const candidate = join(pwRoot, entry, rel);
        if (existsSync(candidate)) candidates.unshift(candidate);
      }
    }
  }
  return candidates;
}

function run(bin, argv) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, argv, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolvePromise(stderr) : reject(new Error(stderr || `exit ${code}`)),
    );
  });
}

async function pickFfmpeg() {
  for (const bin of findFfmpeg()) {
    try {
      await run(bin, ["-version"]);
      return bin;
    } catch {
      /* try the next candidate */
    }
  }
  console.error(
    "No ffmpeg found. Install it (`brew install ffmpeg` / `apt install ffmpeg`)\n" +
      "or run `npx playwright install ffmpeg` to use the bundled build.",
  );
  process.exit(1);
}

/* ---- Probing the source ------------------------------------------------- */
async function durationOf(ffmpeg, file) {
  /* ffprobe is the right tool but is not always installed alongside ffmpeg, and
     the static builds ship only ffmpeg. Parsing ffmpeg's own banner avoids the
     extra dependency for the one number needed here. */
  let stderr = "";
  try {
    await run(ffmpeg, ["-i", file]);
  } catch (error) {
    stderr = error.message;
  }
  const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

/* ---- Extract ------------------------------------------------------------ */
const ffmpeg = await pickFfmpeg();
const duration = await durationOf(ffmpeg, input);
if (!duration) {
  console.error("Could not read the source duration. Is this a video file?");
  process.exit(1);
}

/* Spread `count` frames across the clip. The last frame lands one interval
   short of the end rather than exactly on it, because the final timestamp is
   often not a decodable position and ffmpeg silently emits one frame fewer,
   which then leaves the scrub's last frame undefined. */
const fps = (count - 1) / duration;

if (has("clean") && existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

console.log(`ffmpeg    ${ffmpeg}`);
console.log(`source    ${input}  (${duration.toFixed(2)}s)`);
console.log(`target    ${count} frames at ${width}px, q${quality}`);
console.log(`sampling  ${fps.toFixed(4)} fps\n`);

await run(ffmpeg, [
  "-y",
  "-i", input,
  /* `scale=W:-2` keeps the aspect ratio and forces an even height, which the
     JPEG encoder's chroma subsampling requires. `-1` would allow an odd number
     and fail on some sources. */
  "-vf", `fps=${fps},scale=${width}:-2:flags=lanczos`,
  "-q:v", String(quality),
  /* Without this ffmpeg stops at whatever the fps filter yields, which rounding
     can make count+1. Capping guarantees the exact number the component expects. */
  "-frames:v", String(count),
  join(outDir, "frame_%03d.jpg"),
]);

/* ---- Report ------------------------------------------------------------- */
const files = readdirSync(outDir).filter((f) => /^frame_\d+\.jpg$/.test(f));
const bytes = files.reduce((sum, f) => sum + statSync(join(outDir, f)).size, 0);
const mb = bytes / 1024 / 1024;

console.log(`\nwrote     ${files.length} frames`);
console.log(`total     ${mb.toFixed(2)} MB  (avg ${(bytes / files.length / 1024).toFixed(0)} KB)`);

if (files.length !== count) {
  console.warn(
    `\nWarning: asked for ${count} frames, got ${files.length}. Pass that number ` +
      `as ScrollSequence's \`count\` or the scrub will run past the end.`,
  );
}
if (mb > 12) {
  console.warn(
    `\nWarning: ${mb.toFixed(1)} MB is heavy for a hero. Lower --width, raise ` +
      `--quality, or cut --count; the eye cannot resolve much past 90 frames ` +
      `across a 300vh scroll.`,
  );
}
