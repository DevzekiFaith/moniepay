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

    // Attempt to fetch business details if available in Supabase
    let businessName = user.businessName;
    let marketLocation = user.marketLocation;

    try {
      const supabase = await createSupabaseServerClient();
      if (supabase && user.id) {
        const { data: bData } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", user.id)
          .maybeSingle();

        if (bData) {
          businessName = bData.name || businessName;
          marketLocation = bData.market_location || marketLocation;
        }
      }
    } catch {
      // Offline or local dev fallback
    }

    const finalBusinessName = businessName || `${user.name || "My"}'s Business`;
    const finalLocation = marketLocation || "Balogun Market, Lagos";

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Business Owner",
        businessName: finalBusinessName,
        marketLocation: finalLocation,
        role: "Business Owner",
      },
      business: {
        id: `biz_${user.id}`,
        name: finalBusinessName,
        market_location: finalLocation,
        category: "General Retail & Provisions",
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
