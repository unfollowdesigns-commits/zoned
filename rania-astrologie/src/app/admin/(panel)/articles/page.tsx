import Link from "next/link";
import { AdminTitle, Flash } from "@/components/admin/ui";
import { listArticlesAdmin } from "@/lib/repo/articles";
import { formatDate, nowMs } from "@/lib/time";

export const metadata = { title: "Articles" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const articles = await listArticlesAdmin();
  return (
    <>
      <AdminTitle title="Articles" subtitle="Votre journal astrologique, en trois langues." actions={<Link href="/admin/articles/new" className="btn btn-primary !h-11">Nouvel article</Link>} />
      <Flash sp={sp} />
      {articles.length === 0 ? (
        <p className="text-mist">Aucun article pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-deep/60">
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/articles/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-ivory/[0.03]">
                <span>
                  <span className="block font-display text-xl text-ivory" dir={a.locale === "ar" ? "rtl" : "ltr"}>{a.title}</span>
                  <span className="text-xs text-mist">
                    {a.locale.toUpperCase()} · /{a.slug} · modifié le {formatDate(a.updatedAt, "fr")}
                  </span>
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs ${a.status === "published" ? "border-emerald-400/40 text-emerald-300" : "border-line text-mist"}`}>
                  {a.status === "published" ? (a.publishedAt && a.publishedAt > nowMs() ? "Programmé" : "Publié") : "Brouillon"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
