import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Sign out from Supabase server session if active
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase server signout notice:", err);
    }

    // 2. Prepare JSON response
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });

    // 3. RFC 6265 compliant cookie clearing
    const cookiesToClear = [
      "moniepay_session",
      "ajo_session",
      "ajopay_session",
      "authjs.session-token",
      "__Secure-authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "authjs.csrf-token",
      "next-auth.csrf-token",
    ];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    });

    // Also clear any supabase auth cookies matching sb-*
    const allCookies = request.cookies.getAll();
    allCookies.forEach((c) => {
      if (c.name.startsWith("sb-")) {
        response.cookies.set(c.name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          sameSite: "lax",
        });
      }
    });

    return response;
  } catch (error: any) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out cleanly." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET redirect signout as fallback
  const postRes = await POST(request);
  const loginUrl = new URL("/login", request.url);
  const redirectRes = NextResponse.redirect(loginUrl);
  
  // Copy cleared cookies to redirect response
  postRes.cookies.getAll().forEach((c) => {
    redirectRes.cookies.set(c);
  });
  
  return redirectRes;
}
