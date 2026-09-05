// ─────────────────────────────────────────────
// Sandbox Financial Provider Adapter
// For development and testing environments without active Open Banking credentials
// Implements the identical interface as live production adapters (Mono, Okra, Plaid)
// ─────────────────────────────────────────────

import type {
  FinancialProvider,
  SupportedInstitution,
  ConnectAccountInput,
  ProviderAccountResult,
} from "../base/financial-provider.interface";
import type { RawProviderTransaction } from "@/types/transaction.types";
import { subDays, formatISO } from "date-fns";

export const SUPPORTED_INSTITUTIONS: SupportedInstitution[] = [
  {
    id: "inst_gtb",
    name: "Guaranty Trust Bank",
    shortName: "GTBank",
    code: "058",
    country: "NG",
    primaryColor: "#DD4F05",
    supportedAccountTypes: ["SAVINGS", "CHECKING"],
  },
  {
    id: "inst_zenith",
    name: "Zenith Bank",
    shortName: "Zenith",
    code: "057",
    country: "NG",
    primaryColor: "#E2001A",
    supportedAccountTypes: ["SAVINGS", "CHECKING"],
  },
  {
    id: "inst_kuda",
    name: "Kuda Microfinance Bank",
    shortName: "Kuda",
    code: "50211",
    country: "NG",
    primaryColor: "#40196D",
    supportedAccountTypes: ["SAVINGS", "CHECKING"],
  },
  {
    id: "inst_access",
    name: "Access Bank",
    shortName: "Access",
    code: "044",
    country: "NG",
    primaryColor: "#002B49",
    supportedAccountTypes: ["SAVINGS", "CHECKING"],
  },
  {
    id: "inst_stanbic",
    name: "Stanbic IBTC Bank",
    shortName: "Stanbic",
    code: "221",
    country: "NG",
    primaryColor: "#0033A0",
    supportedAccountTypes: ["SAVINGS", "CHECKING"],
  },
];

export class SandboxFinancialProvider implements FinancialProvider {
  readonly id = "sandbox";
  readonly name = "Sandbox Open Banking Provider";
  readonly isSandbox = true;

  async getInstitutions(): Promise<SupportedInstitution[]> {
    return SUPPORTED_INSTITUTIONS;
  }

  async connectAccount(
    userId: string,
    input: ConnectAccountInput
  ): Promise<{ connectionId: string; account: ProviderAccountResult }> {
    const institution =
      SUPPORTED_INSTITUTIONS.find((i) => i.id === input.institutionId) ??
      SUPPORTED_INSTITUTIONS[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const connectionId = `conn_${institution.id}_${Date.now()}`;
    const externalAccountId = `acc_ext_${institution.id}_${randomSuffix}`;

    const account: ProviderAccountResult = {
      externalAccountId,
      name: `${institution.shortName} ${input.accountType === "CHECKING" ? "Current" : "Savings"}`,
      accountType: (input.accountType as any) ?? "SAVINGS",
      currency: "NGN",
      currentBalance: 842500,
      availableBalance: 842500,
      mask: `•••• ${randomSuffix}`,
    };

    return { connectionId, account };
  }

  async fetchTransactions(
    _connectionId: string,
    _externalAccountId: string,
    options?: { from?: Date; to?: Date }
  ): Promise<RawProviderTransaction[]> {
    const now = new Date();
    const from = options?.from ?? subDays(now, 30);

    // Realistic real-life transactions
    const rawData = [
      { daysAgo: 0, amount: -8500, desc: "UBER *TRIP BV LAGOS NG", merchant: "Uber", type: "DEBIT" },
      { daysAgo: 1, amount: -24300, desc: "SHOPRITE IKEJA MALL POS-092", merchant: "Shoprite", type: "DEBIT" },
      { daysAgo: 2, amount: 500000, desc: "SALARY DIRECT CREDIT / TECHCORP LTD / MARCH", merchant: "TechCorp Ltd", type: "CREDIT" },
      { daysAgo: 3, amount: -35000, desc: "IKEDC PREPAID POWER RECHARGE LAGOS", merchant: "Ikeja Electric", type: "DEBIT" },
      { daysAgo: 4, amount: -4800, desc: "NETFLIX.COM PAYMENT PMT-8472", merchant: "Netflix", type: "DEBIT" },
      { daysAgo: 6, amount: -15200, desc: "CHOWDECK DELIVERIES / FOOD PURCHASE", merchant: "Chowdeck", type: "DEBIT" },
      { daysAgo: 8, amount: -12000, desc: "TOTALENERGIES STATION LEKKI FUEL", merchant: "TotalEnergies", type: "DEBIT" },
      { daysAgo: 11, amount: -22000, desc: "MEDPLUS PHARMACY VI HEALTHCARE", merchant: "MedPlus", type: "DEBIT" },
      { daysAgo: 14, amount: -18500, desc: "BOLT TRIP VICTORIA ISLAND NG", merchant: "Bolt", type: "DEBIT" },
      { daysAgo: 18, amount: -45000, desc: "AIRTEL FIBER BROADBAND LAGOS", merchant: "Airtel Nigeria", type: "DEBIT" },
      { daysAgo: 22, amount: 75000, desc: "FREELANCE DEV RETAINER CONSULTING", merchant: "Consulting Inflow", type: "CREDIT" },
      { daysAgo: 25, amount: -65000, desc: "AIR PEACE FLIGHT TICKETING LOS-ABV", merchant: "Air Peace", type: "DEBIT" },
    ];

    return rawData
      .filter((r) => subDays(now, r.daysAgo) >= from)
      .map((r, idx) => ({
        externalId: `tx_sb_${Date.now()}_${idx}`,
        amount: r.amount,
        currency: "NGN",
        date: formatISO(subDays(now, r.daysAgo)),
        description: r.desc,
        merchantName: r.merchant,
        type: r.type,
        status: "POSTED",
      }));
  }

  async syncAccount(
    connectionId: string,
    externalAccountId: string
  ): Promise<{
    balance: number;
    transactions: RawProviderTransaction[];
    syncedAt: Date;
  }> {
    const txs = await this.fetchTransactions(connectionId, externalAccountId, {
      from: subDays(new Date(), 2),
    });

    return {
      balance: 842500,
      transactions: txs,
      syncedAt: new Date(),
    };
  }

  async disconnect(_connectionId: string): Promise<boolean> {
    return true;
  }
}
