import "../globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "../fonts";

export const metadata: Metadata = {
  title: { default: "Administration · Rania", template: "%s · Administration Rania" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={fontVariables}>
      <body className="min-h-svh bg-[radial-gradient(80%_60%_at_80%_0%,rgba(145,137,208,0.12),transparent_60%),radial-gradient(60%_50%_at_0%_100%,rgba(207,174,118,0.08),transparent_60%)] bg-ink">
        {children}
      </body>
    </html>
  );
}
