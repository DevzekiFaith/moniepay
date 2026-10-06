import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // 1. Supabase Auth
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data?.user) {
        const response = NextResponse.json({
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || "Business Owner",
          },
        });
        response.cookies.set("moniepay_session", data.user.id, {
          path: "/",
          httpOnly: false,
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "lax",
        });
        return response;
      }
    }

    // 2. Demo fallback
    if (normalizedEmail === "demo@monielite.app" && password === "MoneyMatters2024!") {
      const response = NextResponse.json({
        user: {
          id: "user_owner_01",
          email: "demo@monielite.app",
          name: "Mama Chidi",
        },
      });
      response.cookies.set("moniepay_session", "user_owner_01", {
        path: "/",
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });
      return response;
    }

    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
