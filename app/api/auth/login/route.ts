import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { saveRegisteredUser, verifyUserSignIn } from "@/lib/data/userAccountStore";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
});

const DEMO_IDENTIFIERS: Record<
  string,
  {
    id: string;
    email: string;
    name: string;
    businessName: string;
    marketLocation?: string;
    avatarUrl?: string;
  }
> = {
  "demo@monielite.app": {
    id: "user_owner_01",
    email: "demo@moniepay.app",
    name: "Mama Chidi",
    businessName: "Mama Chidi Super Provisions",
    marketLocation: undefined,
    avatarUrl: "/images/traders/mama_chidi.jpg",
  },
  "demo@moniepay.app": {
    id: "user_owner_01",
    email: "demo@moniepay.app",
    name: "Mama Chidi",
    businessName: "Mama Chidi Super Provisions",
    marketLocation: undefined,
    avatarUrl: "/images/traders/mama_chidi.jpg",
  },
  mamachidi: {
    id: "user_owner_01",
    email: "demo@moniepay.app",
    name: "Mama Chidi",
    businessName: "Mama Chidi Super Provisions",
    marketLocation: undefined,
    avatarUrl: "/images/traders/mama_chidi.jpg",
  },
  "08012345678": {
    id: "user_owner_01",
    email: "demo@moniepay.app",
    name: "Mama Chidi",
    businessName: "Mama Chidi Super Provisions",
    marketLocation: undefined,
    avatarUrl: "/images/traders/mama_chidi.jpg",
  },
  "garba@moniepay.app": {
    id: "user_owner_02",
    email: "garba@moniepay.app",
    name: "Alhaji Garba",
    businessName: "Alhaji Garba Grains & Foodstuff",
    marketLocation: "Mile 12 Market, Lagos",
    avatarUrl: "/images/traders/alhaji_garba.jpg",
  },
  "emeka@moniepay.app": {
    id: "user_owner_03",
    email: "emeka@moniepay.app",
    name: "Emeka Okonkwo",
    businessName: "Emeka Mobile & Electronics Hub",
    marketLocation: "Alaba Int. Market, Lagos",
    avatarUrl: "/images/traders/emeka_electronics.jpg",
  },
  "blessing@moniepay.app": {
    id: "user_owner_04",
    email: "blessing@moniepay.app",
    name: "Blessing Adebayo",
    businessName: "Blessing Fabrics & Lace",
    marketLocation: "Tejuosho Market, Yaba",
    avatarUrl: "/images/traders/blessing_fabrics.jpg",
  },
};

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body could not be parsed as JSON
    }
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          error: "Please enter both your email or phone number and your password to sign in.",
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedIdentifier = email.trim().toLowerCase();

    // 1. Check Supabase Auth (for email-based cloud accounts)
    try {
      const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
      if (supabase && normalizedIdentifier.includes("@")) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedIdentifier,
          password,
        });

        if (!error && data?.user) {
          const userObj = {
            id: data.user.id,
            email: data.user.email || normalizedIdentifier,
            name:
              data.user.user_metadata?.full_name ||
              normalizedIdentifier.split("@")[0] ||
              "Business Owner",
            businessName: data.user.user_metadata?.business_name || "My Business",
            marketLocation: data.user.user_metadata?.market_location || undefined,
            avatarUrl: data.user.user_metadata?.avatar_url,
          };

          // Sync with local registered store so future offline/server checks know this user signed in previously
          await saveRegisteredUser({
            id: userObj.id,
            email: userObj.email,
            name: userObj.name,
            businessName: userObj.businessName,
            marketLocation: userObj.marketLocation,
            avatarUrl: userObj.avatarUrl,
            password,
          });

          const response = NextResponse.json({
            success: true,
            user: userObj,
          });

          const sessionToken = Buffer.from(JSON.stringify(userObj)).toString("base64");

          response.cookies.set("moniepay_session", sessionToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60, // 30 days
            sameSite: "lax",
          });

          return response;
        }
      }
    } catch (sbErr) {
      console.warn("Supabase auth sign in notice:", sbErr);
    }

    // 2. Check Pre-provisioned Demo Accounts (Mama Chidi, Alhaji Garba, Emeka, Blessing)
    const demoAccount = DEMO_IDENTIFIERS[normalizedIdentifier];
    if (demoAccount) {
      if (
        password === "MoneyMatters2024!" ||
        password === "demo123" ||
        password === "mamachidi"
      ) {
        const response = NextResponse.json({
          success: true,
          user: demoAccount,
          isDemo: true,
        });

        const demoSessionToken = Buffer.from(JSON.stringify(demoAccount)).toString("base64");

        response.cookies.set("moniepay_session", demoSessionToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "lax",
        });

        return response;
      }

      return NextResponse.json(
        {
          success: false,
          code: "INVALID_PASSWORD",
          error: "Wrong password. Please check your password and try again.",
        },
        { status: 401 }
      );
    }

    // 3. Verify against Previously Signed-In / Registered Users (Prisma & User Account Store)
    const verification = await verifyUserSignIn(normalizedIdentifier, password);

    if (verification.status === "SUCCESS") {
      const verifiedUser = {
        id: verification.user.id,
        email: verification.user.email,
        phone: verification.user.phone,
        name: verification.user.name,
        businessName: verification.user.businessName,
        marketLocation: verification.user.marketLocation,
        avatarUrl: verification.user.avatarUrl,
      };

      const response = NextResponse.json({
        success: true,
        user: verifiedUser,
      });

      const sessionToken = Buffer.from(JSON.stringify(verifiedUser)).toString("base64");

      response.cookies.set("moniepay_session", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });

      return response;
    }

    if (verification.status === "INVALID_PASSWORD") {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_PASSWORD",
          error: verification.message,
        },
        { status: 401 }
      );
    }

    // User has NOT signed in or registered previously — deny access with explicit message
    return NextResponse.json(
      {
        success: false,
        code: "USER_NOT_REGISTERED",
        error: verification.message,
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong during sign-in. Please try again.",
      },
      { status: 500 }
    );
  }
}
