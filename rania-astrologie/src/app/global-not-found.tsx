import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "./fonts";

export const metadata: Metadata = { title: "404 · Rania", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="cosmos-fallback grid min-h-svh place-items-center">
        <main className="px-6 text-center">
          <p className="font-display text-[clamp(6rem,20vw,12rem)] leading-none text-gradient-gold">404</p>
          <h1 className="t-2 mt-6 text-ivory">Cette page s&apos;est égarée parmi les étoiles.</h1>
          <p className="mt-3 text-mist">This page has wandered off among the stars.</p>
          <Link href="/" className="btn btn-primary mt-10">Accueil · Home</Link>
        </main>
      </body>
    </html>
  );
}
