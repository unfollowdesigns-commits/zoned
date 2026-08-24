"use client";

import { usePathname } from "next/navigation";
import NodeField from "@/components/NodeField";
import {
  VOCAB_DIFFERENCE,
  VOCAB_HOME,
  VOCAB_MARKETS,
  VOCAB_RESOURCES,
  VOCAB_SERVICES,
} from "@/lib/vocabulary";

/**
 * Picks the node field's vocabulary from the route.
 *
 * WHY THE ROUTE AND NOT A PROP. The words have to change per page or the whole
 * idea collapses into wallpaper with text on it, and a prop means every one of
 * the forty-odd pages has to remember to pass the right set. One place that
 * reads the path cannot be forgotten, and adding a section later is a line in
 * the table below rather than an edit to every page in it.
 *
 * Matched longest-prefix-first, so a more specific route wins over the section
 * it lives under.
 */
const BY_PREFIX: Array<[string, string[]]> = [
  ["/the-dp-difference", VOCAB_DIFFERENCE],
  ["/what-we-do", VOCAB_SERVICES],
  ["/who-we-serve", VOCAB_MARKETS],
  ["/resources", VOCAB_RESOURCES],
];

export default function PageNodes() {
  const pathname = usePathname() ?? "/";
  const match = BY_PREFIX.find(([prefix]) => pathname.startsWith(prefix));
  /* Falls back to the homepage set rather than to nothing: a page outside the
     table still gets the firm's own language, which is a better default than a
     board with no voice. */
  const labels = match ? match[1] : VOCAB_HOME;

  /* Dimmer than the homepage. Interior page heroes are short, so the board is
     seen at close quarters against a headline that sits right on it, and the
     0.9 that reads as atmosphere across a full viewport reads as noise here. */
  return <NodeField labels={labels} opacity={0.55} />;
}
