import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Block dev-only routes in production
  const isDevRoute = pathname.startsWith("/dev") || pathname.startsWith("/api/simulate");
  if (isDevRoute && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Allow public routes — login, auth APIs, service worker, manifest, static assets
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico";

  // 3. Inspect session tokens across cookies (Supabase, MoniePay session, NextAuth)
  const allCookies = req.cookies.getAll();
  const isLoggedIn = allCookies.some(
    (c) =>
      c.name === "moniepay_session" ||
      c.name === "ajo_session" ||
      c.name.includes("session-token") ||
      c.name.includes("auth-token") ||
      c.name.startsWith("sb-")
  );

  // If visiting protected route while not authenticated → redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    // In local development or mobile PWA offline, allow dashboard view if header or cookie bypass
    // But enforce clean redirect if user explicitly navigated to a locked subpath
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login or /welcome → redirect directly to dashboard
  if (isLoggedIn && (pathname.startsWith("/login") || pathname === "/welcome")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
