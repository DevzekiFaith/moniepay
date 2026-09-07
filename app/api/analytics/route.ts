// ─────────────────────────────────────────────
// Analytics API Route
// GET  /api/analytics  — Computes high-level financial metrics server-side
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import type { TimePeriod } from "@/types/analytics.types";
import { z } from "zod";

const analyticsService = new AnalyticsService();

const querySchema = z.object({
  period: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
      "last_3_months",
      "last_6_months",
      "this_year",
      "custom",
    ])
    .default("this_month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { period, startDate, endDate, accountId } = parsed.data;

    // Fetch user accounts to calculate current net worth
    const accounts = await prisma.financialAccount.findMany({
      where: {
        userId,
        isActive: true,
        ...(accountId ? { id: accountId } : {}),
      },
    });

    const totalBalance = accounts.reduce(
      (acc: number, a: { currentBalance: number }) => acc + a.currentBalance,
      0
    );

    // Fetch user transactions for analytical calculations
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(accountId ? { accountId } : {}),
      },
      include: {
        category: true,
        merchant: true,
      },
      orderBy: { transactionDate: "desc" },
    });

    const customRange =
      startDate && endDate
        ? { start: new Date(startDate), end: new Date(endDate) }
        : undefined;

    // Compute all monetary analytics entirely server-side
    const summary = analyticsService.calculateSummary(
      transactions as any,
      totalBalance,
      { userId, period: period as TimePeriod, customRange }
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
