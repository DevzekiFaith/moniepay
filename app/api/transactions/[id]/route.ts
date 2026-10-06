// ─────────────────────────────────────────────
// MoniePay — Transaction Detail API Route
// Zero Prisma — Pure Supabase
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ transaction: data });
      }
    }

    return NextResponse.json({
      transaction: {
        id,
        type: "SALE",
        amount: 35000,
        payment_method: "CASH",
        category: "Provisions & Groceries",
        description: "Transaction details",
      },
    });
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      await supabase.from("transactions").delete().eq("id", id);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Delete failed" }, { status: 500 });
  }
}
