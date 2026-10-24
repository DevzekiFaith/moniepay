import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const realVendors: Array<{
      id: string;
      shopName: string;
      name: string;
      marketLocation?: string;
      category?: string;
      phone?: string;
      createdAt?: string;
      verified: boolean;
    }> = [];

    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, market_location, category, created_at, profiles(id, full_name, phone)")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          for (const b of data) {
            const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
            const traderName = profile?.full_name || "Registered Merchant";
            const shopName = b.name || `${traderName}'s Shop`;
            const rawLoc = b.market_location;
            const cleanLoc = rawLoc && !rawLoc.toLowerCase().includes("balogun") && rawLoc !== "Commercial Trading Shop, Nigeria" ? rawLoc : undefined;

            realVendors.push({
              id: b.id,
              shopName,
              name: traderName,
              marketLocation: cleanLoc,
              category: b.category || "General Retail & Provisions",
              phone: profile?.phone || "",
              createdAt: b.created_at,
              verified: true,
            });
          }
        }
      } catch (dbErr) {
        console.warn("Could not query Supabase businesses:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      vendors: realVendors,
    });
  } catch (error: any) {
    console.error("Vendors API error:", error);
    return NextResponse.json({ success: true, vendors: [] });
  }
}
