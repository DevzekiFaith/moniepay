// ─────────────────────────────────────────────
// Transactions API Route
// GET  /api/transactions  — paginated transaction list with filters
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TransactionIngestionService } from "@/services/transaction/ingestion.service";
import type { RawProviderTransaction } from "@/types/transaction.types";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  type: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  excludeTransfers: z.coerce.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const params = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!params.success) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const {
      page, pageSize, type, categoryId, search,
      excludeTransfers, startDate, endDate, accountId,
    } = params.data;

    const where = {
      userId: session.user.id,
      ...(excludeTransfers && { isTransfer: false }),
      ...(type && { transactionType: type }),
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId }),
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { description: { contains: search } },
          { normalizedMerchantName: { contains: search } },
          { merchantName: { contains: search } },
        ],
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          merchant: { select: { id: true, name: true, displayName: true } },
          account: { select: { id: true, name: true } },
        },
        orderBy: { transactionDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createTxSchema = z.object({
  accountId: z.string(),
  amount: z.coerce.number().positive(),
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]).default("EXPENSE"),
  description: z.string().min(1),
  merchantName: z.string().optional(),
  categorySlug: z.string().optional(),
  date: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createTxSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid transaction data", details: parsed.error.format() }, { status: 400 });
    }

    const { accountId, amount, type, description, merchantName, categorySlug, date } = parsed.data;

    // Verify account exists and belongs to user
    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found or access denied" }, { status: 404 });
    }

    const ingestionService = new TransactionIngestionService();
    const rawTx: RawProviderTransaction = {
      externalId: `tx_live_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: type === "INCOME" ? amount : -amount,
      currency: account.currency || "NGN",
      type: type === "INCOME" ? "credit" : "debit",
      description,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      status: "posted",
      merchantName: merchantName || description,
    };

    const result = await ingestionService.ingestRaw(
      [rawTx],
      account.id,
      session.user.id,
      "MANUAL"
    );

    // Broadcast live notification across Supabase Realtime channel
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const isIncome = type === "INCOME";
        const isTransfer = type === "TRANSFER";
        const amtStr = formatNaira(amount);
        const title = isTransfer
          ? "Internal Transfer Reconciled"
          : isIncome
          ? "Live Inflow Verified"
          : "Live Outflow Processed";
        const message = isTransfer
          ? `${amtStr} moved across verified accounts`
          : `${isIncome ? "+" : "-"}${amtStr} • ${description}`;

        await supabase.channel("realtime:moniepay:global-alerts").send({
          type: "broadcast",
          event: "live-notification",
          payload: {
            title,
            message,
            type: isIncome ? "success" : isTransfer ? "info" : "push",
            sendPush: true,
          },
        });
      }
    } catch {
      // Non-blocking real-time broadcast
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}
