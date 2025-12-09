import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  localePrefix,
  locales,
  Locale,
} from "./src/languages/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: true, // Enable automatic locale detection
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files early
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Let next-intl middleware handle all locale routing
  // It's more efficient and handles edge cases better
  return intlMiddleware(request);
}

export const config = {
  // Only match pages, not API routes or static files
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
