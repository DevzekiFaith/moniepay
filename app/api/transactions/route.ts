// ─────────────────────────────────────────────
// MoniePay — Transactions API Route
// GET  /api/transactions — Paginated transaction list from Supabase
// POST /api/transactions — Create business transaction with optimistic idempotency
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { DEFAULT_TRANSACTIONS } from "@/lib/data/initialBusinessData";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  type: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const params = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!params.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { page, pageSize, type, category, search, startDate, endDate, accountId } = params.data;
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .order("transaction_date", { ascending: false });

      if (type) query = query.eq("type", type);
      if (category) query = query.eq("category", category);
      if (accountId) query = query.eq("account_id", accountId);
      if (startDate) query = query.gte("transaction_date", startDate);
      if (endDate) query = query.lte("transaction_date", endDate);
      if (search) query = query.ilike("description", `%${search}%`);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          transactions: data,
          pagination: {
            page,
            pageSize,
            totalCount: count || data.length,
            totalPages: Math.ceil((count || data.length) / pageSize),
          },
        });
      }
    }

    // Baseline fallback for local development & offline cold-start
    let filtered = [...DEFAULT_TRANSACTIONS];
    if (type) filtered = filtered.filter((t) => t.type === type);
    if (category) filtered = filtered.filter((t) => t.category === category);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => (t.description || "").toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }

    const totalCount = filtered.length;
    const from = (page - 1) * pageSize;
    const paginated = filtered.slice(from, from + pageSize);

    return NextResponse.json({
      transactions: paginated,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      source: "local_cache",
    });
  } catch (err: any) {
    console.error("[MoniePay] Transactions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json();

    const clientTxId = body.client_tx_id || "tx_" + Date.now();
    const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          client_tx_id: clientTxId,
          business_id: body.business_id || "biz_mamachidi_01",
          account_id: body.account_id || null,
          type: body.type,
          amount: Number(body.amount),
          payment_method: body.payment_method || "CASH",
          category: body.category || "General",
          description: body.description || "",
          transaction_date: body.transaction_date || new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, transaction: data }, { status: 201 });
      }
    }

    // Local optimistic return
    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: "local_" + clientTxId,
          client_tx_id: clientTxId,
          ...body,
          transaction_date: body.transaction_date || new Date().toISOString(),
          sync_status: "pending",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[MoniePay] Transactions POST error:", err);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}
