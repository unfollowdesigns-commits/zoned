import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rania — Astrologie",
    short_name: "Rania",
    description: "Astrologie natale, psychologique, relationnelle et karmique.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060c",
    theme_color: "#05060c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
