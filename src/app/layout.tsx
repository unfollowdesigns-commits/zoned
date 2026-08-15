import type { Metadata } from "next";
import { Inter, Familjen_Grotesk } from "next/font/google";
import { Shell, Atmosphere } from "@/kit/components/Atmosphere";
import MotionProvider from "@/components/MotionProvider";
import { ScrollProgress } from "@/kit/components/Scroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const display = Familjen_Grotesk({
  variable: "--font-display-face",
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
      className={`${inter.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full">
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
      </body>
    </html>
  );
}
