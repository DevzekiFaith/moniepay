import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name, email, and password (8+ characters)." },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (data?.user) {
        const response = NextResponse.json({
          user: {
            id: data.user.id,
            email: data.user.email,
            name,
          },
        }, { status: 201 });

        response.cookies.set("moniepay_session", data.user.id, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "lax",
        });

        return response;
      }
    }

    // Fallback local response
    const mockId = "user_" + Date.now();
    const response = NextResponse.json(
      {
        user: {
          id: mockId,
          email: normalizedEmail,
          name,
        },
      },
      { status: 201 }
    );

    response.cookies.set("moniepay_session", mockId, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
