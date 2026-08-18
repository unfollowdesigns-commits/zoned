import type { Metadata } from "next";
import { DM_Sans, Familjen_Grotesk, Lora, Archivo } from "next/font/google";
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

/* Serif accent, for editorial passages and pull quotes only.
 *
 * Deliberately narrow in scope. A serif dropped into a grotesque system reads
 * as an accident unless it is reserved for a role the sans is not doing, so it
 * carries editorial voice and nothing else: never a label, never UI, never a
 * section title. */
const serif = Lora({
  variable: "--font-serif-face",
  subsets: ["latin"],
  display: "swap",
});

/* Display: everything above 20px.
 *
 * The brand face is Neue Haas Grotesk Display, licensed commercial type from
 * Monotype. It cannot be fetched, bundled from a CDN, or served from a free
 * mirror, and a "free download" of it is a pirated copy that would put the
 * client in breach on their own site. So it is declared in globals.css against
 * files in public/fonts/ and takes over the moment those files exist.
 *
 * Archivo is the LAST fallback, not the first. Neue Haas Grotesk is Helvetica
 * redrawn, so the stack in --font-display reaches for Helvetica Neue and Arial
 * ahead of it: those are near matches, already on most machines, and cost no
 * download. Archivo covers the platforms that have neither, and is kept for
 * that alone. See public/fonts/README.md. */
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
      className={`${body.variable} ${display.variable} ${serif.variable} ${wordmark.variable} h-full antialiased`}
      // The pre-paint script below stamps `data-loaded` on this element before
      // React ever runs, which is the entire point of it: the curtain has to be
      // decided before the first paint. React then hydrates, finds an attribute
      // on the client that was not in the server HTML, and reports a mismatch on
      // every route. The warning is correct and the behaviour is intended, which
      // is the case this prop exists for. It matters beyond tidiness: an error
      // thrown unconditionally on every page is one nobody reads, so a real
      // mismatch would arrive into a log already full of this one. The prop is
      // shallow, covering this element's own attributes and nothing below it.
      suppressHydrationWarning
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
