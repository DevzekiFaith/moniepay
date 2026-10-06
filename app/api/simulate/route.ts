// ─────────────────────────────────────────────
// MoniePay — Transaction Simulation Route
// Generates realistic Nigerian informal market activity
// Zero Prisma
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const clientTxId = "sim_" + Date.now();
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    const sample = {
      client_tx_id: clientTxId,
      business_id: "biz_mamachidi_01",
      type: body.type === "income" ? "SALE" : "EXPENSE",
      amount: Number(body.amount || 25000),
      payment_method: body.payment_method || "CASH",
      category: body.category || "Provisions & Groceries",
      description: body.description || "Simulated transaction",
      transaction_date: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from("transactions").insert(sample);
    }

    return NextResponse.json({ success: true, transaction: sample });
  } catch (error) {
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
