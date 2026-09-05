// ─────────────────────────────────────────────
// Mock Transaction Provider
// Generates realistic synthetic financial data for Stage 1 development
// ─────────────────────────────────────────────

import type { RawProviderTransaction } from "@/types/transaction.types";
import type { IFinancialProvider, ProviderFetchOptions, ProviderFetchResult, ProviderAccount, FinancialProviderConfig } from "@/types/provider.types";
import { subDays, format, addDays } from "date-fns";

// ── Realistic sandbox dataset ─────────────────
// 90-day transaction history for a Nigerian professional

const MOCK_ACCOUNT_ID = "mock-account-gtb-001";
const MOCK_SAVINGS_ID = "mock-account-gtb-savings";

type MockTransactionTemplate = {
  externalId: string;
  amount: number;
  date: number; // days ago (negative)
  description: string;
  merchantName?: string;
  type?: string;
};

const TRANSACTION_TEMPLATES: MockTransactionTemplate[] = [
  // ── Income ────────────────────────────────────
  { externalId: "TXN-SAL-090", amount: 450000, date: -90, description: "SALARY CREDIT - TECHCORP LTD", merchantName: "TechCorp Ltd", type: "INCOME" },
  { externalId: "TXN-SAL-060", amount: 450000, date: -60, description: "SALARY CREDIT - TECHCORP LTD", merchantName: "TechCorp Ltd", type: "INCOME" },
  { externalId: "TXN-SAL-030", amount: 460000, date: -30, description: "SALARY CREDIT - TECHCORP LTD", merchantName: "TechCorp Ltd", type: "INCOME" },
  { externalId: "TXN-SAL-003", amount: 460000, date: -3, description: "SALARY CREDIT - TECHCORP LTD", merchantName: "TechCorp Ltd", type: "INCOME" },
  { externalId: "TXN-FREE-075", amount: 120000, date: -75, description: "PAYMENT FROM STARTUP LABS - FREELANCE", merchantName: "Startup Labs", type: "INCOME" },
  { externalId: "TXN-FREE-045", amount: 80000, date: -45, description: "PAYMENT FROM DESIGNWEB - PROJECT", merchantName: "DesignWeb", type: "INCOME" },
  { externalId: "TXN-FREE-015", amount: 95000, date: -15, description: "PAYMENT FROM BUILDAPP - CONSULTING", merchantName: "BuildApp", type: "INCOME" },

  // ── Food & Dining ─────────────────────────────
  { externalId: "TXN-UBER-088", amount: -7500, date: -88, description: "UBER *TRIP HELP.UBER.COM", merchantName: "UBER" },
  { externalId: "TXN-CHICK-086", amount: -4800, date: -86, description: "CHICKEN REPUBLIC VICTORIA ISLAND", merchantName: "CHICKEN REPUBLIC" },
  { externalId: "TXN-BOLT-082", amount: -3200, date: -82, description: "BOLT FOOD ORDER #BF78234", merchantName: "BOLT FOOD" },
  { externalId: "TXN-CHOW-079", amount: -5500, date: -79, description: "CHOWDECK ORDER #CHW45621", merchantName: "CHOWDECK" },
  { externalId: "TXN-REST-076", amount: -12500, date: -76, description: "TERRA KULTURE RESTAURANT VI", merchantName: "Terra Kulture" },
  { externalId: "TXN-KFC-073", amount: -6200, date: -73, description: "KFC IKEJA CITY MALL", merchantName: "KFC" },
  { externalId: "TXN-DOM-070", amount: -8900, date: -70, description: "DOMINOS PIZZA LEKKI", merchantName: "DOMINOS PIZZA" },
  { externalId: "TXN-UBER-067", amount: -7200, date: -67, description: "UBER *TRIP", merchantName: "UBER" },
  { externalId: "TXN-BOLT-064", amount: -4100, date: -64, description: "BOLT FOOD ORDER", merchantName: "BOLT FOOD" },
  { externalId: "TXN-CHICK-060", amount: -5300, date: -60, description: "CHICKEN REPUBLIC SURULERE", merchantName: "CHICKEN REPUBLIC" },
  { externalId: "TXN-CAFE-057", amount: -3800, date: -57, description: "CAFE NEO IKEJA", merchantName: "Cafe Neo" },
  { externalId: "TXN-REST-054", amount: -18500, date: -54, description: "SMOKEHOUSE BBQ & GRILL", merchantName: "Smokehouse" },
  { externalId: "TXN-CHOW-050", amount: -6400, date: -50, description: "CHOWDECK ORDER", merchantName: "CHOWDECK" },
  { externalId: "TXN-KFC-047", amount: -5800, date: -47, description: "KFC MARINA", merchantName: "KFC" },
  { externalId: "TXN-UBER-044", amount: -9100, date: -44, description: "UBER *TRIP", merchantName: "UBER" },
  { externalId: "TXN-BOLT-040", amount: -4700, date: -40, description: "BOLT FOOD", merchantName: "BOLT FOOD" },
  { externalId: "TXN-CHICK-037", amount: -5100, date: -37, description: "CHICKEN REPUBLIC IKOYI", merchantName: "CHICKEN REPUBLIC" },
  { externalId: "TXN-REST-034", amount: -22000, date: -34, description: "NKOYO RESTAURANT IKOYI - DINNER", merchantName: "Nkoyo" },
  { externalId: "TXN-CHOW-030", amount: -7200, date: -30, description: "CHOWDECK ORDER #CHW89012", merchantName: "CHOWDECK" },
  { externalId: "TXN-CAFE-027", amount: -4200, date: -27, description: "STARBUCKS VICTORIA ISLAND", merchantName: "Starbucks" },
  { externalId: "TXN-DOM-024", amount: -8400, date: -24, description: "DOMINOS PIZZA AJAH", merchantName: "DOMINOS PIZZA" },
  { externalId: "TXN-UBER-021", amount: -8800, date: -21, description: "UBER *TRIP HELP.UBER.COM", merchantName: "UBER" },
  { externalId: "TXN-CHOW-018", amount: -5900, date: -18, description: "CHOWDECK ORDER", merchantName: "CHOWDECK" },
  { externalId: "TXN-REST-015", amount: -14500, date: -15, description: "CRAFT GRILL & BAR VI", merchantName: "Craft Grill" },
  { externalId: "TXN-BOLT-012", amount: -3900, date: -12, description: "BOLT FOOD ORDER", merchantName: "BOLT FOOD" },
  { externalId: "TXN-KFC-009", amount: -5600, date: -9, description: "KFC LEKKI PHASE 1", merchantName: "KFC" },
  { externalId: "TXN-CHOW-006", amount: -6800, date: -6, description: "CHOWDECK ORDER #CHW00123", merchantName: "CHOWDECK" },
  { externalId: "TXN-UBER-003", amount: -8500, date: -3, description: "UBER *TRIP", merchantName: "UBER" },

  // ── Groceries ─────────────────────────────────
  { externalId: "TXN-SHOP-085", amount: -28500, date: -85, description: "SHOPRITE IKEJA CITY MALL", merchantName: "SHOPRITE" },
  { externalId: "TXN-SHOP-055", amount: -31200, date: -55, description: "SHOPRITE VICTORIA ISLAND", merchantName: "SHOPRITE" },
  { externalId: "TXN-SPAR-038", amount: -19800, date: -38, description: "SPAR SUPERMARKET LEKKI", merchantName: "SPAR" },
  { externalId: "TXN-SHOP-020", amount: -26500, date: -20, description: "SHOPRITE IKEJA", merchantName: "SHOPRITE" },
  { externalId: "TXN-SPAR-008", amount: -22400, date: -8, description: "SPAR MARINA", merchantName: "SPAR" },

  // ── Transportation ────────────────────────────
  { externalId: "TXN-BOLT-087", amount: -2400, date: -87, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-FUEL-083", amount: -35000, date: -83, description: "TOTAL PETROL STATION IKEJA", merchantName: "TOTAL" },
  { externalId: "TXN-BOLT-080", amount: -1800, date: -80, description: "BOLT *TRIP 3KM", merchantName: "BOLT" },
  { externalId: "TXN-BOLT-077", amount: -3100, date: -77, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-FUEL-065", amount: -38000, date: -65, description: "ARDOVA PETROL STATION LEKKI", merchantName: "ARDOVA" },
  { externalId: "TXN-BOLT-058", amount: -2200, date: -58, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-BOLT-048", amount: -2700, date: -48, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-FUEL-036", amount: -40000, date: -36, description: "TOTAL PETROL STATION VICTORIA ISLAND", merchantName: "TOTAL" },
  { externalId: "TXN-BOLT-029", amount: -1900, date: -29, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-BOLT-023", amount: -3400, date: -23, description: "BOLT *TRIP", merchantName: "BOLT" },
  { externalId: "TXN-FUEL-013", amount: -42000, date: -13, description: "ARDOVA PETROL LEKKI PHASE 1", merchantName: "ARDOVA" },
  { externalId: "TXN-BOLT-007", amount: -2600, date: -7, description: "BOLT *TRIP", merchantName: "BOLT" },

  // ── Utilities ─────────────────────────────────
  { externalId: "TXN-EKEDC-089", amount: -15000, date: -89, description: "EKEDC ELECTRICITY TOKEN - METER 45612", merchantName: "EKEDC" },
  { externalId: "TXN-SPEC-085", amount: -22000, date: -85, description: "SPECTRANET INTERNET - MONTHLY PLAN", merchantName: "SPECTRANET" },
  { externalId: "TXN-EKEDC-059", amount: -15000, date: -59, description: "EKEDC ELECTRICITY TOKEN", merchantName: "EKEDC" },
  { externalId: "TXN-SPEC-055", amount: -22000, date: -55, description: "SPECTRANET INTERNET SUBSCRIPTION", merchantName: "SPECTRANET" },
  { externalId: "TXN-EKEDC-029", amount: -18000, date: -29, description: "EKEDC ELECTRICITY TOKEN", merchantName: "EKEDC" },
  { externalId: "TXN-SPEC-025", amount: -22000, date: -25, description: "SPECTRANET INTERNET - MONTHLY", merchantName: "SPECTRANET" },

  // ── Airtime & Data ────────────────────────────
  { externalId: "TXN-MTN-090", amount: -5000, date: -90, description: "MTN DATA BUNDLE - 20GB MONTHLY", merchantName: "MTN" },
  { externalId: "TXN-MTN-060", amount: -5000, date: -60, description: "MTN DATA BUNDLE", merchantName: "MTN" },
  { externalId: "TXN-MTN-030", amount: -5000, date: -30, description: "MTN DATA BUNDLE 20GB", merchantName: "MTN" },
  { externalId: "TXN-MTN-002", amount: -5000, date: -2, description: "MTN DATA BUNDLE", merchantName: "MTN" },
  { externalId: "TXN-AIR-074", amount: -1000, date: -74, description: "AIRTEL AIRTIME RECHARGE", merchantName: "AIRTEL" },

  // ── Entertainment & Subscriptions ─────────────
  { externalId: "TXN-NFLX-089", amount: -5000, date: -89, description: "NETFLIX.COM", merchantName: "NETFLIX" },
  { externalId: "TXN-SPOT-089", amount: -3500, date: -89, description: "SPOTIFY AB PREMIUM", merchantName: "SPOTIFY" },
  { externalId: "TXN-DSTV-088", amount: -24500, date: -88, description: "MULTICHOICE DSTV COMPACT PLUS", merchantName: "DSTV" },
  { externalId: "TXN-NFLX-059", amount: -5000, date: -59, description: "NETFLIX.COM", merchantName: "NETFLIX" },
  { externalId: "TXN-SPOT-059", amount: -3500, date: -59, description: "SPOTIFY AB", merchantName: "SPOTIFY" },
  { externalId: "TXN-DSTV-058", amount: -24500, date: -58, description: "MULTICHOICE DSTV COMPACT PLUS", merchantName: "DSTV" },
  { externalId: "TXN-NFLX-029", amount: -5000, date: -29, description: "NETFLIX.COM MONTHLY", merchantName: "NETFLIX" },
  { externalId: "TXN-SPOT-029", amount: -3500, date: -29, description: "SPOTIFY PREMIUM", merchantName: "SPOTIFY" },
  { externalId: "TXN-DSTV-028", amount: -24500, date: -28, description: "MULTICHOICE DSTV", merchantName: "DSTV" },
  { externalId: "TXN-CIN-072", amount: -9000, date: -72, description: "FILMHOUSE CINEMAS TICKET - 2 SEATS", merchantName: "Filmhouse Cinemas" },
  { externalId: "TXN-CIN-042", amount: -7500, date: -42, description: "GENESIS CINEMAS TICKET", merchantName: "Genesis Cinemas" },
  { externalId: "TXN-CIN-012", amount: -9000, date: -12, description: "FILMHOUSE CINEMAS - 2 SEATS", merchantName: "Filmhouse Cinemas" },

  // ── Shopping ──────────────────────────────────
  { externalId: "TXN-JUM-081", amount: -45000, date: -81, description: "JUMIA ORDER #JM78234190", merchantName: "JUMIA" },
  { externalId: "TXN-JUM-051", amount: -32500, date: -51, description: "JUMIA ORDER PAYMENT", merchantName: "JUMIA" },
  { externalId: "TXN-CLO-043", amount: -58000, date: -43, description: "H&M VICTORIA ISLAND PURCHASE", merchantName: "H&M" },
  { externalId: "TXN-JUM-022", amount: -28000, date: -22, description: "JUMIA ORDER #JM99887766", merchantName: "JUMIA" },
  { externalId: "TXN-ELEC-011", amount: -125000, date: -11, description: "SLOT SYSTEMS IKEJA - ACCESSORIES", merchantName: "Slot Systems" },

  // ── Education ─────────────────────────────────
  { externalId: "TXN-UDM-068", amount: -15000, date: -68, description: "UDEMY COURSE PURCHASE", merchantName: "UDEMY" },
  { externalId: "TXN-GGL-035", amount: -18500, date: -35, description: "GOOGLE CLOUD CERTIFICATION", merchantName: "GOOGLE" },

  // ── Healthcare ────────────────────────────────
  { externalId: "TXN-PHARM-078", amount: -8200, date: -78, description: "MEDPLUS PHARMACY IKEJA", merchantName: "MedPlus Pharmacy" },
  { externalId: "TXN-LAB-049", amount: -22000, date: -49, description: "REDDINGTON HOSPITAL - LAB TESTS", merchantName: "Reddington Hospital" },
  { externalId: "TXN-PHARM-019", amount: -6500, date: -19, description: "HEALTH PLUS PHARMACY", merchantName: "HealthPlus" },

  // ── Personal Care ─────────────────────────────
  { externalId: "TXN-BAR-084", amount: -5000, date: -84, description: "HAIR SALON LEKKI PHASE 1", merchantName: "Hair Salon" },
  { externalId: "TXN-GYM-083", amount: -35000, date: -83, description: "SPORT VILLAGE GYM - MONTHLY MEMBERSHIP", merchantName: "Sport Village" },
  { externalId: "TXN-BAR-056", amount: -5000, date: -56, description: "UPSCALE BARBERS IKEJA", merchantName: "Upscale Barbers" },
  { externalId: "TXN-GYM-053", amount: -35000, date: -53, description: "SPORT VILLAGE GYM - MONTHLY", merchantName: "Sport Village" },
  { externalId: "TXN-BAR-026", amount: -5000, date: -26, description: "UPSCALE BARBERS IKEJA", merchantName: "Upscale Barbers" },
  { externalId: "TXN-GYM-023", amount: -35000, date: -23, description: "SPORT VILLAGE GYM MEMBERSHIP", merchantName: "Sport Village" },

  // ── Internal Transfers ────────────────────────
  { externalId: "TXN-TRF-085", amount: -100000, date: -85, description: "NIP TRANSFER TO GTB SAVINGS - SAVINGS", merchantName: undefined, type: "TRANSFER" },
  { externalId: "TXN-TRF-055", amount: -100000, date: -55, description: "NIP TRANSFER TO GTB SAVINGS", merchantName: undefined, type: "TRANSFER" },
  { externalId: "TXN-TRF-025", amount: -150000, date: -25, description: "NIP TRANSFER TO GTB SAVINGS", merchantName: undefined, type: "TRANSFER" },

  // ── Refund ────────────────────────────────────
  { externalId: "TXN-REF-066", amount: 7500, date: -66, description: "JUMIA REFUND ORDER #JM78100", merchantName: "JUMIA", type: "REFUND" },
];

export class MockProvider implements IFinancialProvider {
  readonly config: FinancialProviderConfig = {
    name: "MOCK",
    displayName: "Sandbox (Mock Data)",
    isLive: false,
    isSandbox: true,
    supportedCountries: ["NG"],
  };

  async getAccounts(_connectionId: string): Promise<ProviderAccount[]> {
    return [
      {
        externalId: MOCK_ACCOUNT_ID,
        name: "GTBank Current Account",
        type: "CHECKING",
        currency: "NGN",
        balance: 0, // computed from transactions
        institutionName: "Guaranty Trust Bank",
        institutionCode: "058",
      },
      {
        externalId: MOCK_SAVINGS_ID,
        name: "GTBank Savings Account",
        type: "SAVINGS",
        currency: "NGN",
        balance: 0,
        institutionName: "Guaranty Trust Bank",
        institutionCode: "058",
      },
    ];
  }

  async fetchTransactions(
    _connectionId: string,
    options: ProviderFetchOptions
  ): Promise<ProviderFetchResult> {
    const now = new Date();
    const from = options.from ?? subDays(now, 90);
    const to = options.to ?? now;

    const transactions: RawProviderTransaction[] = [];
    for (const t of TRANSACTION_TEMPLATES) {
      const date = addDays(now, t.date);
      if (date >= from && date <= to) {
        transactions.push({
          externalId: t.externalId,
          amount: t.amount,
          currency: "NGN",
          date: date.toISOString(),
          description: t.description,
          merchantName: t.merchantName,
          type: t.type,
          status: "POSTED",
        });
      }
    }

    return {
      transactions,
      hasMore: false,
      fetchedAt: now,
    };
  }

  async testConnection(_connectionId: string): Promise<boolean> {
    return true;
  }

  /**
   * Generate a single simulated transaction on demand (dev tool).
   */
  generateSimulatedTransaction(
    type: "income" | "expense" | "transfer" | "refund",
    overrides: Partial<RawProviderTransaction> = {}
  ): RawProviderTransaction {
    const now = new Date();

    const presets: Record<string, Partial<RawProviderTransaction>> = {
      income: {
        amount: 500000,
        description: "SALARY CREDIT - TECHCORP LTD",
        merchantName: "TechCorp Ltd",
        type: "INCOME",
      },
      expense: {
        amount: -8500,
        description: "UBER *TRIP",
        merchantName: "UBER",
        type: "EXPENSE",
      },
      transfer: {
        amount: -50000,
        description: "NIP TRANSFER TO SAVINGS ACCOUNT",
        type: "TRANSFER",
      },
      refund: {
        amount: 7500,
        description: "REFUND - ORDER CANCELLED",
        type: "REFUND",
      },
    };

    return {
      externalId: `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: 0,
      currency: "NGN",
      date: now.toISOString(),
      description: "Simulated transaction",
      status: "POSTED",
      ...presets[type],
      ...overrides,
    };
  }
}
