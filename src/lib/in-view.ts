"use client";

/**
 * "Has this element been reached yet", answered in a way that cannot fail open.
 *
 * An IntersectionObserver is edge-triggered: it reports crossings, not state.
 * That makes it the wrong tool here, and it has now caused the same bug twice
 * in this project in two different disguises.
 *
 *   - Attach it after hydration and anything already scrolled past never
 *     intersects again, so a reveal stays at opacity 0 permanently.
 *   - Scroll quickly and a crossing can be coalesced away entirely, with the
 *     same result.
 *
 * On a reveal that shows as content that never appears. On a counting figure it
 * is worse: the number stays at its initial 0 and the page states, in display
 * type, that the firm has placed 0 professionals. A missed animation is a
 * blemish; a missed animation that renders as wrong data is a defect.
 *
 * So this is level-triggered instead. One shared rAF-coalesced pass over the
 * elements still waiting, run on scroll and resize, asking "is this element at
 * or above the trigger line" rather than "did it just cross it". An element
 * that has been scrolled past reads as far above the line and fires on the very
 * next frame.
 *
 * The cost is one getBoundingClientRect per waiting element per scroll frame.
 * The set only ever shrinks, the listeners detach the moment it empties, and a
 * long page has a few dozen entries, so it settles to zero within the first
 * scroll pass.
 */

type Waiter = { el: Element; fire: () => void };

const waiting = new Set<Waiter>();
let frame = 0;
let listening = false;

/** Fire once the element's top edge is inside the viewport by a little. */
const TRIGGER = 0.92;

function flush() {
  frame = 0;
  const line = window.innerHeight * TRIGGER;
  for (const w of waiting) {
    if (w.el.getBoundingClientRect().top < line) {
      waiting.delete(w);
      w.fire();
    }
  }
  if (waiting.size === 0) detach();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function detach() {
  if (!listening) return;
  listening = false;
  removeEventListener("scroll", schedule);
  removeEventListener("resize", schedule);
}

/**
 * Calls `fire` once, as soon as `el` has been reached. Returns an unsubscribe
 * for the case where the element unmounts first.
 */
export function whenReached(el: Element, fire: () => void) {
  const w: Waiter = { el, fire };
  waiting.add(w);

  if (!listening) {
    listening = true;
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
  }

  // Covers mount: anything already at or above the line fires immediately
  // rather than waiting for a scroll that may never come on a short page.
  schedule();

  return () => {
    waiting.delete(w);
    if (waiting.size === 0) detach();
  };
}
