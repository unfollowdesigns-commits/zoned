import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbs } from "@/lib/schema-org";
import { env } from "@/lib/env";

/** Visible breadcrumb trail + BreadcrumbList structured data. The last item is the current page. */
export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-[0.8rem] text-mist" data-reveal>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((it, i) => (
            <li key={it.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-faint">/</span>}
              {i < items.length - 1 ? (
                <Link href={it.href} className="link-underline inline-block py-1.5 hover:text-ivory">{it.name}</Link>
              ) : (
                <span aria-current="page" className="text-ivory/80">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbs(items.map((it) => ({ name: it.name, url: `${env.siteUrl}${it.href}` })))} />
    </>
  );
}
