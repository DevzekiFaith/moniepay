import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Attempt to fetch business details if available
    let business = null;
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase && user.id) {
        const { data: bData } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        business = bData;
      }
    } catch {
      // Offline or local dev fallback
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Business Owner",
        role: "Business Owner",
      },
      business: business || {
        id: "biz_default_01",
        name: "Mama Chidi Super Provisions",
        market_location: "Shop 14, Balogun Market, Lagos",
        category: "Provisions & Groceries",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to resolve session." },
      { status: 500 }
    );
  }
}
