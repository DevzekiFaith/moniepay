// ─────────────────────────────────────────────
// Transaction Simulation API Route
// Simulates live bank transactions through the complete server-side pipeline:
// Ingestion -> Normalization -> Dedup -> Classification -> Categorization -> Account Balance Update
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionIngestionService } from "@/services/transaction/ingestion.service";
import type { RawProviderTransaction } from "@/types/transaction.types";
import { z } from "zod";

const ingestionService = new TransactionIngestionService();

const simulateSchema = z.object({
  type: z.enum(["income", "expense", "transfer", "custom"]).default("expense"),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  merchantName: z.string().optional(),
  categorySlug: z.string().optional(),
  accountId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Simulator is strictly isolated to development/testing environments
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Simulator is disabled in production." },
      { status: 403 }
    );
  }

  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json().catch(() => ({}));
    const parsed = simulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid simulation data" }, { status: 400 });
    }

    const { type, amount, description, merchantName, accountId } = parsed.data;

    // Get user's primary or first account
    let targetAccount = accountId
      ? await prisma.financialAccount.findUnique({ where: { id: accountId } })
      : await prisma.financialAccount.findFirst({ where: { userId, isPrimary: true } });

    if (!targetAccount) {
      targetAccount = await prisma.financialAccount.findFirst({ where: { userId } });
    }

    if (!targetAccount) {
      return NextResponse.json(
        { error: "No financial account found for user. Run database seed first." },
        { status: 404 }
      );
    }

    const randomId = `sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let rawTx: RawProviderTransaction;

    switch (type) {
      case "income": {
        const incomeAmount = amount ?? 450000;
        rawTx = {
          externalId: randomId,
          amount: incomeAmount,
          currency: "NGN",
          date: new Date().toISOString(),
          description: description ?? "SALARY PAYROLL / TECHCORP LTD / MARCH",
          merchantName: merchantName ?? "TechCorp Ltd",
          type: "CREDIT",
          status: "POSTED",
        };
        break;
      }
      case "transfer": {
        const transferAmount = amount ?? 35000;
        rawTx = {
          externalId: randomId,
          amount: transferAmount,
          currency: "NGN",
          date: new Date().toISOString(),
          description: description ?? "TRF TO GTB SAVINGS / TRF-00294829",
          type: "DEBIT",
          status: "POSTED",
        };
        break;
      }
      case "expense":
      default: {
        const expenseAmount = amount ?? (Math.floor(Math.random() * 18000) + 2500);
        const sampleMerchants = [
          { name: "Uber Technologies", desc: "UBER *TRIP BV LAGOS NG" },
          { name: "Netflix Nigeria", desc: "NETFLIX.COM PAYMENT PMT-8472" },
          { name: "Shoprite Ikeja", desc: "SHOPRITE IKEJA MALL POS-092" },
          { name: "Ikeja Electric", desc: "IKEDC PREPAID POWER RECHARGE" },
          { name: "Cold Stone Creamery", desc: "COLD STONE CREAMERY VI LAGOS" },
        ];
        const picked = sampleMerchants[Math.floor(Math.random() * sampleMerchants.length)];

        rawTx = {
          externalId: randomId,
          amount: expenseAmount,
          currency: "NGN",
          date: new Date().toISOString(),
          description: description ?? picked.desc,
          merchantName: merchantName ?? picked.name,
          type: "DEBIT",
          status: "POSTED",
        };
        break;
      }
    }

    // Execute through the full server-side pipeline
    const ingestionResult = await ingestionService.ingestRaw(
      [rawTx],
      targetAccount.id,
      userId,
      "MOCK"
    );

    // Fetch the newly stored transaction
    const newlyCreated = await prisma.transaction.findFirst({
      where: { userId, externalTransactionId: randomId },
      include: {
        category: true,
        merchant: true,
        account: true,
      },
    });

    return NextResponse.json({
      success: true,
      result: ingestionResult,
      transaction: newlyCreated,
      simulatedType: type,
    });
  } catch (error) {
    console.error("POST /api/simulate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
