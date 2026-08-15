import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Internal link with prefetching off.
 *
 * The nav mirrors the live District Partners information architecture, but the
 * body content for those routes has not been built yet. Prefetching them would
 * fire background requests for routes that do not exist and surface 404s in the
 * console. Drop this wrapper (or flip the default) once the routes are real.
 */
export default function SiteLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />;
}
