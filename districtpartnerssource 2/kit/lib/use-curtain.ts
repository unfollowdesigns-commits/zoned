"use client"

import * as React from "react"

/**
 * True once the first-paint curtain is out of the way.
 *
 * Entrance animations above the fold were running to completion behind the
 * loader. Measured: the metrics strip went from blur(14px) to blur(0) between
 * 1.4s and 2.4s, while the curtain was still covering the page at 2.9s. The
 * animation was real, correct, and completely invisible, so the section looked
 * static to every first-time visitor.
 *
 * The loader stamps data-loaded on the document element when it finishes, and
 * the pre-paint script stamps it immediately for anyone who has already seen
 * it, so this resolves instantly on a return visit and waits exactly as long as
 * the curtain lasts on a first one.
 */
export function useCurtainDone(): boolean {
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    const root = document.documentElement
    if (root.hasAttribute("data-loaded")) {
      setDone(true)
      return
    }
    const observer = new MutationObserver(() => {
      if (root.hasAttribute("data-loaded")) {
        setDone(true)
        observer.disconnect()
      }
    })
    observer.observe(root, { attributes: true, attributeFilter: ["data-loaded"] })
    return () => observer.disconnect()
  }, [])

  return done
}
