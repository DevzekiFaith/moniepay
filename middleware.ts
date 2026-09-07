import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Block dev routes in production
  const isDevRoute = pathname.startsWith("/dev") || pathname.startsWith("/api/simulate");
  if (isDevRoute && process.env.NODE_ENV !== "development") {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }

  // 2. Allow public routes — welcome page, login, auth APIs, webhooks, static
  const isPublicRoute =
    pathname === "/welcome" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname === "/favicon.ico";

  // 3. Inspect session tokens in cookies
  const allCookies = req.cookies.getAll();
  const isLoggedIn = allCookies.some(
    (c) =>
      c.name.includes("session-token") ||
      c.name.includes("auth-token") ||
      c.name === "ajo_session" ||
      c.name.startsWith("sb-")
  );

  // If visiting protected route while not logged in → go to welcome page
  if (!isLoggedIn && !isPublicRoute) {
    // If trying to access the root "/" without auth, send to welcome
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/welcome", req.url));
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting /welcome or /login → send to app
  if (isLoggedIn && (pathname === "/welcome" || pathname.startsWith("/login"))) {
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
