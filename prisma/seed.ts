// ─────────────────────────────────────────────
// Database Seed Script
// Creates initial categories, demo user, accounts, and seeds 90-day mock data
// ─────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES } from "../config/categories.config";
import { MockProvider } from "../providers/mock/mock-provider";
import { TransactionIngestionService } from "../services/transaction/ingestion.service";

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // ── 1. Seed Categories ────────────────────────
  console.log("  Creating categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isIncome: cat.isIncome,
        sortOrder: cat.sortOrder,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
        isIncome: cat.isIncome,
        sortOrder: cat.sortOrder,
      },
    });
  }
  console.log(`  ✓ ${CATEGORIES.length} categories created`);

  // ── 2. Seed Financial Institution ────────────
  const institution = await prisma.financialInstitution.upsert({
    where: { id: "inst-gtb" },
    update: {},
    create: {
      id: "inst-gtb",
      name: "Guaranty Trust Bank",
      shortName: "GTBank",
      country: "NG",
    },
  });

  // ── 3. Seed Demo User ─────────────────────────
  const email = process.env.SEED_USER_EMAIL ?? "demo@monielite.app";
  const password = process.env.SEED_USER_PASSWORD ?? "MoneyMatters2024!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      passwordHash,
      preferences: {
        create: {
          currency: "NGN",
          currencySymbol: "₦",
          timezone: "Africa/Lagos",
          theme: "dark",
        },
      },
    },
  });
  console.log(`  ✓ Demo user created: ${email}`);

  // ── 4. Seed Accounts ──────────────────────────
  const checkingAccount = await prisma.financialAccount.upsert({
    where: { id: "acct-checking-001" },
    update: {},
    create: {
      id: "acct-checking-001",
      userId: user.id,
      institutionId: institution.id,
      externalAccountId: "mock-account-gtb-001",
      name: "GTBank Current Account",
      accountType: "CHECKING",
      currency: "NGN",
      currentBalance: 0, // will be calculated from transactions
      isPrimary: true,
    },
  });

  await prisma.financialAccount.upsert({
    where: { id: "acct-savings-001" },
    update: {},
    create: {
      id: "acct-savings-001",
      userId: user.id,
      institutionId: institution.id,
      externalAccountId: "mock-account-gtb-savings",
      name: "GTBank Savings Account",
      accountType: "SAVINGS",
      currency: "NGN",
      currentBalance: 350000,
      isPrimary: false,
    },
  });

  // ── 5. Seed Provider Connection ───────────────
  await prisma.financialProviderConnection.upsert({
    where: { id: "conn-mock-001" },
    update: {},
    create: {
      id: "conn-mock-001",
      userId: user.id,
      institutionId: institution.id,
      provider: "MOCK",
      status: "ACTIVE",
    },
  });

  // ── 6. Seed Mock Transactions ─────────────────
  console.log("  Ingesting mock transactions...");

  // Clear existing transactions first (idempotent seed)
  await prisma.transaction.deleteMany({ where: { userId: user.id, source: "MOCK" } });
  await prisma.financialAccount.update({
    where: { id: checkingAccount.id },
    data: { currentBalance: 0 },
  });

  const mockProvider = new MockProvider();
  const ingestionService = new TransactionIngestionService();

  const { transactions } = await mockProvider.fetchTransactions("conn-mock-001", {
    accountId: checkingAccount.id,
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  });

  const result = await ingestionService.ingestRaw(
    transactions,
    checkingAccount.id,
    user.id,
    "MOCK"
  );

  console.log(`  ✓ Transactions: ${result.stored} stored, ${result.duplicatesSkipped} duplicates skipped, ${result.failed} failed`);
  if (result.errors.length > 0) {
    console.warn("  ⚠ Errors:", result.errors.slice(0, 3));
  }

  // ── 7. Final balance check ────────────────────
  const finalAccount = await prisma.financialAccount.findUnique({
    where: { id: checkingAccount.id },
  });
  console.log(`  ✓ Final balance: ₦${new Intl.NumberFormat("en-NG").format(finalAccount?.currentBalance ?? 0)}`);

  console.log("\n✅ Seed completed successfully!\n");
  console.log(`   Login: ${email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
