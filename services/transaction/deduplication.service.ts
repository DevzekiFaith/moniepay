// ─────────────────────────────────────────────
// Deduplication Service
// Prevents duplicate transactions from being stored
// ─────────────────────────────────────────────

import type { NormalizedTransaction } from "@/types/transaction.types";
import { createHash } from "crypto";

export interface DeduplicationResult {
  isDuplicate: boolean;
  existingHash?: string;
  hash: string;
}

export class DeduplicationService {
  /**
   * Generate a deterministic hash for a transaction.
   *
   * Strategy: We hash a combination of:
   * - accountId (scoped to this user's account)
   * - externalTransactionId (if available from provider)
   * - normalized amount (to 2 decimal places)
   * - transaction date (date portion only, not time — providers can differ)
   * - normalized description (trimmed, lowercased)
   *
   * This handles cases where:
   * - Same transaction returned multiple times by provider
   * - Pending → Posted transition (same externalId, updated status)
   */
  generateHash(tx: NormalizedTransaction): string {
    const dateStr = tx.transactionDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const amount = tx.amount.toFixed(2);
    const description = tx.description.trim().toLowerCase().substring(0, 50);

    // If we have an external ID from the provider, use it as the primary signal
    if (tx.externalTransactionId && tx.externalTransactionId.length > 4) {
      const payload = `${tx.accountId}:${tx.externalTransactionId}`;
      return this.hash(payload);
    }

    // Otherwise, derive from content fingerprint
    const payload = `${tx.accountId}:${amount}:${dateStr}:${description}`;
    return this.hash(payload);
  }

  /**
   * Check a normalized transaction against a set of existing hashes.
   * Returns whether this is a duplicate and the generated hash.
   */
  checkDuplicate(
    tx: NormalizedTransaction,
    existingHashes: Set<string>
  ): DeduplicationResult {
    const hash = this.generateHash(tx);
    const isDuplicate = existingHashes.has(hash);
    return {
      isDuplicate,
      existingHash: isDuplicate ? hash : undefined,
      hash,
    };
  }

  /**
   * Filter a batch of transactions, returning only non-duplicate ones
   * along with their hashes.
   */
  filterDuplicates(
    transactions: NormalizedTransaction[],
    existingHashes: Set<string>
  ): Array<{ transaction: NormalizedTransaction; hash: string }> {
    const seen = new Set(existingHashes);
    const result: Array<{ transaction: NormalizedTransaction; hash: string }> = [];

    for (const tx of transactions) {
      const hash = this.generateHash(tx);
      if (!seen.has(hash)) {
        seen.add(hash); // prevent within-batch duplicates too
        result.push({ transaction: tx, hash });
      }
    }

    return result;
  }

  private hash(payload: string): string {
    return createHash("sha256").update(payload).digest("hex");
  }
}
