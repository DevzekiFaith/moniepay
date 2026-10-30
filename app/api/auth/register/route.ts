import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { findRegisteredUser, saveRegisteredUser } from "@/lib/data/userAccountStore";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().min(3).max(120),
  password: z.string().min(4).max(128),
  businessName: z.string().min(2).max(120).optional(),
  marketLocation: z.string().min(2).max(120).optional(),
  avatarUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Could not parse JSON body
    }
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid name, email or phone number, and password (at least 4 characters)." },
        { status: 400 }
      );
    }

    const { name, email, password, businessName, marketLocation, avatarUrl } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const isPhone = /^(\+?234|0)[789][01]\d{8}$/.test(normalizedEmail);
    const finalBusinessName = businessName?.trim() || `${name}'s Business`;
    const finalLocation = marketLocation?.trim() || undefined;

    // Check if user is already registered locally/in Prisma
    const existingLocal = await findRegisteredUser(normalizedEmail);
    if (existingLocal) {
      return NextResponse.json(
        {
          error: "You already have an account with this email or phone number. Please tap 'Enter Shop' to sign in.",
          code: "USER_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    // 1. Register with Supabase Auth (when email is an email address and Supabase is configured)
    try {
      const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
      if (supabase && normalizedEmail.includes("@")) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name,
              business_name: finalBusinessName,
              market_location: finalLocation,
              avatar_url: avatarUrl,
            },
          },
        });

        if (error) {
          const errMsg = error.message || "";
          const isNetworkError =
            errMsg.toLowerCase().includes("fetch failed") ||
            errMsg.toLowerCase().includes("failed to fetch") ||
            errMsg.toLowerCase().includes("network") ||
            errMsg.toLowerCase().includes("enotfound") ||
            errMsg.toLowerCase().includes("timeout") ||
            (error as any).status === 503 ||
            (error as any).status === 502;

          if (!isNetworkError) {
            return NextResponse.json({ error: errMsg }, { status: 400 });
          }
          console.warn("Supabase unreachable, falling back to local shop provisioning:", errMsg);
        } else if (data?.user) {
          const userId = data.user.id;

          // Attempt to provision profiles & business table rows
          try {
            await supabase.from("profiles").upsert({
              id: userId,
              full_name: name,
              role: "OWNER",
              phone: isPhone ? normalizedEmail : "",
            });

            await supabase.from("businesses").insert({
              id: `biz_${userId.substring(0, 8)}`,
              owner_id: userId,
              name: finalBusinessName,
              market_location: finalLocation,
              category: "General Retail & Provisions",
            });
          } catch (dbErr) {
            console.warn("Profile/business row bootstrap notice:", dbErr);
          }

          await saveRegisteredUser({
            id: userId,
            email: normalizedEmail,
            phone: isPhone ? normalizedEmail : undefined,
            name,
            businessName: finalBusinessName,
            marketLocation: finalLocation,
            avatarUrl,
            password,
          });

          const userPayload = {
            id: userId,
            email: normalizedEmail,
            phone: isPhone ? normalizedEmail : undefined,
            name,
            businessName: finalBusinessName,
            marketLocation: finalLocation,
            avatarUrl,
          };

          const response = NextResponse.json(
            {
              success: true,
              user: userPayload,
            },
            { status: 201 }
          );

          const sessionToken = Buffer.from(JSON.stringify(userPayload)).toString("base64");

          response.cookies.set("moniepay_session", sessionToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60,
            sameSite: "lax",
          });

          return response;
        }
      }
    } catch (sbErr) {
      console.warn("Supabase registration attempt:", sbErr);
    }

    // 2. Local / Prisma Persistent Account Registration
    const generatedId = "usr_" + Math.random().toString(36).substring(2, 10);
    const savedAccount = await saveRegisteredUser({
      id: generatedId,
      email: normalizedEmail,
      phone: isPhone ? normalizedEmail : undefined,
      name,
      businessName: finalBusinessName,
      marketLocation: finalLocation,
      avatarUrl,
      password,
    });

    const localUser = {
      id: savedAccount.id,
      email: savedAccount.email,
      phone: savedAccount.phone,
      name: savedAccount.name,
      businessName: savedAccount.businessName,
      marketLocation: savedAccount.marketLocation,
      avatarUrl: savedAccount.avatarUrl,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: localUser,
      },
      { status: 201 }
    );

    const localSessionToken = Buffer.from(JSON.stringify(localUser)).toString("base64");

    response.cookies.set("moniepay_session", localSessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please check your network and try again." },
      { status: 500 }
    );
  }
}
