import Link from "@/components/SiteLink";
import Reveal from "@/components/Reveal";

export type Crumb = { label: string; href?: string };

/**
 * The standard page header: breadcrumb, eyebrow, title, optional standfirst.
 * Lighter than the homepage hero so interior pages do not compete with it.
 */
export default function PageHero({
  eyebrow,
  title,
  standfirst,
  crumbs = [],
}: {
  eyebrow?: string;
  title: string;
  standfirst?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--v-border)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(70%_120%_at_20%_-20%,rgba(62,123,250,0.16),transparent_62%)]"
      />
      <div className="relative mx-auto max-w-[1280px] px-6 pb-16 pt-14 sm:pb-20 sm:pt-16">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[var(--v-muted)]">
              {crumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-[var(--v-ink)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-[var(--v-ink)]">
                      {crumb.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && (
                    <span aria-hidden="true" className="text-[var(--v-muted)]/50">
                      /
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Reveal>
          <div>
            {eyebrow && <p className="v-eyebrow mb-4">{eyebrow}</p>}
            <h1 className="v-display max-w-[20ch] text-[clamp(2.1rem,5.2vw,3.25rem)] leading-[1.05]">
              {title}
            </h1>
            {standfirst && (
              <p className="mt-6 max-w-[62ch] text-[16.5px] leading-[1.75] text-[var(--v-muted)]">
                {standfirst}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
