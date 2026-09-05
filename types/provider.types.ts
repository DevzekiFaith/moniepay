// ─────────────────────────────────────────────
// Provider Abstraction Types
// ─────────────────────────────────────────────

import type { RawProviderTransaction } from "./transaction.types";

export type ProviderName = "MOCK" | "MONO" | "OKRA" | "PLAID" | "STITCH" | "MANUAL";

export interface ProviderAccount {
  externalId: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  institutionName: string;
  institutionCode?: string;
}

export interface ProviderFetchOptions {
  accountId: string;
  from?: Date;
  to?: Date;
  limit?: number;
  cursor?: string;
}

export interface ProviderFetchResult {
  transactions: RawProviderTransaction[];
  nextCursor?: string;
  hasMore: boolean;
  fetchedAt: Date;
}

export interface FinancialProviderConfig {
  name: ProviderName;
  displayName: string;
  isLive: boolean;
  isSandbox: boolean;
  supportedCountries: string[];
}

// Base interface all provider adapters implement
export interface IFinancialProvider {
  readonly config: FinancialProviderConfig;

  getAccounts(connectionId: string): Promise<ProviderAccount[]>;

  fetchTransactions(
    connectionId: string,
    options: ProviderFetchOptions
  ): Promise<ProviderFetchResult>;

  testConnection(connectionId: string): Promise<boolean>;
}

// Adapter interface: maps provider-specific raw data to internal format
export interface IProviderAdapter {
  readonly providerName: ProviderName;
  normalizeTransaction(raw: Record<string, unknown>): RawProviderTransaction;
  normalizeAccount(raw: Record<string, unknown>): ProviderAccount;
}
