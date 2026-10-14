import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "./i18n/config";

const ADMIN_COOKIES = ["__Host-rania_admin", "rania_admin"];

function negotiateLocale(req: NextRequest): Locale {
  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(saved)) return saved;
  const header = req.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return defaultLocale;
}

function contentSecurityPolicy(nonce: string): string {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // React style props render as inline style attributes, which nonces cannot cover.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.SITE_URL?.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  // Optimistic admin gate — the authoritative check runs server-side on every admin page/action.
  if (first === "admin" && pathname !== "/admin/login") {
    const hasCookie = ADMIN_COOKIES.some((c) => req.cookies.has(c));
    if (!hasCookie) return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Public pages without a locale prefix → negotiated locale.
  if (first !== "admin" && !isLocale(first)) {
    const locale = negotiateLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  if (first === "admin") {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  if (isLocale(first) && req.cookies.get("NEXT_LOCALE")?.value !== first) {
    res.cookies.set("NEXT_LOCALE", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/|media/|api/|favicon.ico|icon|apple-icon|opengraph-image|sitemap.xml|robots.txt|llms.txt|manifest.webmanifest|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

