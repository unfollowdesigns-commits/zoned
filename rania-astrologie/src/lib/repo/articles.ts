import "server-only";
import type { Row } from "@libsql/client";
import type { Locale } from "@/i18n/config";
import { all, isUniqueViolation, num, numOrNull, one, run, str, strOrNull } from "../db";

export type Article = {
  id: number;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  coverMediaId: string | null;
  coverAlt: string;
  groupKey: string | null;
  status: "draft" | "published";
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

const map = (r: Row): Article => ({
  id: num(r.id),
  locale: str(r.locale) as Locale,
  slug: str(r.slug),
  title: str(r.title),
  excerpt: str(r.excerpt),
  contentMd: str(r.content_md),
  coverMediaId: strOrNull(r.cover_media_id),
  coverAlt: str(r.cover_alt),
  groupKey: strOrNull(r.group_key),
  status: str(r.status) as Article["status"],
  publishedAt: numOrNull(r.published_at),
  createdAt: num(r.created_at),
  updatedAt: num(r.updated_at),
});

const PUBLISHED = "status = 'published' AND published_at IS NOT NULL AND published_at <= ?";

export const listPublished = (locale: Locale, limit = 50) =>
  all(`SELECT * FROM articles WHERE locale = ? AND ${PUBLISHED} ORDER BY published_at DESC LIMIT ?`, [locale, Date.now(), limit], map);

export const getPublished = (locale: Locale, slug: string) =>
  one(`SELECT * FROM articles WHERE locale = ? AND slug = ? AND ${PUBLISHED}`, [locale, slug, Date.now()], map);

export const listAllPublished = () =>
  all(`SELECT * FROM articles WHERE ${PUBLISHED} ORDER BY published_at DESC`, [Date.now()], map);

/** Published translations sharing a group key (for hreflang + language switcher). */
export const listTranslations = (groupKey: string) =>
  all(`SELECT * FROM articles WHERE group_key = ? AND ${PUBLISHED}`, [groupKey, Date.now()], map);

export const listArticlesAdmin = () => all("SELECT * FROM articles ORDER BY updated_at DESC LIMIT 500", [], map);
export const getArticle = (id: number) => one("SELECT * FROM articles WHERE id = ?", [id], map);

export type ArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;

export async function saveArticle(id: number | null, a: ArticleInput): Promise<{ ok: true; id: number } | { ok: false; reason: "slug" }> {
  const now = Date.now();
  try {
    if (id) {
      await run(
        `UPDATE articles SET locale=?, slug=?, title=?, excerpt=?, content_md=?, cover_media_id=?, cover_alt=?, group_key=?,
         status=?, published_at=?, updated_at=? WHERE id=?`,
        [a.locale, a.slug, a.title, a.excerpt, a.contentMd, a.coverMediaId, a.coverAlt, a.groupKey, a.status, a.publishedAt, now, id],
      );
      return { ok: true, id };
    }
    const rs = await run(
      `INSERT INTO articles (locale, slug, title, excerpt, content_md, cover_media_id, cover_alt, group_key, status, published_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,
      [a.locale, a.slug, a.title, a.excerpt, a.contentMd, a.coverMediaId, a.coverAlt, a.groupKey, a.status, a.publishedAt, now, now],
    );
    return { ok: true, id: num(rs.rows[0].id) };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, reason: "slug" };
    throw e;
  }
}

export async function deleteArticle(id: number): Promise<void> {
  await run("DELETE FROM articles WHERE id = ?", [id]);
}

export { readingMinutes, slugify } from "../article-utils";
