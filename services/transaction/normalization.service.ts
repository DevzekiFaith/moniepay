// ─────────────────────────────────────────────
// Transaction Normalization Service
// Converts raw provider transactions to internal normalized format
// ─────────────────────────────────────────────

import type { RawProviderTransaction, NormalizedTransaction, TransactionType, TransactionStatus, TransactionSource } from "@/types/transaction.types";
import { MerchantNormalizationService } from "@/services/merchant/merchant-normalization.service";

const merchantService = new MerchantNormalizationService();

/**
 * Classifies the transaction type from a raw amount and description.
 * External amounts: negative = debit (expense), positive = credit (income).
 */
function detectType(amount: number, description: string): TransactionType {
  const desc = description.toUpperCase();

  // Transfer keywords
  const transferKeywords = [
    "TRANSFER", "TRF TO", "TRF FROM", "NIP ", "INTRA-BANK",
    "INTER-BANK", "NEFT", "NIP CREDIT", "NIP DEBIT",
  ];
  if (transferKeywords.some((k) => desc.includes(k))) return "TRANSFER";

  // Refund keywords
  const refundKeywords = ["REVERSAL", "REFUND", "CHARGEBACK", "CREDIT REVERSAL", "RETURN"];
  if (refundKeywords.some((k) => desc.includes(k))) return "REFUND";

  // Income (positive amount = money coming in)
  if (amount > 0) return "INCOME";

  // Expense (negative amount = money going out)
  if (amount < 0) return "EXPENSE";

  return "UNKNOWN";
}

function mapStatus(rawStatus?: string): TransactionStatus {
  if (!rawStatus) return "POSTED";
  const s = rawStatus.toUpperCase();
  if (s.includes("PENDING")) return "PENDING";
  if (s.includes("REVERSED") || s.includes("REVERSAL")) return "REVERSED";
  if (s.includes("FAILED") || s.includes("DECLINED")) return "FAILED";
  return "POSTED";
}

export class TransactionNormalizationService {
  /**
   * Normalize a single raw provider transaction to our internal format.
   */
  normalize(
    raw: RawProviderTransaction,
    accountId: string,
    userId: string,
    source: TransactionSource = "PROVIDER"
  ): NormalizedTransaction {
    // Amounts: raw amounts can be negative (debits) or positive (credits)
    const rawAmount = raw.amount;
    const absoluteAmount = Math.abs(rawAmount);

    const transactionType =
      (raw.type as TransactionType | undefined) ?? detectType(rawAmount, raw.description);

    const isTransfer = transactionType === "TRANSFER";

    // Normalize merchant name
    const normalizedMerchantName = merchantService.normalize(
      raw.merchantName ?? raw.description
    );

    return {
      externalTransactionId: raw.externalId,
      accountId,
      userId,
      amount: absoluteAmount,
      currency: raw.currency ?? "NGN",
      transactionDate: new Date(raw.date),
      postedDate: new Date(raw.date),
      description: raw.description.trim(),
      merchantName: raw.merchantName ?? undefined,
      normalizedMerchantName,
      transactionType,
      status: mapStatus(raw.status),
      source,
      isTransfer,
      isRecurring: false, // determined later by RecurringTransaction detector
      metadata: raw.metadata,
    };
  }

  /**
   * Normalize a batch of raw transactions.
   */
  normalizeBatch(
    rawTransactions: RawProviderTransaction[],
    accountId: string,
    userId: string,
    source: TransactionSource = "PROVIDER"
  ): NormalizedTransaction[] {
    return rawTransactions.map((raw) => this.normalize(raw, accountId, userId, source));
  }
}
