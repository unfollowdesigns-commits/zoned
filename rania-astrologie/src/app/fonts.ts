import { Amiri, Cormorant_Garamond, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";

export const displayLatin = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-latin",
  display: "swap",
});

export const sansLatin = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans-latin",
  display: "swap",
});

export const displayArabic = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-display-arabic",
  display: "swap",
});

export const sansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-arabic",
  display: "swap",
});

export const fontVariables = [displayLatin.variable, sansLatin.variable, displayArabic.variable, sansArabic.variable].join(" ");
