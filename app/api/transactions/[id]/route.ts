// ─────────────────────────────────────────────
// Transaction Detail & Categorization Learning API Route
// GET   /api/transactions/[id]  — Returns complete transaction details
// PATCH /api/transactions/[id]  — Updates category and persists rule for self-learning
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { id } = await context.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        merchant: true,
        account: {
          include: { institution: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
    }

    const { categoryId, notes } = parsed.data;

    // Verify transaction belongs to user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Update transaction
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(categoryId ? { categoryId } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        category: true,
        merchant: true,
        account: true,
      },
    });

    // If user corrected category, save UserCategoryRule so intelligence learns!
    if (categoryId && (existing.merchantName || existing.normalizedMerchantName)) {
      const merchantKey = (
        existing.normalizedMerchantName ||
        existing.merchantName ||
        existing.description
      ).toLowerCase();

      await prisma.userCategoryRule.upsert({
        where: {
          userId_merchantName: {
            userId,
            merchantName: merchantKey,
          },
        },
        update: { categoryId },
        create: {
          userId,
          merchantName: merchantKey,
          categoryId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      transaction: updated,
      learningSaved: Boolean(categoryId),
    });
  } catch (error) {
    console.error("PATCH /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
