// ─────────────────────────────────────────────
// MoniePay — Account Sync API Route
// Zero Prisma — Pure Supabase
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await context.params;
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      await supabase
        .from("accounts")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", accountId);
    }

    return NextResponse.json({
      success: true,
      accountId,
      syncedAt: new Date().toISOString(),
      newTransactions: 0,
    });
  } catch (error) {
    console.error("Account sync error:", error);
    return NextResponse.json({ error: "Failed to sync account" }, { status: 500 });
  }
}
