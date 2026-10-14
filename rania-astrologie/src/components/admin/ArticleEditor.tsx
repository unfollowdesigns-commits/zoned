"use client";

import { marked } from "marked";
import { useMemo, useState } from "react";
import { upsertArticle } from "@/app/actions/admin";
import { slugify } from "@/lib/article-utils";

type Initial = {
  id?: number;
  locale: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  coverMediaId: string | null;
  coverAlt: string;
  groupKey: string;
  status: string;
  publishedAt: string;
};

export function ArticleEditor({ initial }: { initial: Initial }) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [content, setContent] = useState(initial.contentMd);
  const [locale, setLocale] = useState(initial.locale);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const preview = useMemo(() => (tab === "preview" ? (marked.parse(content, { async: false }) as string) : ""), [content, tab]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <form action={upsertArticle} className="grid gap-6 xl:grid-cols-3">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="space-y-5 xl:col-span-2">
        <label className="field">
          <span className="field-label">Titre</span>
          <input
            name="title"
            className="input !text-xl"
            value={title}
            dir={dir}
            required
            maxLength={200}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </label>
        <label className="field">
          <span className="field-label">Adresse (slug)</span>
          <input name="slug" className="input font-mono text-sm" value={slug} maxLength={90} onChange={(e) => (setSlugTouched(true), setSlug(e.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">Chapô / résumé (affiché sur les cartes et pour le référencement)</span>
          <textarea name="excerpt" className="input !min-h-24" defaultValue={initial.excerpt} dir={dir} maxLength={600} />
        </label>
        <div className="field">
          <div className="flex items-center justify-between">
            <span className="field-label">Contenu (Markdown)</span>
            <div className="flex gap-1 rounded-full border border-line p-1 text-xs">
              {(["write", "preview"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-3 py-1 ${tab === t ? "bg-gold/15 text-gold-bright" : "text-mist"}`}>
                  {t === "write" ? "Écrire" : "Aperçu"}
                </button>
              ))}
            </div>
          </div>
          <textarea
            name="content"
            className={`input !min-h-[28rem] font-mono text-sm leading-relaxed ${tab === "preview" ? "hidden" : ""}`}
            value={content}
            dir={dir}
            onChange={(e) => setContent(e.target.value)}
          />
          {tab === "preview" && (
            <div className="prose-astro min-h-[28rem] rounded-xl border border-line p-6" dir={dir} dangerouslySetInnerHTML={{ __html: preview }} />
          )}
          <p className="text-xs text-mist">
            Astuces : <code>## Titre</code>, <code>**gras**</code>, <code>*italique*</code>, <code>&gt; citation</code>, <code>- liste</code>, <code>[lien](https://…)</code>
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-line bg-deep/60 p-5">
          <label className="field">
            <span className="field-label">Statut</span>
            <select name="status" className="input" defaultValue={initial.status}>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Date de publication</span>
            <input name="publishedAt" type="datetime-local" className="input" defaultValue={initial.publishedAt} />
          </label>
          <label className="field">
            <span className="field-label">Langue</span>
            <select name="locale" className="input" value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="ar">Arabe</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Clé de traduction (facultatif)</span>
            <input name="groupKey" className="input font-mono text-sm" defaultValue={initial.groupKey} placeholder="ex. noeuds-lunaires" />
            <span className="text-xs text-mist">Donnez la même clé aux versions FR / EN / AR d&apos;un même article pour les relier.</span>
          </label>
          <button className="btn btn-primary w-full !h-11">Enregistrer</button>
        </div>
        <div className="space-y-4 rounded-2xl border border-line bg-deep/60 p-5">
          <p className="field-label">Image de couverture</p>
          {initial.coverMediaId && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${initial.coverMediaId}`} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" />
              <label className="flex items-center gap-2 text-sm text-mist">
                <input type="checkbox" name="removeCover" className="checkbox !mt-0" /> Retirer l&apos;image
              </label>
            </>
          )}
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm text-mist file:me-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-4 file:py-2 file:text-gold-bright" />
          <p className="text-xs text-mist">JPEG, PNG, WebP ou AVIF · 3 Mo max.</p>
          <label className="field">
            <span className="field-label">Texte alternatif</span>
            <input name="coverAlt" className="input" defaultValue={initial.coverAlt} maxLength={200} />
          </label>
        </div>
      </aside>
    </form>
  );
}
