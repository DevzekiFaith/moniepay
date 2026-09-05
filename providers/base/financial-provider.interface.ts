// ─────────────────────────────────────────────
// Financial Provider Abstraction Interface
// Decouples Monie Lite from specific open banking vendors (Mono, Okra, Plaid, Stitch)
// ─────────────────────────────────────────────

import type { RawProviderTransaction } from "@/types/transaction.types";

export interface SupportedInstitution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  logoUrl?: string;
  primaryColor?: string;
  supportedAccountTypes: ("CHECKING" | "SAVINGS" | "WALLET")[];
}

export interface ProviderAccountResult {
  externalAccountId: string;
  name: string;
  accountType: "CHECKING" | "SAVINGS" | "WALLET";
  currency: string;
  currentBalance: number;
  availableBalance?: number;
  mask?: string; // e.g. "•••• 4821"
}

export interface ConnectAccountInput {
  institutionId: string;
  authCode?: string; // One-time token from open-banking widget (e.g. Mono Connect code)
  accountType?: string;
  accountName?: string;
  accountNumber?: string;
  initialBalance?: number;
  importInitialHistory?: boolean;
}

export interface FinancialProvider {
  readonly id: string;
  readonly name: string;
  readonly isSandbox: boolean;

  /**
   * Returns list of supported institutions for user selection
   */
  getInstitutions(): Promise<SupportedInstitution[]>;

  /**
   * Exchanges an authorization token/code to establish a persistent connection
   * and retrieve the account metadata.
   */
  connectAccount(
    userId: string,
    input: ConnectAccountInput
  ): Promise<{
    connectionId: string;
    account: ProviderAccountResult;
  }>;

  /**
   * Fetches historical or recent raw transactions from the financial provider
   */
  fetchTransactions(
    connectionId: string,
    externalAccountId: string,
    options?: { from?: Date; to?: Date }
  ): Promise<RawProviderTransaction[]>;

  /**
   * Syncs latest balance and any newly cleared transactions
   */
  syncAccount(
    connectionId: string,
    externalAccountId: string
  ): Promise<{
    balance: number;
    transactions: RawProviderTransaction[];
    syncedAt: Date;
  }>;

  /**
   * Disconnects and revokes access to the financial account
   */
  disconnect(connectionId: string): Promise<boolean>;
}
