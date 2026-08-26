import { ImageResponse } from "next/og";
import { MARK_PARTS } from "@/components/Logo";

/**
 * The card that appears when the site is pasted into Slack, iMessage, LinkedIn
 * or a text message.
 *
 * IT DID NOT EXIST, AND THAT IS A REAL GAP RATHER THAN A POLISH ITEM. With no
 * `og:image`, every share of this site rendered as a bare grey rectangle with
 * a URL under it. The first thing a client sends to a colleague is a link, and
 * that link was arriving looking broken.
 *
 * GENERATED, NOT EXPORTED. Same reasoning as app/icon: the mark comes from
 * MARK_PARTS, so this card, the tab icon, the header lockup and the preloader
 * are one drawing and cannot drift apart. It also means no 1.2MB PNG in the
 * repository that somebody has to re-cut when a word changes.
 *
 * BUILT FOR THE SIZE IT IS SEEN AT. 1200x630 is the size every platform
 * crops toward, and most of them show it at a few hundred pixels wide in a
 * feed. So: one line of type at 64px, the mark, and nothing else. A card
 * carrying a paragraph is a card nobody reads.
 */

export const alt = "District Partners: executive and professional search";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          /* The site's own dark ground, stated literally: this renders in an
             isolated context with no stylesheet and no CSS custom properties. */
          background: "linear-gradient(135deg, #0b1226 0%, #080b16 55%, #050710 100%)",
        }}
      >
        {/* The lockup: monogram, rule, wordmark, as in the header. */}
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <svg width="72" height="80" viewBox={MARK_PARTS.viewBox}>
            <path d={MARK_PARTS.bracket} fill={MARK_PARTS.blue} />
            <path d={MARK_PARTS.blueRing} fillRule="evenodd" fill={MARK_PARTS.blue} />
            <path d={MARK_PARTS.inkRing} fillRule="evenodd" fill="#ffffff" />
          </svg>
          <div style={{ width: 2, height: 62, background: "rgba(255,255,255,0.28)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ color: "#fff", fontSize: 30, letterSpacing: 7, fontWeight: 600 }}>
              DISTRICT
            </div>
            <div style={{ color: "#fff", fontSize: 20, letterSpacing: 12, fontWeight: 500 }}>
              PARTNERS
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              color: "#5b93ff",
              fontSize: 21,
              letterSpacing: 4,
              fontWeight: 600,
            }}
          >
            TALENT INFRASTRUCTURE
          </div>
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontSize: 64,
              lineHeight: 1.1,
              letterSpacing: -1.6,
              fontWeight: 700,
              maxWidth: 900,
            }}
          >
            Our talent is finding yours.
          </div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.62)", fontSize: 26 }}>
            Executive search, professional search, and interim solutions.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
