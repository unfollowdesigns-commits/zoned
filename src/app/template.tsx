import { ViewTransition } from "react";

/**
 * The page transition: a feathered dissolve through the page's own black.
 *
 * WHY `template.tsx` AND NOT `layout.tsx`. A layout persists across
 * navigations, so its children change underneath it and enter and exit never
 * fire. A template is re-created on every navigation, which is the mount and
 * unmount lifecycle a transition needs. This is also why it wraps `children`
 * here rather than being placed in all 47 pages by hand: the docs suggest
 * per-page wrappers for DIRECTIONAL transitions, where each page needs to know
 * which way it is going. This one is the same in every direction, so it belongs
 * in one place.
 *
 * WHY THE BROWSER'S VIEW TRANSITIONS AND NOT A HAND-ROLLED CURTAIN. The
 * obvious build is a fixed black div, an intercepted link click, a timeout, and
 * a router push. That version has to guess how long the next route takes to
 * render, so it either uncovers a half-painted page or holds black longer than
 * it needs to. The browser snapshots the old page itself, so the old frame
 * stays on screen for free while the new one is prepared, and the fade is
 * between two real pictures rather than over a guess.
 *
 * The black is not painted by anything. It is `--v-bg` showing through while
 * both snapshots are down, which is why the dissolve lands on the site's own
 * ground rather than on a pure #000 that nothing else on the page uses.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  /* NAMED, and that is load bearing rather than cosmetic. Left unnamed, React
     assigns an automatic name to each child of the wrapped subtree: a probe of
     the animations during a real navigation showed seven separate groups,
     `_t_1__1` through `_t_1__7`, each running the user agent's own fade. The
     page was being dissolved in seven independent pieces, and `root` had
     nothing left in it to animate. One name makes the whole subtree one group,
     which is what a page dissolve means. */
  return (
    <ViewTransition name="page">
      {/* ONE ELEMENT INSIDE, not a fragment of sections.

          Naming the transition was not enough on its own. A page is a fragment
          of several top-level sections, so React named the first group `page`
          and the rest `page_3` through `page_7`: the named group got the
          dissolve and every sibling section got the user agent's plain fade, so
          the page came apart in strips. A single child collapses the whole
          subtree into one snapshot.

          A bare div, with no styles. It must not create a containing block or a
          scroll container: the hero pins with `position: sticky` and both of
          those silently demote it, which has broken this site three times. */}
      <div>{children}</div>
    </ViewTransition>
  );
}
