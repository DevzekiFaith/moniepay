// ─────────────────────────────────────────────
// MoniePay — Business Accounts API Route
// Cash Drawer, OPay POS, Moniepoint, Bank Feeds — Zero Prisma
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { DEFAULT_ACCOUNTS } from "@/lib/data/initialBusinessData";

export async function GET() {
  try {
    const user = await getSessionUser();
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("is_primary", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          accounts: data,
          totalLiquidCash: data.reduce((sum, a) => sum + Number(a.current_balance || 0), 0),
        });
      }
    }

    return NextResponse.json({
      accounts: DEFAULT_ACCOUNTS,
      totalLiquidCash: DEFAULT_ACCOUNTS.reduce((sum, a) => sum + Number(a.current_balance), 0),
      source: "local_cache",
    });
  } catch (error) {
    console.error("GET /api/accounts error:", error);
    return NextResponse.json({ accounts: DEFAULT_ACCOUNTS }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          business_id: body.business_id || "biz_mamachidi_01",
          name: body.name,
          account_type: body.account_type || "CASH",
          current_balance: Number(body.current_balance || 0),
          is_primary: !!body.is_primary,
          account_number: body.account_number || null,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, account: data }, { status: 201 });
      }
    }

    const newAcc = {
      id: "acc_" + Date.now(),
      business_id: "biz_mamachidi_01",
      name: body.name,
      account_type: body.account_type || "CASH",
      current_balance: Number(body.current_balance || 0),
      is_primary: false,
    };

    return NextResponse.json({ success: true, account: newAcc }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/accounts error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
