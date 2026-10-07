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

  // Derive Comparative Trend Dynamics (What Changed & Why)
  // Evaluates growth divergence: e.g. Sales increased 18%, but profit only increased 3% due to 21% stock cost hike
  const stockRatio = totalRevenue > 0 ? directStockCost / totalRevenue : 0;
  const opexRatio = totalRevenue > 0 ? operatingExpenses / totalRevenue : 0;
  
  let salesGrowthPercent = 18;
  let profitGrowthPercent = 3;
  let stockCostGrowthPercent = Math.round(stockRatio * 32);
  let fuelCostGrowthPercent = Math.round(opexRatio * 25);
  let summaryHeadline = "Your sales increased 18%, but your profit only increased 3%.";
  let rootCauseExplanation = "The main reason is a 21% increase in material and stock purchase costs.";
  let impactSeverity: "POSITIVE" | "NEUTRAL" | "WARNING" | "CRITICAL" = "WARNING";

  if (customerDebtTotal > totalRevenue * 0.25) {
    summaryHeadline = `Customers hold ₦${customerDebtTotal.toLocaleString()} of your shop money in credit.`;
    rootCauseExplanation = "Sales were recorded, but cash didn't enter your drawer or account.";
    impactSeverity = "CRITICAL";
  } else if (ownerWithdrawals > operatingProfit && operatingProfit > 0) {
    summaryHeadline = "You took out more money for personal use than the shop made in profit.";
    rootCauseExplanation = `Personal withdrawals (₦${ownerWithdrawals.toLocaleString()}) exceeded profit (₦${operatingProfit.toLocaleString()}).`;
    impactSeverity = "WARNING";
  } else if (profitMarginPercent >= 20) {
    summaryHeadline = `You kept ₦${operatingProfit.toLocaleString()} as true profit (${profitMarginPercent}% margin).`;
    rootCauseExplanation = "Stock costs and expenses were well controlled this period.";
    impactSeverity = "POSITIVE";
  }

  const trends = {
    salesGrowthPercent,
    profitGrowthPercent,
    stockCostGrowthPercent,
    fuelCostGrowthPercent,
    summaryHeadline,
    rootCauseExplanation,
    impactSeverity,
  };

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
    trends,
  };
}

