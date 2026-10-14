import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rania — Astrologie natale, psychologique, relationnelle et karmique";

const taglines: Record<string, string> = {
  fr: "Astrologie natale · psychologique · relationnelle · karmique",
  en: "Natal · psychological · relational · karmic astrology",
  ar: "Natal · psychological · relational · karmic astrology",
};

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 70% 30%, #2a2350 0%, #05060c 60%)", color: "#f1e9dc", position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: 15, width: 600, height: 600, borderRadius: 600, border: "1px solid rgba(207,174,118,0.45)", display: "flex" }} />
        <div style={{ position: "absolute", right: -60, top: 75, width: 480, height: 480, borderRadius: 480, border: "1px solid rgba(207,174,118,0.25)", display: "flex" }} />
        {ticks.map((i) => {
          const a = (i / 72) * Math.PI * 2;
          return (
            <div key={i} style={{ position: "absolute", left: 1020 + Math.cos(a) * 300, top: 315 + Math.sin(a) * 300, width: 3, height: 3, borderRadius: 3, background: "#cfae76", opacity: i % 6 === 0 ? 0.9 : 0.35, display: "flex" }} />
          );
        })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", padding: "0 90px" }}>
          <div style={{ fontSize: 22, letterSpacing: 10, color: "#cfae76", display: "flex" }}>ASTROLOGIE</div>
          <div style={{ fontSize: 150, marginTop: 10, fontFamily: "serif", display: "flex" }}>Rania</div>
          <div style={{ fontSize: 30, color: "#a9a3b8", marginTop: 10, display: "flex" }}>{taglines[locale] ?? taglines.fr}</div>
        </div>
      </div>
    ),
    size,
  );
}
