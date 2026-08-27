import type { Metadata } from "next";
import { DM_Sans, Familjen_Grotesk, Lora, Archivo } from "next/font/google";
import { Shell, Atmosphere } from "@/kit/components/Atmosphere";
import { prePaintScript } from "@/lib/preload";
import BubbleBackground from "@/components/ui/BubbleBackground";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
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

/**
 * The origin this deployment advertises itself as.
 *
 * THIS IS THE ONE THING THAT SILENTLY BREAKS EVERY SHARE CARD. A share preview
 * is fetched by somebody else's server, which has no idea what site the link
 * came from, so `og:image` has to be an absolute URL at an origin that is
 * actually serving this build. Hardcoding the live domain means every preview
 * and staging deployment publishes a card pointing at a domain that is not
 * running this code yet, and the platform fetches it, gets whatever is there,
 * and shows nothing. No error anywhere: the tags are present and correct, they
 * just point somewhere else.
 *
 * So the origin is derived rather than assumed. An explicit
 * NEXT_PUBLIC_SITE_URL always wins. Failing that, on Vercel a production
 * deployment names its production domain and any other deployment names
 * itself, which is what makes a preview link preview. The live domain is the
 * last resort, for a build with no deployment environment at all.
 *
 * These read without the NEXT_PUBLIC_ prefix on purpose: `metadata` is
 * evaluated on the server, so the server's own environment is available, and
 * shipping the deployment URL to the browser would be pointless.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://dpadvisory.com";
}

const SITE_URL = resolveSiteUrl();
const TITLE = "District Partners | Executive & Professional Search";
const DESCRIPTION =
  "District Partners is an independent, partner-led talent advisory firm. Executive search, professional search, interim leadership, fractional and project support.";

export const metadata: Metadata = {
  /* WITHOUT metadataBase, Next resolves the generated og:image to a RELATIVE
     url and every platform that fetches it fails. See resolveSiteUrl above for
     where the absolute origin comes from and why it is derived. */
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "District Partners",
  openGraph: {
    type: "website",
    siteName: "District Partners",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    /* The large card, because the generated image is 1200x630 and the small
       card would centre-crop it to a square and cut the wordmark off. */
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  /* The colour a mobile browser paints its own chrome with, so the address bar
     matches the site instead of flashing white above a dark page. */
  themeColor: "#080b16",
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
          {/* The bubbles ARE the ambient wash now, so the kit's aurora is off:
              see ui/BubbleBackground. Mounted here rather than per page,
              because it is the ground the whole site sits on. */}
          <Atmosphere aurora={false} />
          <BubbleBackground />
          <SmoothScroll />
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
