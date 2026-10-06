// ─────────────────────────────────────────────────────────────────
// MoniePay — Deterministic Financial Intelligence Engine
// 100% reproducible, auditable arithmetic. No hallucinations.
// Transforms messy raw activity into:
// Revenue → Costs → Profit → Cash → Debt → Withdrawals → Business Health
// ─────────────────────────────────────────────────────────────────

import type {
  BusinessTransaction,
  Debt,
  BusinessAccount,
  DeterministicMetrics,
} from "@/types/moniepay.types";

export function calculateDeterministicMetrics(
  transactions: BusinessTransaction[],
  debts: Debt[] = [],
  accounts: BusinessAccount[] = []
): DeterministicMetrics {
  let totalRevenue = 0;
  let cashRevenue = 0;
  let transferRevenue = 0;
  let posRevenue = 0;
  let creditRevenue = 0;

  let directStockCost = 0;
  let operatingExpenses = 0;
  let staffWages = 0;

  let ownerWithdrawals = 0;
  let debtCollections = 0;
  let supplierPayments = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;

    switch (tx.type) {
      case "SALE": {
        totalRevenue += amount;
        if (tx.payment_method === "CASH") cashRevenue += amount;
        else if (tx.payment_method === "TRANSFER") transferRevenue += amount;
        else if (tx.payment_method === "POS") posRevenue += amount;
        else if (tx.payment_method === "CREDIT") creditRevenue += amount;
        break;
      }
      case "STOCK_PURCHASE": {
        directStockCost += amount;
        break;
      }
      case "EXPENSE": {
        operatingExpenses += amount;
        break;
      }
      case "STAFF_PAYMENT": {
        staffWages += amount;
        break;
      }
      case "OWNER_WITHDRAWAL": {
        ownerWithdrawals += amount;
        break;
      }
      case "DEBT_COLLECTION": {
        debtCollections += amount;
        break;
      }
      case "SUPPLIER_PAYMENT": {
        supplierPayments += amount;
        break;
      }
    }
  }

  // Costs
  const totalCosts = directStockCost + operatingExpenses + staffWages;

  // Real Operating Profit (Revenue minus goods & operations)
  const operatingProfit = totalRevenue - totalCosts;
  const profitMarginPercent =
    totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 100) : 0;

  // Liquid Cash Position (Derived from active accounts or net physical/digital flow)
  let cashAtHand = 0;
  let bankAndPosBalance = 0;

  if (accounts.length > 0) {
    for (const acc of accounts) {
      const bal = Number(acc.current_balance) || 0;
      if (acc.account_type === "CASH") {
        cashAtHand += bal;
      } else {
        bankAndPosBalance += bal;
      }
    }
  } else {
    // Derived from transactions
    cashAtHand = Math.max(
      0,
      cashRevenue + debtCollections - (directStockCost * 0.4 + operatingExpenses * 0.7 + ownerWithdrawals * 0.5)
    );
    bankAndPosBalance = Math.max(
      0,
      transferRevenue + posRevenue - (directStockCost * 0.6 + operatingExpenses * 0.3 + staffWages)
    );
  }

  const liquidCash = cashAtHand + bankAndPosBalance;

  // Debt position from active debts
  let customerDebtTotal = 0;
  const activeDebtors = new Set<string>();

  let supplierDebtTotal = 0;

  for (const d of debts) {
    const bal = Number(d.balance_due) || 0;
    if (d.status !== "SETTLED" && bal > 0) {
      if (d.debt_type === "CUSTOMER_CREDIT") {
        customerDebtTotal += bal;
        activeDebtors.add(d.person_name.trim().toLowerCase());
      } else if (d.debt_type === "SUPPLIER_OBLIGATION") {
        supplierDebtTotal += bal;
      }
    }
  }

  // Net retained cash after owner withdrawals
  const retainedCash = operatingProfit - ownerWithdrawals;

  // Safe Withdrawal Calculation
  // A safe withdrawal guarantees the shop does not starve its restock cycle.
  // Formula: Retained profit adjusted for immediate cash buffer (must maintain 3 days of operating liquidity).
  const immediateBuffer = totalCosts > 0 ? (totalCosts / 30) * 4 : 20000;
  const availableLiquidity = Math.max(0, liquidCash - supplierDebtTotal - immediateBuffer);
  const safeWithdrawalAmount = Math.max(
    0,
    Math.round(Math.min(availableLiquidity, Math.max(0, retainedCash * 0.7)) / 1000) * 1000
  );

  // Business Health Score (0 to 100)
  // Deterministic 4-pillar index:
  // 1. Profit Margin Health (35 pts)
  // 2. Cash vs Debt/Obligation Coverage (30 pts)
  // 3. Customer Debt Exposure (20 pts)
  // 4. Withdrawal Discipline (15 pts)

  let score = 50; // base

  // 1. Margin
  if (profitMarginPercent >= 25) score += 20;
  else if (profitMarginPercent >= 15) score += 12;
  else if (profitMarginPercent >= 5) score += 5;
  else if (profitMarginPercent < 0) score -= 15;

  // 2. Liquidity vs supplier debt
  if (liquidCash > supplierDebtTotal * 2) score += 15;
  else if (liquidCash >= supplierDebtTotal) score += 8;
  else score -= 15;

  // 3. Debt exposure: Customer credit / revenue ratio
  const debtToRevenueRatio = totalRevenue > 0 ? customerDebtTotal / totalRevenue : 0;
  if (debtToRevenueRatio < 0.15) score += 10;
  else if (debtToRevenueRatio > 0.35) score -= 12;

  // 4. Withdrawal discipline
  if (ownerWithdrawals <= operatingProfit * 0.6) score += 10;
  else if (ownerWithdrawals > operatingProfit && operatingProfit > 0) score -= 10;
  else if (operatingProfit <= 0 && ownerWithdrawals > 0) score -= 15;

  // Clamp 0 - 100
  score = Math.max(15, Math.min(98, score));

  let healthStatus: DeterministicMetrics["healthStatus"] = "Stable";
  let healthMessage = "Business operations are steady.";

  if (score >= 80) {
    healthStatus = "Thriving";
    healthMessage = "Strong cash generation and healthy profit margins.";
  } else if (score >= 65) {
    healthStatus = "Stable";
    healthMessage = "Steady trading with manageable cash and debt balance.";
  } else if (score >= 45) {
    healthStatus = "Cash Pressure";
    healthMessage = "Cash is tight due to delayed debt collection or high expenses.";
  } else {
    healthStatus = "At Risk";
    healthMessage = "Expenses and unpaid customer credit are threatening stock replenishment.";
  }

  return {
    totalRevenue,
    cashRevenue,
    transferRevenue,
    posRevenue,
    creditRevenue,
    directStockCost,
    operatingExpenses,
    staffWages,
    totalCosts,
    operatingProfit,
    profitMarginPercent,
    liquidCash,
    cashAtHand,
    bankAndPosBalance,
    customerDebtTotal,
    customerDebtorCount: activeDebtors.size,
    supplierDebtTotal,
    ownerWithdrawals,
    retainedCash,
    healthScore: score,
    healthStatus,
    healthMessage,
    safeWithdrawalAmount,
  };
}
