import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["cs", "en"];
const defaultLocale = "cs";

// EN slug → CS slug mapping for localized routes
const enSlugMap: Record<string, string> = {
  pricing: "cenik",
  "report-types": "typy-zprav",
  contact: "kontakt",
  terms: "podminky",
  privacy: "ochrana-soukromi",
  security: "bezpecnost",
};

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  // Simple matching: check if English is preferred
  if (acceptLanguage.startsWith("en")) return "en";
  return defaultLocale;
}

const CANONICAL_ORIGIN = "https://anote.cz";

// Hostnames that must 301 to the canonical domain, path and query preserved:
// the Azure default hostname, the retired anote-appka.cz domain, and www.
const LEGACY_HOSTS = new Set([
  "yellow-forest-086a45303.7.azurestaticapps.net",
  "anote-appka.cz",
  "www.anote-appka.cz",
  "www.anote.cz",
]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
  if (LEGACY_HOSTS.has(host)) {
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      CANONICAL_ORIGIN
    );
    return NextResponse.redirect(destination, { status: 301 });
  }

  const { pathname } = request.nextUrl;

  // Skip internal paths, API routes, static files, admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/images") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Map EN slugs to CS slugs (filesystem uses CS slugs)
  if (pathname.startsWith("/en/")) {
    const rest = pathname.slice(4); // remove "/en/"
    const segments = rest.split("/");
    const firstSegment = segments[0];
    if (firstSegment && enSlugMap[firstSegment]) {
      segments[0] = enSlugMap[firstSegment];
      request.nextUrl.pathname = `/en/${segments.join("/")}`;
      return NextResponse.rewrite(request.nextUrl);
    }
  }

  if (pathnameHasLocale) return;

  // No locale prefix → rewrite to default locale (cs)
  // so that / stays as / but internally resolves to /cs
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl);
}

export const config = {
  // Runs on every path (incl. robots.txt, sitemap.xml, images) so legacy hosts
  // redirect everywhere; locale handling below still skips files and APIs.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
