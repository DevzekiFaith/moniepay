// ─────────────────────────────────────────────
// Insights API Route
// GET  /api/insights  — Returns generated financial insights
// POST /api/insights/generate — Evaluates and saves new insights
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InsightService } from "@/services/insights/insight.service";

const insightService = new InsightService();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = request.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";

    const insights = await prisma.insight.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch transactions and account balances for insight generation
    const [accounts, transactions] = await Promise.all([
      prisma.financialAccount.findMany({ where: { userId, isActive: true } }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true, merchant: true },
        orderBy: { transactionDate: "desc" },
        take: 100,
      }),
    ]);

    const totalBalance = accounts.reduce(
      (acc: number, a: { currentBalance: number }) => acc + a.currentBalance,
      0
    );
    const candidates = insightService.generate(transactions as any, totalBalance, userId);

    // Persist new insights
    const saved = [];
    for (const c of candidates) {
      const created = await prisma.insight.create({
        data: {
          userId,
          type: c.type,
          title: c.title,
          body: c.body,
          importance: c.importance,
          data: c.data ? JSON.stringify(c.data) : null,
        },
      });
      saved.push(created);
    }

    return NextResponse.json({
      success: true,
      generatedCount: saved.length,
      insights: saved,
    });
  } catch (error) {
    console.error("POST /api/insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
