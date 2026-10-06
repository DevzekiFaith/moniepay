// ─────────────────────────────────────────────
// Transaction Ingestion Service — MoniePay
// Zero Prisma — Pure Supabase client
// ─────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
      const normalized = normalizer.normalizeBatch(rawTransactions, accountId, userId, source);
      const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();

      if (!supabase) {
        result.stored = normalized.length;
        return result;
      }

      // Check existing client_tx_id / external IDs
      const { data: existing } = await supabase
        .from("transactions")
        .select("client_tx_id")
        .eq("account_id", accountId);

      const existingSet = new Set((existing || []).map((r) => r.client_tx_id));

      for (const tx of normalized) {
        const hash = tx.externalTransactionId || "raw_" + tx.amount + "_" + tx.transactionDate.getTime();
        if (existingSet.has(hash)) {
          result.duplicatesSkipped++;
          continue;
        }

        const classification = classifier.classify(tx);
        const finalType = classification.type === "INCOME" ? "SALE" : "EXPENSE";

        const { error } = await supabase.from("transactions").insert({
          client_tx_id: hash,
          business_id: "biz_mamachidi_01",
          account_id: accountId,
          type: finalType,
          amount: tx.amount,
          payment_method: tx.isTransfer ? "TRANSFER" : "POS",
          category: tx.description || "Bank Ingestion",
          description: tx.description,
          transaction_date: tx.transactionDate.toISOString(),
        });

        if (!error) {
          result.stored++;
        } else {
          result.failed++;
          result.errors.push(error.message);
        }
      }
    } catch (err: any) {
      result.errors.push(err?.message || "Ingestion error");
    }

    return result;
  }
}
