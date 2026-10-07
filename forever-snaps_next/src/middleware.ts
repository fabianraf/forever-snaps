import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["es", "en"];
const defaultLocale = "es";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  try {
    return matchLocale(languages, locales, defaultLocale);
  } catch (error) {
    return defaultLocale;
  }
}

const CURRENT_SLUG = "sharon_wedding";
const LEGACY_SLUGS = ["shali-jhonatan", "shali-jonathan"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const legacySlug of LEGACY_SLUGS) {
    if (pathname.includes(`/${legacySlug}`)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(`/${legacySlug}`, `/${CURRENT_SLUG}`);
      return NextResponse.redirect(url, 308);
    }
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};