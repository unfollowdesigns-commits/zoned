import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Internal link. Every route in the navigation now exists, so this is a plain
 * pass-through to next/link with prefetching left at its default.
 *
 * It stays as a seam: if a future menu entry points somewhere unbuilt, prefetch
 * can be disabled here in one place rather than at every call site.
 */
export default function SiteLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
