"use client"

/**
 * First-paint curtain.
 *
 * The first thing anybody sees, and the piece most often left out of a rebuild
 * entirely, which is why a rebuilt site can be correct in every other respect
 * and still feel like a different product on arrival.
 *
 * Four decisions carry it, and all four are easy to get wrong:
 *
 * 1. IT SHIPS IN THE SERVER HTML, not on mount. A curtain that appears after
 *    hydration lets the page flash underneath it first, which is worse than no
 *    curtain at all.
 *
 * 2. RETURNING VISITORS NEVER SEE IT. A pre-paint script in <head> stamps
 *    data-loaded on <html> when the session key is present or reduced motion is
 *    requested, and CSS hides the curtain before anything paints. Tearing it
 *    down on mount instead would show it for two frames every navigation.
 *
 * 3. THE MOTION PREFERENCE IS READ DIRECTLY, not through the shared hook. The
 *    hook resolves after the first render by design, and a re-run of this effect
 *    would tear the curtain down a few frames in, which reads as a glitch.
 *
 * 4. THE PROGRESS BAR EASES, it does not tick. easeOutExpo toward 100 reads as
 *    work finishing. A linear timer reads as a fake loading bar, because it is.
 *    It is a CSS animation, for the same reason as note 1: it has to be moving
 *    in the server HTML. Driven from React state it sat at 0 until hydration,
 *    which on a cold load is most of the curtain's life, so the first thing a
 *    visitor saw was a dead bar. The same bug hid the bloom, which is a Framer
 *    element and therefore rendered at its `initial` opacity of 0: the curtain
 *    was flat black behind the mark for the whole of the first paint, which is
 *    precisely the "reads as an error page" this file warns about two notes
 *    below. Nothing inside a curtain may depend on hydration to be visible.
 *
 * 5. THE CLEANUP DOES NOT STAMP data-loaded, and that is a fix rather than an
 *    omission. It used to, to guarantee a page is never left scroll-locked
 *    behind a departing curtain. The guarantee is right; doing it there was
 *    wrong. React re-runs effects on a StrictMode remount and on Fast Refresh,
 *    and each cleanup stamped the attribute, which the stylesheet reads as
 *    "curtain finished" and hides it. Measured: released 1423ms into the load
 *    against a 1850ms duration, so the mark was cut off mid-assembly every
 *    time, in development only, which is exactly where it would be judged.
 *
 *    Scroll safety does not need it. The lock is written
 *    `html:not([data-loaded]):has(.v-curtain)`, so it releases the moment the
 *    curtain leaves the DOM whether or not anything was stamped. The attribute
 *    is now set only where it means what it says: the curtain has run.
 *
 * The mark is a prop. Pass the client's own logo as an SVG. Everything else
 * here is the mechanism, which is what actually needs to be copied.
 */

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

/* Long enough for the mark to assemble and settle (see the caller's mark
   animation, which finishes around 1.4s) and no longer. A curtain is a cost
   paid by every first-time visitor, so it buys exactly the time its content
   needs. */
const DURATION_MS = 1650
const EXIT = { duration: 0.52, ease: [0.65, 0, 0.35, 1] } as const

export function Curtain({
  mark,
  sessionKey = "site.loaded.v1",
  label,
}: {
  /** The client's mark, as SVG or any node. Sized by the caller. */
  mark: React.ReactNode
  /** Bump the version suffix to show the curtain again after a redesign. */
  sessionKey?: string
  /** Optional word under the bar. Keep it to one. */
  label?: string
}) {
  // Starts true so the server and the first client render agree. The CSS has
  // already hidden it for returning visitors by the time this runs.
  const [show, setShow] = React.useState(true)

  // Deliberately empty deps. See note 3 above.
  React.useEffect(() => {
    const root = document.documentElement
    let seen = false
    try { seen = sessionStorage.getItem(sessionKey) === "1" } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (seen || reduce) {
      root.setAttribute("data-loaded", "1")
      setShow(false)
      return
    }

    const done = setTimeout(() => {
      setShow(false)
      root.setAttribute("data-loaded", "1")
      try { sessionStorage.setItem(sessionKey, "1") } catch {}
    }, DURATION_MS)

    // See note 5: clear the timer, and nothing else. Stamping here is what
    // released the curtain early on every StrictMode remount.
    return () => clearTimeout(done)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="curtain"
          className="v-curtain fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[var(--v-bg)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT }}
          aria-hidden
        >
          {/* Ambient bloom behind the mark. Without it the mark sits on flat
              black and the curtain reads as an error page. CSS, not Framer:
              see note 4. */}
          <span
            aria-hidden
            className="v-curtain-bloom pointer-events-none absolute h-[460px] w-[460px] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, color-mix(in srgb, var(--v-primary) 30%, transparent), transparent 65%)",
            }}
          />

          {/* The mark leaves upward and slightly larger, so the curtain reads as
              lifting rather than dissolving. */}
          <motion.div
            className="relative"
            exit={{ scale: 1.07, y: -12, opacity: 0, transition: { duration: 0.44, ease: [0.65, 0, 0.35, 1] } }}
          >
            {mark}
          </motion.div>

          {/* A hairline bar, not a spinner. A spinner says "waiting", a filling
              rule says "nearly there", and the second is true. */}
          <div className="relative mt-9 h-px w-[168px] overflow-hidden bg-white/10">
            <span
              aria-hidden
              className="v-curtain-fill absolute inset-y-0 left-0 bg-[linear-gradient(90deg,transparent,var(--v-primary),var(--v-ring))]"
              style={{ ["--dur" as string]: `${DURATION_MS - 250}ms` }}
            />
          </div>

          {label && (
            <p className="mt-4 text-[length:var(--t-label)] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * The pre-paint script. Put this in <head>, before anything else.
 *
 * It must be synchronous and inline. An external or deferred script runs after
 * the first paint, which is exactly the flash this exists to prevent.
 *
 *   <script dangerouslySetInnerHTML={{ __html: curtainPrePaint() }} />
 */
export function curtainPrePaint(sessionKey = "site.loaded.v1"): string {
  return (
    `try{if(sessionStorage.getItem('${sessionKey}')==='1'||` +
    `matchMedia('(prefers-reduced-motion: reduce)').matches){` +
    `document.documentElement.setAttribute('data-loaded','1')}}catch(e){}`
  )
}
