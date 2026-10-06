import { describe, it, expect } from "vitest";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import type { BusinessTransaction, Debt, BusinessAccount } from "@/types/moniepay.types";

describe("MoniePay — Business Decision Intelligence OS", () => {
  const sampleTransactions: BusinessTransaction[] = [
    {
      id: "tx-1",
      client_tx_id: "c-1",
      business_id: "biz-1",
      type: "SALE",
      amount: 35000,
      payment_method: "CASH",
      category: "Provisions",
      transaction_date: new Date().toISOString(),
    },
    {
      id: "tx-2",
      client_tx_id: "c-2",
      business_id: "biz-1",
      type: "SALE",
      amount: 65000,
      payment_method: "POS",
      category: "Drinks",
      transaction_date: new Date().toISOString(),
    },
    {
      id: "tx-3",
      client_tx_id: "c-3",
      business_id: "biz-1",
      type: "STOCK_PURCHASE",
      amount: 45000,
      payment_method: "TRANSFER",
      category: "Stock Restock",
      transaction_date: new Date().toISOString(),
    },
    {
      id: "tx-4",
      client_tx_id: "c-4",
      business_id: "biz-1",
      type: "EXPENSE",
      amount: 8500,
      payment_method: "CASH",
      category: "Generator Fuel",
      transaction_date: new Date().toISOString(),
    },
    {
      id: "tx-5",
      client_tx_id: "c-5",
      business_id: "biz-1",
      type: "OWNER_WITHDRAWAL",
      amount: 15000,
      payment_method: "CASH",
      category: "Chop Money",
      transaction_date: new Date().toISOString(),
    },
  ];

  const sampleDebts: Debt[] = [
    {
      id: "debt-1",
      business_id: "biz-1",
      debt_type: "CUSTOMER_CREDIT",
      person_name: "Bro Segun",
      phone: "+2348031234567",
      original_amount: 35000,
      amount_paid: 0,
      balance_due: 35000,
      status: "PENDING",
      created_at: new Date().toISOString(),
    },
    {
      id: "debt-2",
      business_id: "biz-1",
      debt_type: "CUSTOMER_CREDIT",
      person_name: "Mama Ngozi",
      phone: "+2348029876543",
      original_amount: 30000,
      amount_paid: 0,
      balance_due: 30000,
      status: "PENDING",
      created_at: new Date().toISOString(),
    },
    {
      id: "debt-3",
      business_id: "biz-1",
      debt_type: "CUSTOMER_CREDIT",
      person_name: "Chief Emeka",
      phone: "+2348145566778",
      original_amount: 20000,
      amount_paid: 0,
      balance_due: 20000,
      status: "PENDING",
      created_at: new Date().toISOString(),
    },
  ];

  const sampleAccounts: BusinessAccount[] = [
    {
      id: "acc-1",
      business_id: "biz-1",
      name: "Cash Drawer",
      account_type: "CASH",
      current_balance: 100000,
      is_primary: true,
    },
    {
      id: "acc-2",
      business_id: "biz-1",
      name: "OPay POS",
      account_type: "POS",
      current_balance: 150000,
      is_primary: false,
    },
  ];

  it("1. Deterministically calculates Revenue, Costs, and Operating Profit without LLM", () => {
    const metrics = calculateDeterministicMetrics(sampleTransactions, sampleDebts, sampleAccounts);

    // Total Revenue = 35000 + 65000 = 100000
    expect(metrics.totalRevenue).toBe(100000);
    expect(metrics.cashRevenue).toBe(35000);
    expect(metrics.posRevenue).toBe(65000);

    // Total Costs = 45000 (stock) + 8500 (fuel) = 53500
    expect(metrics.totalCosts).toBe(53500);

    // Operating Profit = 100000 - 53500 = 46500
    expect(metrics.operatingProfit).toBe(46500);

    // Margin = (46500 / 100000) * 100 = 46.5% -> ~47%
    expect(metrics.profitMarginPercent).toBe(47);

    // Owner Chop Money = 15000
    expect(metrics.ownerWithdrawals).toBe(15000);

    // Customer Debt = 35000 + 30000 + 20000 = 85000
    expect(metrics.customerDebtTotal).toBe(85000);
    expect(metrics.customerDebtorCount).toBe(3);
  });

  it("2. Diagnostic Engine triggers '3 customers owe you ₦85,000' priority recommendation", () => {
    const metrics = calculateDeterministicMetrics(sampleTransactions, sampleDebts, sampleAccounts);
    const recs = generatePriorityRecommendations(metrics, sampleTransactions, sampleDebts, "Mama Chidi Store");

    expect(recs.length).toBeGreaterThan(0);
    const topRec = recs[0];

    // Priority rank 1 must target collecting the trapped ₦85,000 customer credit before restocking
    expect(topRec.action_type).toBe("COLLECT_DEBT");
    expect(topRec.title).toContain("3 customers owe you ₦85,000");
    expect(topRec.title).toContain("Collect these before restocking");
    expect(topRec.action_payload?.phone).toBeDefined();
    expect(topRec.action_payload?.suggested_message).toContain("balance");
  });

  it("3. Calculates Safe Owner Withdrawal amount when liquidity is healthy", () => {
    // When customer debt is settled and cash is surplus
    const settledDebts = sampleDebts.map(d => ({ ...d, status: "SETTLED" as const, balance_due: 0 }));
    const metrics = calculateDeterministicMetrics(sampleTransactions, settledDebts, sampleAccounts);

    expect(metrics.safeWithdrawalAmount).toBeGreaterThan(0);
  });
});
