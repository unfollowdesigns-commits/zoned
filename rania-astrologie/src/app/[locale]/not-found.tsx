import Link from "next/link";
import { getDictionary } from "@/i18n";

// Rendered inside the [locale] layout; locale-specific copy falls back to French.
export default function NotFound() {
  const t = getDictionary("fr").notFound;
  return (
    <section className="grid min-h-[80svh] place-items-center pt-[var(--header-h)]">
      <div className="container-narrow text-center">
        <p className="font-display text-[clamp(6rem,20vw,12rem)] leading-none text-gradient-gold">404</p>
        <h1 className="t-2 mt-6 text-ivory">{t.title}</h1>
        <p className="lede mt-4">{t.body}</p>
        <Link href="/" className="btn btn-primary mt-10">{t.cta}</Link>
      </div>
    </section>
  );
}
