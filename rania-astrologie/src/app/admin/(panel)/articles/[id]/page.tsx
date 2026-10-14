import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteArticle } from "@/app/actions/admin";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminTitle, Flash, btnDanger, btnSm } from "@/components/admin/ui";
import { getArticle } from "@/lib/repo/articles";
import { getSettings } from "@/lib/settings";
import { utcToZonedParts } from "@/lib/time";

export const metadata = { title: "Modifier l'article" };

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const a = await getArticle(Number(id));
  if (!a) notFound();
  const { timezone } = await getSettings();
  const pub = a.publishedAt ? utcToZonedParts(a.publishedAt, timezone) : null;
  return (
    <>
      <Link href="/admin/articles" className="text-sm text-mist hover:text-gold-bright">← Articles</Link>
      <AdminTitle
        title="Modifier l'article"
        actions={
          <div className="flex gap-2">
            {a.status === "published" && (
              <a href={`/${a.locale}/journal/${encodeURIComponent(a.slug)}`} target="_blank" className={btnSm}>Voir en ligne ↗</a>
            )}
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmButton message="Supprimer définitivement cet article ?" className={btnDanger}>Supprimer</ConfirmButton>
            </form>
          </div>
        }
      />
      <Flash sp={sp} />
      <ArticleEditor
        key={a.updatedAt}
        initial={{
          id: a.id,
          locale: a.locale,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          contentMd: a.contentMd,
          coverMediaId: a.coverMediaId,
          coverAlt: a.coverAlt,
          groupKey: a.groupKey ?? "",
          status: a.status,
          publishedAt: pub ? `${pub.date}T${pub.time}` : "",
        }}
      />
    </>
  );
}
