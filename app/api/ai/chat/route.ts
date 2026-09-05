// ─────────────────────────────────────────────
// Monie AI — Conversational Financial Intelligence API
// Connects live ledger & AnalyticsService to Gemini/OpenAI
// with deterministic offline financial NLP fallback
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsService } from "@/services/analytics/analytics.service";
import { formatNaira } from "@/lib/utils";
import type { Transaction } from "@/types/transaction.types";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userMessage: string = (body.message || "").trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = session.user.id;
    const analytics = new AnalyticsService();

    // 1. Fetch live financial records
    const [accounts, dbTransactions, recurringTxs] = await Promise.all([
      prisma.financialAccount.findMany({
        where: { userId },
        orderBy: { isPrimary: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true, merchant: true, account: true },
        orderBy: { transactionDate: "desc" },
        take: 100,
      }),
      prisma.recurringTransaction.findMany({
        where: { userId, isActive: true },
        include: { category: true },
      }),
    ]);

    const totalBalance = accounts.reduce(
      (sum, a) => sum + (a.currentBalance || 0),
      0
    );

    // Map to AnalyticsService transaction type
    const transactions: Transaction[] = dbTransactions.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      accountId: tx.accountId,
      externalTransactionId: tx.externalTransactionId,
      amount: tx.amount,
      currency: tx.currency,
      transactionDate: tx.transactionDate,
      postedDate: tx.postedDate,
      description: tx.description,
      merchantName: tx.merchantName,
      normalizedMerchantName: tx.normalizedMerchantName,
      transactionType: tx.transactionType as any,
      status: tx.status as any,
      categoryId: tx.categoryId,
      source: tx.source as any,
      isTransfer: tx.isTransfer,
      isRecurring: tx.isRecurring,
      category: tx.category
        ? {
            id: tx.category.id,
            name: tx.category.name,
            slug: tx.category.slug,
            icon: tx.category.icon,
            color: tx.category.color,
            isIncome: tx.category.isIncome,
          }
        : null,
      account: tx.account
        ? {
            id: tx.account.id,
            name: tx.account.name,
            accountType: tx.account.accountType,
            mask: tx.account.mask,
          }
        : null,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));

    // 2. Compute live metrics across periods
    const todayRange = analytics.resolveDateRange("today");
    const weekRange = analytics.resolveDateRange("this_week");
    const monthRange = analytics.resolveDateRange("this_month");

    const todaySummary = analytics.calculateBalanceSummary(transactions, totalBalance, "today", todayRange);
    const weekSummary = analytics.calculateBalanceSummary(transactions, totalBalance, "this_week", weekRange);
    const monthSummary = analytics.calculateBalanceSummary(transactions, totalBalance, "this_month", monthRange);

    const weekCategories = analytics.calculateCategoryBreakdown(transactions, weekRange);
    const monthCategories = analytics.calculateCategoryBreakdown(transactions, monthRange);
    const monthMerchants = analytics.calculateTopMerchants(transactions, monthRange, 6);

    // Context snapshot for the AI
    const financialContext = {
      user: {
        name: session.user.name || "User",
        email: session.user.email,
        totalBalanceFormatted: formatNaira(totalBalance),
        accounts: accounts.map((a) => ({
          name: a.name,
          balance: formatNaira(a.currentBalance || 0),
          mask: a.mask,
        })),
      },
      today: {
        income: formatNaira(todaySummary.totalIn),
        spent: formatNaira(todaySummary.totalOut),
        net: formatNaira(todaySummary.netMovement),
      },
      thisWeek: {
        income: formatNaira(weekSummary.totalIn),
        spent: formatNaira(weekSummary.totalOut),
        net: formatNaira(weekSummary.netMovement),
        categories: weekCategories.map((c) => ({
          name: c.categoryName,
          amount: formatNaira(c.amount),
          percentage: `${Math.round(c.percentage)}%`,
        })),
      },
      thisMonth: {
        income: formatNaira(monthSummary.totalIn),
        spent: formatNaira(monthSummary.totalOut),
        net: formatNaira(monthSummary.netMovement),
        categories: monthCategories.map((c) => ({
          name: c.categoryName,
          amount: formatNaira(c.amount),
          percentage: `${Math.round(c.percentage)}%`,
        })),
        topMerchants: monthMerchants.map((m) => ({
          merchant: m.normalizedName || m.merchantName,
          amount: formatNaira(m.amount),
        })),
      },
      recurringBills: recurringTxs.map((r) => ({
        name: r.name,
        amount: formatNaira(r.amount),
        frequency: r.frequency,
        nextDate: r.nextExpectedDate?.toLocaleDateString("en-NG") || "Scheduled",
      })),
      recentTransactions: transactions.slice(0, 10).map((tx) => ({
        date: tx.transactionDate.toISOString().split("T")[0],
        description: tx.normalizedMerchantName || tx.merchantName || tx.description,
        type: tx.transactionType,
        amount: formatNaira(tx.amount),
        category: tx.category?.name || "Other",
      })),
    };

    // 3. Try Gemini API first if configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiReply = await callGemini(userMessage, history, financialContext);
        if (geminiReply) {
          return NextResponse.json({ reply: geminiReply, provider: "gemini" });
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local engine:", err);
      }
    }

    // 4. Try OpenAI API if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const openAiReply = await callOpenAI(userMessage, history, financialContext);
        if (openAiReply) {
          return NextResponse.json({ reply: openAiReply, provider: "openai" });
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to local engine:", err);
      }
    }

    // 5. Intelligent Deterministic Financial Intent Engine (Zero setup fallback)
    const localReply = evaluateFinancialQuery(userMessage, financialContext, transactions);
    return NextResponse.json({ reply: localReply, provider: "monie-engine" });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json(
      { error: "Failed to process conversational query" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// Gemini API Integration
// ─────────────────────────────────────────────
async function callGemini(userMessage: string, history: ChatMessage[], context: any): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemInstruction = `You are Monie AI, an elite, concise, and friendly personal money intelligence assistant for MoniePay.
You have direct access to the user's live financial data snapshot:
${JSON.stringify(context, null, 2)}

Guidelines:
1. Always state numbers clearly using Nigerian Naira (₦) with appropriate commas.
2. Be concise, direct, and conversational. Give the bottom-line answer in the first sentence.
3. If asked about a category (like Food, Transport, Utilities), check both this week and this month in the data.
4. If asked about recurring payments or bills, summarize the upcoming scheduled debits.
5. If asked if they are spending faster than earning, compare income vs expenses and give an objective answer.
6. Use clean Markdown bullet points when listing items. Keep responses under 4 paragraphs.`;

  const contents = [
    ...history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return candidate || null;
}

// ─────────────────────────────────────────────
// OpenAI API Integration
// ─────────────────────────────────────────────
async function callOpenAI(userMessage: string, history: ChatMessage[], context: any): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are Monie AI, an elite, concise, and friendly personal money intelligence assistant for MoniePay.
User Financial Ledger:
${JSON.stringify(context, null, 2)}
Respond accurately with Nigerian Naira (₦). Keep answers focused, natural, and helpful.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

// ─────────────────────────────────────────────
// Deterministic Financial Query Engine (Fallback)
// ─────────────────────────────────────────────
function evaluateFinancialQuery(
  query: string,
  ctx: any,
  transactions: Transaction[]
): string {
  const q = query.toLowerCase();

  // 1. Balance Queries
  if (
    q.includes("balance") ||
    q.includes("how much do i have") ||
    q.includes("available money") ||
    q.includes("my funds")
  ) {
    const accountsList = ctx.user.accounts
      .map((a: any) => `• **${a.name}**: ${a.balance}`)
      .join("\n");

    return `Your total verified balance is **${ctx.user.totalBalanceFormatted}** across **${ctx.user.accounts.length}** connected account(s):\n\n${accountsList}\n\n*All balances are synchronized live with Open Banking.*`;
  }

  // 2. Specific Category Query (e.g. "food", "transportation", "uber", "dining", "groceries")
  const categoryKeywords: Record<string, string[]> = {
    "Food & Dining": ["food", "dining", "restaurant", "chowdeck", "eat", "groceries", "supermarket", "shoprite"],
    Transportation: ["transport", "transportation", "uber", "bolt", "ride", "fuel", "gas", "totalenergies"],
    "Bills & Utilities": ["bills", "utility", "utilities", "electricity", "ikedc", "airtime", "mtn", "data"],
    Entertainment: ["entertainment", "netflix", "spotify", "movie", "show"],
    Shopping: ["shopping", "clothes", "store", "gadget", "amazon"],
  };

  for (const [catName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => q.includes(k))) {
      // Check if user specified "this week" vs "this month"
      const isWeek = q.includes("week");
      const categoryData = (isWeek ? ctx.thisWeek.categories : ctx.thisMonth.categories).find(
        (c: any) => c.name.toLowerCase() === catName.toLowerCase()
      );

      const periodStr = isWeek ? "this week" : "this month";

      if (categoryData) {
        return `You've spent **${categoryData.amount}** on **${catName}** ${periodStr} (${categoryData.percentage} of your total spending).\n\nNeed to see recent transactions for this category? You can review them anytime under **Activity**.`;
      } else {
        return `You have **₦0** in recorded spending for **${catName}** ${periodStr}. Good job keeping this category at zero!`;
      }
    }
  }

  // 3. Inflow / Income Queries
  if (
    q.includes("income") ||
    q.includes("how much came in") ||
    q.includes("received") ||
    q.includes("inflow") ||
    q.includes("salary")
  ) {
    return `Here is your income overview:\n\n• **This Month**: You received **${ctx.thisMonth.income}** in verified credits.\n• **This Week**: **${ctx.thisWeek.income}** received.\n• **Today**: **${ctx.today.income}** received.\n\nYour primary inflow channels are verified through Open Banking.`;
  }

  // 4. Outflow / Spending Queries
  if (
    q.includes("spent") ||
    q.includes("spending") ||
    q.includes("outflow") ||
    q.includes("how much did i spend")
  ) {
    const isWeek = q.includes("week");
    const isToday = q.includes("today");

    if (isToday) {
      return `Today, you have spent **${ctx.today.spent}** across all connected accounts.`;
    }

    if (isWeek) {
      const topWeekCats = ctx.thisWeek.categories.slice(0, 3).map((c: any) => `• **${c.name}**: ${c.amount} (${c.percentage})`).join("\n");
      return `You have spent **${ctx.thisWeek.spent}** so far this week.\n\nTop categories this week:\n${topWeekCats || "• No major category debits recorded."}`;
    }

    const topMonthCats = ctx.thisMonth.categories.slice(0, 3).map((c: any) => `• **${c.name}**: ${c.amount} (${c.percentage})`).join("\n");
    return `Your total spending this month is **${ctx.thisMonth.spent}**.\n\nTop expense categories:\n${topMonthCats || "• No major category debits recorded."}`;
  }

  // 5. Largest Expense / Big Purchases
  if (
    q.includes("biggest") ||
    q.includes("largest") ||
    q.includes("highest") ||
    q.includes("most expensive")
  ) {
    const expenses = transactions
      .filter((t) => t.transactionType === "EXPENSE" && !t.isTransfer)
      .sort((a, b) => b.amount - a.amount);

    if (expenses.length > 0) {
      const top = expenses[0];
      const name = top.normalizedMerchantName || top.merchantName || top.description;
      return `Your largest single expense is **${formatNaira(top.amount)}** with **${name}** recorded on ${top.transactionDate.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}.\n\nIt accounted for one of your notable debits this cycle.`;
    }
    return `No large individual expenses were flagged on your active ledger.`;
  }

  // 6. Velocity / Cashflow Warning
  if (
    q.includes("faster") ||
    q.includes("burn rate") ||
    q.includes("velocity") ||
    q.includes("cashflow") ||
    q.includes("saving") ||
    q.includes("net")
  ) {
    const net = ctx.thisMonth.net;
    const isPositive = !net.includes("-");

    if (isPositive) {
      return `You're currently in positive cashflow! You have preserved a net surplus of **${net}** this month (${ctx.thisMonth.income} in vs ${ctx.thisMonth.spent} out).\n\nYour spending velocity is well below your income rate.`;
    } else {
      return `⚠️ **Heads up on spending velocity**: You have spent **${ctx.thisMonth.spent}** against an inflow of **${ctx.thisMonth.income}**, giving a net outflow of **${net}**.\n\nYou are spending faster than your incoming credits this month. Consider slowing down discretionary debits.`;
    }
  }

  // 7. Recurring Bills & Subscriptions
  if (
    q.includes("recurring") ||
    q.includes("subscription") ||
    q.includes("bills due") ||
    q.includes("carry")
  ) {
    if (ctx.recurringBills.length > 0) {
      const billsList = ctx.recurringBills
        .map((r: any) => `• **${r.name}**: ${r.amount} (${r.frequency.toLowerCase()}, due ~${r.nextDate})`)
        .join("\n");

      return `You have **${ctx.recurringBills.length}** tracked recurring payments carrying on your ledger:\n\n${billsList}\n\n*These are automatically detected from your transaction cadence.*`;
    }
    return `You currently have no active recurring commitments flagged on your accounts.`;
  }

  // 8. Top Merchants
  if (
    q.includes("merchant") ||
    q.includes("where do i spend") ||
    q.includes("where is most of my money going")
  ) {
    if (ctx.thisMonth.topMerchants.length > 0) {
      const merchantsList = ctx.thisMonth.topMerchants
        .map((m: any) => `• **${m.merchant}**: ${m.amount}`)
        .join("\n");

      return `Most of your debits this month went to these merchants:\n\n${merchantsList}\n\nYour primary spending concentration is with **${ctx.thisMonth.topMerchants[0].merchant}**.`;
    }
  }

  // 9. Default Summary
  return `Here is your current **MoniePay Financial Snapshot**:\n\n• **Available Balance**: ${ctx.user.totalBalanceFormatted}\n• **This Month's Inflows**: +${ctx.thisMonth.income}\n• **This Month's Outflows**: -${ctx.thisMonth.spent}\n• **Net Position**: ${ctx.thisMonth.net}\n• **Top Category**: ${ctx.thisMonth.categories[0]?.name || "None"} (${ctx.thisMonth.categories[0]?.amount || "₦0"})\n\nFeel free to ask specific questions like *"How much did I spend on food this week?"* or *"What recurring payments am I carrying?"*!`;
}