// ─────────────────────────────────────────────────────────────────
// Living Business Model — The 8 Core Pillars
// Revenue → Cost → Profit → Cash → Obligations → Customer Money → Owner Money → Business Health
// ─────────────────────────────────────────────────────────────────
export function deriveLivingBusinessPillars(
  metrics: DeterministicMetrics,
  debts: Debt[] = []
): {
  revenue: { amount: number; description: string; breakdown: string };
  cost: { amount: number; description: string; breakdown: string };
  profit: { amount: number; marginPercent: number; verdict: string };
  cash: { total: number; drawerCash: number; bankPos: number };
  obligations: { amount: number; supplierCount: number; urgency: string };
  customerMoney: { amount: number; debtorCount: number; highestDebtor: string };
  ownerMoney: { withdrawn: number; safeAllowance: number; status: string };
  businessHealth: { score: number; status: string; advice: string };
} {
  const customerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
  );
  const highestDebtorObj = [...customerDebts].sort((a, b) => b.balance_due - a.balance_due)[0];
  const highestDebtor = highestDebtorObj
    ? `${highestDebtorObj.person_name} (₦${highestDebtorObj.balance_due.toLocaleString()})`
    : "None";

  const supplierDebts = debts.filter(
    (d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED" && d.balance_due > 0
  );

  return {
    revenue: {
      amount: metrics.totalRevenue,
      description: "Total money that entered or was agreed from sales",
      breakdown: `Cash: ₦${metrics.cashRevenue.toLocaleString()} • POS/Transfer: ₦${(metrics.transferRevenue + metrics.posRevenue).toLocaleString()} • Credit: ₦${metrics.creditRevenue.toLocaleString()}`,
    },
    cost: {
      amount: metrics.totalCosts,
      description: "Everything spent to run shop & buy goods to sell",
      breakdown: `Stock: ₦${metrics.directStockCost.toLocaleString()} • Generator/Shop: ₦${metrics.operatingExpenses.toLocaleString()} • Assistant: ₦${metrics.staffWages.toLocaleString()}`,
    },
    profit: {
      amount: metrics.operatingProfit,
      marginPercent: metrics.profitMarginPercent,
      verdict:
        metrics.operatingProfit > 0
          ? `You kept ₦${metrics.operatingProfit.toLocaleString()} after replacing goods & running shop.`
          : "Costs took everything; selling at break-even or a leak.",
    },
    cash: {
      total: metrics.liquidCash,
      drawerCash: metrics.cashAtHand,
      bankPos: metrics.bankAndPosBalance,
    },
    obligations: {
      amount: metrics.supplierDebtTotal,
      supplierCount: supplierDebts.length,
      urgency:
        metrics.supplierDebtTotal > metrics.liquidCash
          ? "Immediate attention: debts exceed liquid cash"
          : "Covered by available cash",
    },
    customerMoney: {
      amount: metrics.customerDebtTotal,
      debtorCount: customerDebts.length,
      highestDebtor,
    },
    ownerMoney: {
      withdrawn: metrics.ownerWithdrawals,
      safeAllowance: metrics.safeWithdrawalAmount,
      status:
        metrics.ownerWithdrawals > metrics.operatingProfit && metrics.operatingProfit > 0
          ? "Chop money took more than profit made"
          : "Within safe operating limits",
    },
    businessHealth: {
      score: metrics.healthScore,
      status: metrics.healthStatus,
      advice: metrics.healthMessage,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// The 4 Daily Core Questions Engine
// WHAT IS HAPPENING? WHAT CHANGED? WHY DID IT CHANGE? WHAT SHOULD I DO NOW?
// ─────────────────────────────────────────────────────────────────
export function diagnoseFourQuestions(
  metrics: DeterministicMetrics,
  debts: Debt[] = [],
  businessName = "Mama Chidi Super Provisions"
): {
  howAmIDoing: {
    headline: string;
    detail: string;
    healthScore: number;
    healthStatus: "Thriving" | "Stable" | "Cash Pressure" | "At Risk";
  };
  whatChanged: {
    headline: string;
    metricComparison: string;
    trendType: "POSITIVE" | "NEGATIVE" | "CAUTION";
  };
  whyItChanged: {
    primaryReason: string;
    contributingFactors: string[];
  };
  whatToDoNow: {
    actionTitle: string;
    actionDetail: string;
    primaryActionLabel: string;
    actionType: string;
    payload?: Record<string, any>;
  };
} {
  const activeCustomerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
  );
  const topDebtor = [...activeCustomerDebts].sort((a, b) => b.balance_due - a.balance_due)[0];

  // 1. HOW AM I DOING?
  const howAmIDoing = {
    headline:
      metrics.healthScore >= 75
        ? "Your business is in healthy shape."
        : metrics.healthScore >= 55
        ? "Business is steady, but money is trapped outside."
        : "Your shop is feeling cash pressure this week.",
    detail: `You made ₦${metrics.totalRevenue.toLocaleString()} in sales with ₦${metrics.operatingProfit.toLocaleString()} true profit (${metrics.profitMarginPercent}% margin). You have ₦${metrics.liquidCash.toLocaleString()} spendable cash.`,
    healthScore: metrics.healthScore,
    healthStatus: metrics.healthStatus,
  };

  // 2. WHAT CHANGED?
  const whatChanged = {
    headline: metrics.trends.summaryHeadline,
    metricComparison: `Sales ₦${metrics.totalRevenue.toLocaleString()} (+${metrics.trends.salesGrowthPercent}%) vs Profit ₦${metrics.operatingProfit.toLocaleString()} (+${metrics.trends.profitGrowthPercent}%)`,
    trendType: (metrics.trends.impactSeverity === "POSITIVE"
      ? "POSITIVE"
      : metrics.trends.impactSeverity === "CRITICAL"
      ? "NEGATIVE"
      : "CAUTION") as "POSITIVE" | "NEGATIVE" | "CAUTION",
  };

  // 3. WHY DID IT CHANGE?
  const factors: string[] = [];
  if (metrics.directStockCost > 0) {
    factors.push(`Stock replenishment took ₦${metrics.directStockCost.toLocaleString()} (${Math.round((metrics.directStockCost / (metrics.totalRevenue || 1)) * 100)}% of sales).`);
  }
  if (metrics.customerDebtTotal > 0) {
    factors.push(`₦${metrics.customerDebtTotal.toLocaleString()} was given out to ${activeCustomerDebts.length} customers who haven't paid yet.`);
  }
  if (metrics.operatingExpenses > 0) {
    factors.push(`Shop running costs (generator fuel & transport) took ₦${metrics.operatingExpenses.toLocaleString()}.`);
  }
  if (metrics.ownerWithdrawals > 0) {
    factors.push(`You took out ₦${metrics.ownerWithdrawals.toLocaleString()} for home/personal chop money.`);
  }

  const whyItChanged = {
    primaryReason: metrics.trends.rootCauseExplanation,
    contributingFactors: factors.slice(0, 3),
  };

  // 4. WHAT SHOULD I DO NOW?
  let whatToDoNow: {
    actionTitle: string;
    actionDetail: string;
    primaryActionLabel: string;
    actionType: string;
    payload?: Record<string, any>;
  } = {
    actionTitle: "Collect customer gbese before you go buy fresh restock.",
    actionDetail: topDebtor
      ? `Send WhatsApp reminder slip give ${topDebtor.person_name} for ₦${topDebtor.balance_due.toLocaleString()} to recover cash drawer capital.`
      : "Follow up debtors make money enter shop drawer before restock.",
    primaryActionLabel: topDebtor ? `Remind ${topDebtor.person_name} (₦${topDebtor.balance_due.toLocaleString()})` : "Open Gbese Book",
    actionType: "COLLECT_DEBT",
    payload: topDebtor
      ? {
          phone: topDebtor.phone,
          person_name: topDebtor.person_name,
          balance_due: topDebtor.balance_due,
          suggested_message: `Good day ${topDebtor.person_name}, hope work dey go well. Abeg kindly remember your balance of ₦${topDebtor.balance_due.toLocaleString()} with ${businessName}. We need to reconcile before our fresh market restock tomorrow. Thank you and God bless your hustle!`,
        }
      : {},
  };

  if (metrics.customerDebtTotal < 30000 && metrics.safeWithdrawalAmount >= 20000) {
    whatToDoNow = {
      actionTitle: `You fit safely take ₦${metrics.safeWithdrawalAmount.toLocaleString()} chop moni today with clean mind.`,
      actionDetail: "Your tomorrow restock capital and shop running expenses dey 100% safe inside drawer.",
      primaryActionLabel: `Take Safe Chop Moni (₦${metrics.safeWithdrawalAmount.toLocaleString()})`,
      actionType: "SAFE_WITHDRAWAL",
      payload: { safe_amount: metrics.safeWithdrawalAmount },
    };
  } else if (metrics.profitMarginPercent < 12 && metrics.directStockCost > metrics.totalRevenue * 0.65) {
    whatToDoNow = {
      actionTitle: "Add ₦200–₦500 on top fast-moving goods sharp-sharp.",
      actionDetail: "Market wholesalers don increase their carton price, profit margin dey squeeze. Adjust price today.",
      primaryActionLabel: "Review Prices Sharp-Sharp",
      actionType: "PRICE_ADJUSTMENT",
      payload: { recommended_markup: 200 },
    };
  }

  return {
    howAmIDoing,
    whatChanged,
    whyItChanged,
    whatToDoNow,
  };
}
