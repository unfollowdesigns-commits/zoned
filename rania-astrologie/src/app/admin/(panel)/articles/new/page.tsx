import Link from "next/link";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { AdminTitle, Flash } from "@/components/admin/ui";

export const metadata = { title: "Nouvel article" };

export default async function NewArticle({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <>
      <Link href="/admin/articles" className="text-sm text-mist hover:text-gold-bright">← Articles</Link>
      <AdminTitle title="Nouvel article" />
      <Flash sp={sp} />
      <ArticleEditor
        initial={{ locale: "fr", title: "", slug: "", excerpt: "", contentMd: "", coverMediaId: null, coverAlt: "", groupKey: "", status: "draft", publishedAt: "" }}
      />
    </>
  );
}
