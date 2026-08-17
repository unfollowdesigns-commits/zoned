import type { Metadata } from "next";
import { DM_Sans, Familjen_Grotesk, Space_Grotesk, Archivo } from "next/font/google";
import { Shell, Atmosphere } from "@/kit/components/Atmosphere";
import { prePaintScript } from "@/lib/preload";
import Preloader from "@/components/Preloader";
import Assistant from "@/components/Assistant";
import MotionProvider from "@/components/MotionProvider";
import { ScrollProgress } from "@/kit/components/Scroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

/* Body and copy. */
const body = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
});

/* Eyebrows and labels only. Never used for body or display. */
const label = Space_Grotesk({
  variable: "--font-label-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/* Display: everything above 20px.
 *
 * The brand face is GT America, which is licensed commercial type from Grilli
 * Type. It cannot be fetched, bundled from a CDN, or served from a free mirror,
 * and a "free download" of it is a pirated copy that would put the client in
 * breach on their own site. So it is declared in globals.css against files in
 * public/fonts/ and simply takes over the moment those files exist.
 *
 * Archivo loads as the fallback and is chosen to fail well: it is a neo-
 * grotesque of the same American gothic lineage, with a comparable x-height and
 * width, so the layout does not reflow when the real face lands. See the
 * @font-face block in globals.css for the exact filenames. */
const display = Archivo({
  variable: "--font-display-fallback",
  subsets: ["latin"],
});

/* The wordmark keeps the face it was drawn against, and does not follow the
   display face. The logo is a fixed asset: if it inherited --font-display then
   every future type decision would silently redraw the brand mark, which is
   exactly the kind of drift a lockup exists to prevent. Used only in
   components/Logo.tsx. */
const wordmark = Familjen_Grotesk({
  variable: "--font-wordmark-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "District Partners | Executive & Professional Search",
  description:
    "District Partners is an independent, partner-led talent advisory firm. Executive search, professional search, interim leadership, fractional and project support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${label.variable} ${wordmark.variable} h-full antialiased`}
    >
      <head>
        {/* Must be inline and synchronous. Anything deferred runs after the
            first paint, which is the exact flash the curtain exists to
            prevent. */}
        <script dangerouslySetInnerHTML={{ __html: prePaintScript() }} />
      </head>
      <body className="min-h-full">
        <Preloader />
        <Shell className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[var(--v-primary)] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
          <Atmosphere />
          <MotionProvider>
            <ScrollProgress />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </MotionProvider>
        </Shell>
        {/* Outside <Shell>, and that is load bearing. Shell and the motion
            provider put transforms on the tree, and a transformed ancestor
            makes `position: fixed` resolve against THAT element instead of the
            viewport. Mounted inside, the launcher drifted up the page and
            collided with its own panel. */}
        <Assistant />
      </body>
    </html>
  );
}
