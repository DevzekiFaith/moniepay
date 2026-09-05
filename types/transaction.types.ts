// ─────────────────────────────────────────────
// Transaction Domain Types
// ─────────────────────────────────────────────

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | "UNKNOWN";

export type TransactionStatus = "PENDING" | "POSTED" | "REVERSED" | "FAILED";

export type TransactionSource = "MOCK" | "IMPORT" | "MANUAL" | "PROVIDER";

// Raw transaction from an external provider (before normalization)
export interface RawProviderTransaction {
  externalId: string;
  amount: number; // negative = debit, positive = credit
  currency: string;
  date: string; // ISO string
  description: string;
  merchantName?: string;
  type?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

// Normalized internal transaction (what all services work with)
export interface NormalizedTransaction {
  externalTransactionId: string;
  accountId: string;
  userId: string;
  amount: number; // always positive; type determines direction
  currency: string;
  transactionDate: Date;
  postedDate?: Date;
  description: string;
  merchantName?: string;
  normalizedMerchantName?: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  source: TransactionSource;
  isTransfer: boolean;
  isRecurring: boolean;
  metadata?: Record<string, unknown>;
}

// Fully processed transaction ready for DB insert
export interface ProcessedTransaction extends NormalizedTransaction {
  categoryId?: string;
  merchantId?: string;
  deduplicationHash: string;
  transferPairId?: string;
}

// DB transaction shape (after retrieval)
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  externalTransactionId?: string | null;
  deduplicationHash?: string | null;
  amount: number;
  currency: string;
  transactionDate: Date;
  postedDate?: Date | null;
  description: string;
  merchantName?: string | null;
  normalizedMerchantName?: string | null;
  transactionType: TransactionType;
  status: TransactionStatus;
  categoryId?: string | null;
  merchantId?: string | null;
  source: TransactionSource;
  isTransfer: boolean;
  isRecurring: boolean;
  transferPairId?: string | null;
  notes?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  category?: { id: string; name: string; slug: string; icon?: string | null; color?: string | null } | null;
  merchant?: { id: string; name: string; displayName: string } | null;
  account?: { id: string; name: string } | null;
}

// Simulation request (dev tool)
export interface SimulateTransactionRequest {
  type: TransactionType;
  amount?: number;
  merchantName?: string;
  description?: string;
  categorySlug?: string;
  accountId?: string;
}

// Filter options for transaction list
export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  types?: TransactionType[];
  categoryIds?: string[];
  merchantName?: string;
  search?: string;
  excludeTransfers?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TransactionPage {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
