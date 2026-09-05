// ─────────────────────────────────────────────
// Financial Accounts API Route
// GET  /api/accounts  — Lists connected bank accounts
// POST /api/accounts  — Connects a new bank account through Open Banking provider
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFinancialProvider } from "@/providers/provider-registry";
import { TransactionIngestionService } from "@/services/transaction/ingestion.service";
import { z } from "zod";

const ingestionService = new TransactionIngestionService();

const connectAccountSchema = z.object({
  institutionId: z.string(),
  accountType: z.enum(["SAVINGS", "CHECKING", "WALLET"]).default("SAVINGS"),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  initialBalance: z.coerce.number().min(0).default(0),
  authCode: z.string().optional(),
  importInitialHistory: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const provider = getFinancialProvider();

    const [accounts, institutions] = await Promise.all([
      prisma.financialAccount.findMany({
        where: { userId, isActive: true },
        include: {
          institution: true,
          _count: { select: { transactions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      provider.getInstitutions(),
    ]);

    return NextResponse.json({
      accounts,
      supportedInstitutions: institutions,
      providerName: provider.name,
      isLive: true,
    });
  } catch (error) {
    console.error("GET /api/accounts error:", error);
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
    const body = await request.json().catch(() => ({}));
    const parsed = connectAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const {
      institutionId,
      accountType,
      accountName,
      accountNumber,
      initialBalance,
      authCode,
      importInitialHistory,
    } = parsed.data;
    const provider = getFinancialProvider();

    // 1. Authorize with the open banking provider
    const { connectionId, account: providerAcc } = await provider.connectAccount(
      userId,
      {
        institutionId,
        accountType,
        accountName,
        accountNumber,
        initialBalance,
        authCode,
        importInitialHistory,
      }
    );

    // 2. Ensure institution record exists
    const institutions = await provider.getInstitutions();
    const instMeta = institutions.find((i) => i.id === institutionId);

    const institution = await prisma.financialInstitution.upsert({
      where: { id: institutionId },
      update: {
        name: instMeta?.name ?? "Financial Institution",
        shortName: instMeta?.shortName,
      },
      create: {
        id: institutionId,
        name: instMeta?.name ?? "Financial Institution",
        shortName: instMeta?.shortName,
        country: instMeta?.country ?? "NG",
      },
    });

    // 3. Create persistent account record
    const account = await prisma.financialAccount.create({
      data: {
        userId,
        institutionId: institution.id,
        externalAccountId: providerAcc.externalAccountId,
        name: providerAcc.name,
        accountType: providerAcc.accountType,
        currency: providerAcc.currency,
        currentBalance: providerAcc.currentBalance,
        availableBalance: providerAcc.availableBalance,
        mask: providerAcc.mask,
        syncStatus: "SYNCING",
      },
    });

    // 4. Save provider connection record
    await prisma.financialProviderConnection.create({
      data: {
        userId,
        institutionId: institution.id,
        provider: provider.id.toUpperCase(),
        status: "ACTIVE",
        metadata: JSON.stringify({ connectionId }),
      },
    });

    // 5. Fetch initial transaction history if enabled
    let ingestedCount = 0;
    if (importInitialHistory !== false) {
      const rawTransactions = await provider.fetchTransactions(
        connectionId,
        providerAcc.externalAccountId
      );

      // 6. Ingest transactions through the live server-side engine
      if (rawTransactions && rawTransactions.length > 0) {
        const ingestionResult = await ingestionService.ingestRaw(
          rawTransactions,
          account.id,
          userId,
          "PROVIDER"
        );
        ingestedCount = ingestionResult.stored;
      }
    }

    // 7. Update account sync status and enforce live verified balance
    const updatedAccount = await prisma.financialAccount.update({
      where: { id: account.id },
      data: {
        currentBalance: providerAcc.currentBalance,
        availableBalance: providerAcc.availableBalance ?? providerAcc.currentBalance,
        syncStatus: "SYNCED",
        lastSyncedAt: new Date(),
      },
      include: { institution: true },
    });

    return NextResponse.json({
      success: true,
      account: updatedAccount,
      ingestedCount,
    });
  } catch (error) {
    console.error("POST /api/accounts error:", error);
    return NextResponse.json({ error: "Failed to connect account" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    if (!accountId) {
      return NextResponse.json({ error: "accountId required" }, { status: 400 });
    }

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await prisma.financialAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/accounts error:", error);
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
  }
}
