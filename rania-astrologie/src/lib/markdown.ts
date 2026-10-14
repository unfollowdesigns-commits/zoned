import "server-only";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

const marked = new Marked({ gfm: true, breaks: false });

/** Markdown → sanitised HTML. Even admin-authored content is sanitised (defence in depth). */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "blockquote", "ul", "ol", "li",
      "a", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption", "sup", "sub",
    ],
    allowedAttributes: { a: ["href", "title", "rel", "target"], img: ["src", "alt", "title"] },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:/i.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external ? { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" } : attribs,
        };
      },
      h1: "h2",
    },
    // allow relative links/images (e.g. /media/xyz) by also permitting scheme-less URLs
    allowedSchemesAppliedToAttributes: ["href", "src"],
  }).replace(/<img /g, '<img loading="lazy" decoding="async" ');
}
