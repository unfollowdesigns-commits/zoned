#!/usr/bin/env node
/**
 * Design conformance check.
 *
 * A document is advisory. This is not. Wire it into the build and the rules
 * stop being suggestions that get paraphrased away over a week of edits.
 *
 *   node kit/scripts/check-design.mjs src
 *   node kit/scripts/check-design.mjs src --fix-hint
 *
 * Exits 1 on any error. Warnings do not fail the build but are printed.
 *
 * These checks exist because each one is a real way the system degrades, and
 * every one of them is invisible in review: nobody notices the thirteenth font
 * size being added, they only notice six months later that the page looks
 * assembled rather than designed.
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, extname, relative } from "node:path"

const ROOT = process.argv[2] ?? "src"
const SRC_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css"])
const SKIP_DIR = new Set(["node_modules", ".next", "dist", "build", ".git", "kit"])

const errors = []
const warnings = []

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (SRC_EXT.has(extname(p))) out.push(p)
  }
  return out
}

function report(list, file, line, rule, detail) {
  list.push({ file, line, rule, detail })
}

/* ------------------------------------------------------------------ checks */

const files = walk(ROOT)
const fontSizes = new Map()   // size -> [{file, line}]

for (const file of files) {
  const text = readFileSync(file, "utf8")
  const lines = text.split("\n")
  const isCss = extname(file) === ".css"

  lines.forEach((line, i) => {
    const n = i + 1
    // Prose in a comment is not code. Without this the checker flags its own
    // documentation, which trains people to ignore it.
    const isComment = /^\s*(\*|\/\/|\/\*)/.test(line)

    // 1. Em dashes. House rule, and they are invisible in a diff.
    //    A bullet-marker character class in a regex is a legitimate exception.
    if (line.includes("\u2014") && !/\[[^\]]*\u2014[^\]]*\]/.test(line)) {
      report(errors, file, n, "em-dash", "Use a comma, colon or full stop.")
    }

    // 2. Linear easing on anything a person reads as an object.
    //    Legitimate on an ambient loop, so CSS keyframe animations are exempt
    //    and only JS transitions are flagged.
    //    An explicit /* linear-ok: reason */ opts a line out. Two cases are
    //    genuinely linear: an ambient loop that never stops, and a mechanical
    //    progress fill, which is a readout rather than an object in motion.
    if (!isCss && !isComment && /ease:\s*["']linear["']/.test(line)
        && !/linear-ok:/.test(line)) {
      report(errors, file, n, "linear-ease",
        "Real objects have mass. Import SPRING or EASE from lib/motion.")
    }

    // 3. Framer's reduced-motion hook used directly.
    //    Branching on it produces a hydration mismatch that leaves elements
    //    permanently invisible. See lib/use-reduced-motion.ts.
    if (/useReducedMotion/.test(line) && /from\s+["']framer-motion["']/.test(line)
        && !file.includes("use-reduced-motion")) {
      report(errors, file, n, "framer-reduced-motion",
        "Import from lib/use-reduced-motion instead. The raw hook breaks hydration.")
    }

    // 4. overflow-x: hidden on the document kills position: sticky.
    if (isCss && /^\s*(html|body|html\s*,\s*body)\b/.test(line)) {
      const block = lines.slice(i, i + 8).join(" ")
      if (/overflow-x:\s*hidden/.test(block)) {
        report(errors, file, n, "overflow-hidden",
          "Use `overflow-x: clip` on html/body. `hidden` silently breaks sticky.")
      }
    }

    // 5. Font sizes.
    //
    //    The rule is not "there are twelve sizes", it is THERE ARE NO
    //    LITERALS. Counting distinct sizes was the earlier rule and it was the
    //    wrong shape: it let a literal through as long as some other file had
    //    already used that number, and it fired on a legitimate clamp because
    //    a clamp mentions three. Requiring a token is simpler, catches more,
    //    and is the thing you actually want.
    //
    //    The tokens file itself declares them, so it is exempt.
    const declaring = file.endsWith("00-tokens.css")
    for (const m of isComment ? [] : line.matchAll(/(?:font-size:\s*|text-\[)(\d+(?:\.\d+)?)px/g)) {
      const size = parseFloat(m[1])
      if (!fontSizes.has(size)) fontSizes.set(size, [])
      fontSizes.get(size).push({ file, line: n })

      if (size < 11 && !declaring) {
        report(errors, file, n, "tiny-type",
          `${size}px. Nothing below 11px. If it does not fit, change the layout.`)
      } else if (!declaring) {
        report(errors, file, n, "literal-type",
          `${size}px is a literal. Use a --t-* token, or add one if the design ` +
          `genuinely needs a step it does not have.`)
      }
    }

    // 6. Hardcoded spring constants instead of the shared ones.
    //    A spread of a shared spring with one value overridden is a deliberate
    //    derivation, not a competing constant, so it passes.
    if (!isCss && !isComment && /stiffness:\s*\d/.test(line)
        && !/\.\.\.SPRING/.test(line) && !file.includes("lib/motion")) {
      report(warnings, file, n, "inline-spring",
        "Import SPRING or SPRING_SOFT so everything obeys the same physics.")
    }

    // 7. Trailing .0 on a displayed number.
    if (!isCss && /toFixed\(1\)/.test(line)) {
      report(warnings, file, n, "fake-precision",
        "toFixed(1) prints 200.0. Use dp(value, 1) so whole numbers stay whole.")
    }

    // 8. A panel with a single box-shadow reads as a sticker.
    if (isCss && /box-shadow:/.test(line) && !/inset/.test(lines.slice(i, i + 6).join(" "))) {
      const block = lines.slice(i, i + 6).join(" ")
      const commas = (block.slice(0, block.indexOf(";") + 1).match(/,/g) || []).length
      if (commas > 0 && commas < 3 && /0 \d+px \d+px/.test(block)) {
        report(warnings, file, n, "flat-shadow",
          "Depth is layered: an inset hairline plus three drop shadows. See .g-glass.")
      }
    }

    // 9. prefers-reduced-motion honoured somewhere in any file that animates.
    //    Checked per file at the end.
  })

  // 9 continued.
  if (!isCss && /(whileHover|whileInView|animate=\{|useSpring|useInView)/.test(text)) {
    if (!/useReducedMotion|prefers-reduced-motion/.test(text)) {
      report(warnings, file, 0, "no-reduced-motion",
        "This file animates but never checks the preference.")
    }
  }
}

/* ---- Type scale, reported for information -------------------------------- */
const distinct = [...fontSizes.keys()].sort((a, b) => a - b)
if (distinct.length) {
  console.log(`\nliteral px sizes found: ${distinct.join(", ")}`)
}

/* ------------------------------------------------------------------ output */

function print(list, label, colour) {
  if (!list.length) return
  console.log(`\n${colour}${label} (${list.length})\x1b[0m`)
  const byRule = {}
  for (const e of list) (byRule[e.rule] ??= []).push(e)
  for (const [rule, items] of Object.entries(byRule)) {
    console.log(`\n  ${rule}  ${items.length === 1 ? "" : `x${items.length}`}`)
    console.log(`    ${items[0].detail}`)
    for (const it of items.slice(0, 6)) {
      const where = it.line ? `${relative(process.cwd(), it.file)}:${it.line}` : it.file
      console.log(`      ${where}`)
    }
    if (items.length > 6) console.log(`      ... and ${items.length - 6} more`)
  }
}

console.log(`Design check: ${files.length} files under ${ROOT}/`)
print(warnings, "WARN", "\x1b[33m")
print(errors, "FAIL", "\x1b[31m")

if (!errors.length && !warnings.length) {
  console.log("\n\x1b[32mClean.\x1b[0m")
}
console.log()
process.exit(errors.length ? 1 : 0)
