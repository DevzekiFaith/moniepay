// ─────────────────────────────────────────────
// Account Sync API Route
// POST /api/accounts/[id]/sync — Refreshes balance and pulls newly cleared transactions
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinancialProvider } from "@/providers/provider-registry";
import { TransactionIngestionService } from "@/services/transaction/ingestion.service";

const ingestionService = new TransactionIngestionService();

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { id: accountId } = await context.params;

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId },
      include: { institution: true },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Set status to SYNCING
    await prisma.financialAccount.update({
      where: { id: accountId },
      data: { syncStatus: "SYNCING" },
    });

    const provider = getFinancialProvider();
    const syncResult = await provider.syncAccount(
      "conn_active",
      account.externalAccountId ?? account.id
    );

    // Ingest newly retrieved transactions
    let newTxCount = 0;
    if (syncResult.transactions.length > 0) {
      const result = await ingestionService.ingestRaw(
        syncResult.transactions,
        account.id,
        userId,
        "PROVIDER"
      );
      newTxCount = result.stored;
    }

    // Update account with latest balance and timestamp
    const updated = await prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        ...(syncResult.balance > 0 ? { currentBalance: syncResult.balance } : {}),
        syncStatus: "SYNCED",
        lastSyncedAt: syncResult.syncedAt,
      },
      include: { institution: true },
    });

    return NextResponse.json({
      success: true,
      account: updated,
      newTransactions: newTxCount,
    });
  } catch (error) {
    console.error("POST /api/accounts/[id]/sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
