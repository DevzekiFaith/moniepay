// ─────────────────────────────────────────────
// Transaction Ingestion Service
// Orchestrates the full transaction processing pipeline:
//   raw → normalize → dedup → classify → categorize → store → insight
// ─────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import type { RawProviderTransaction, TransactionSource } from "@/types/transaction.types";
import { TransactionNormalizationService } from "./normalization.service";
import { DeduplicationService } from "./deduplication.service";
import { ClassificationService } from "./classification.service";
import { CategorizationService } from "./categorization.service";

const normalizer = new TransactionNormalizationService();
const deduplicator = new DeduplicationService();
const classifier = new ClassificationService();
const categorizer = new CategorizationService();

export interface IngestionResult {
  processed: number;
  stored: number;
  duplicatesSkipped: number;
  failed: number;
  errors: string[];
}

export class TransactionIngestionService {
  async ingestRaw(
    rawTransactions: RawProviderTransaction[],
    accountId: string,
    userId: string,
    source: TransactionSource = "PROVIDER"
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      processed: rawTransactions.length,
      stored: 0,
      duplicatesSkipped: 0,
      failed: 0,
      errors: [],
    };

    if (rawTransactions.length === 0) return result;

    try {
      // ── STEP 1: Normalize ───────────────────────────
      const normalized = normalizer.normalizeBatch(rawTransactions, accountId, userId, source);

      // ── STEP 2: Deduplication ───────────────────────
      // Fetch existing hashes for this account
      const existingHashRows = await prisma.transaction.findMany({
        where: { accountId, userId },
        select: { deduplicationHash: true },
      });
      const existingHashes = new Set(
        existingHashRows
          .map((r) => r.deduplicationHash)
          .filter(Boolean) as string[]
      );

      const unique = deduplicator.filterDuplicates(normalized, existingHashes);
      result.duplicatesSkipped = normalized.length - unique.length;

      // Load user learned category rules
      const customRules = await prisma.userCategoryRule.findMany({
        where: { userId },
        include: { category: true },
      });
      const userRuleMap = new Map<string, string>();
      for (const r of customRules) {
        if (r.category) {
          userRuleMap.set(r.merchantName.toLowerCase(), r.category.slug);
        }
      }

      // ── STEP 3: Classify + Categorize + Store ───────
      for (const { transaction: tx, hash } of unique) {
        try {
          // Classify
          const classification = classifier.classify(tx);
          const finalType = classification.type;

          // Categorize (with user learned rules)
          const categorization = categorizer.categorize(
            {
              ...tx,
              transactionType: finalType,
            },
            userRuleMap
          );

          // Look up or create category
          const category = await prisma.category.findUnique({
            where: { slug: categorization.categorySlug },
          });

          // Store
          await prisma.transaction.create({
            data: {
              userId,
              accountId,
              externalTransactionId: tx.externalTransactionId,
              deduplicationHash: hash,
              amount: tx.amount,
              currency: tx.currency,
              transactionDate: tx.transactionDate,
              postedDate: tx.postedDate ?? tx.transactionDate,
              description: tx.description,
              merchantName: tx.merchantName ?? null,
              normalizedMerchantName: tx.normalizedMerchantName ?? null,
              transactionType: finalType,
              status: tx.status,
              categoryId: category?.id ?? null,
              source,
              isTransfer: finalType === "TRANSFER",
              isRecurring: false,
              metadata: tx.metadata ? JSON.stringify(tx.metadata) : null,
            },
          });

          // ── STEP 4: Update account balance ───────────
          await this.updateAccountBalance(accountId, tx.amount, finalType);

          result.stored++;
        } catch (err) {
          result.failed++;
          result.errors.push(
            err instanceof Error ? err.message : "Unknown error"
          );
        }
      }
    } catch (err) {
      result.errors.push(err instanceof Error ? err.message : "Pipeline error");
    }

    return result;
  }

  private async updateAccountBalance(
    accountId: string,
    amount: number,
    type: string
  ): Promise<void> {
    // INCOME or REFUND: balance increases
    // EXPENSE: balance decreases
    // TRANSFER: net zero (both legs handled separately)
    if (type === "INCOME" || type === "REFUND") {
      await prisma.financialAccount.update({
        where: { id: accountId },
        data: { currentBalance: { increment: amount } },
      });
    } else if (type === "EXPENSE") {
      await prisma.financialAccount.update({
        where: { id: accountId },
        data: { currentBalance: { decrement: amount } },
      });
    }
    // TRANSFER: handled at the account level by the caller
  }
}
