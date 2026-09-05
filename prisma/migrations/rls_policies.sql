-- ─────────────────────────────────────────────
-- Monie Lite — PostgreSQL Row Level Security (RLS) Policies
-- Enforced directly in Supabase PostgreSQL
-- ─────────────────────────────────────────────

-- 1. Enable RLS on user-scoped tables
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "UserPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "FinancialAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RecurringTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Insight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "FinancialProviderConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TransactionImport" ENABLE ROW LEVEL SECURITY;

-- 2. User Table Policies
CREATE POLICY "Users can view and edit their own record"
  ON "User"
  FOR ALL
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- 3. UserPreference Table Policies
CREATE POLICY "Users can view and edit their own preferences"
  ON "UserPreference"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 4. FinancialAccount Table Policies
CREATE POLICY "Users can view and manage their own financial accounts"
  ON "FinancialAccount"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 5. Transaction Table Policies (Strict Financial Isolation)
CREATE POLICY "Users can only read their own transactions"
  ON "Transaction"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can only insert transactions into their own account"
  ON "Transaction"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can only update their own transactions (notes, categories)"
  ON "Transaction"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 6. RecurringTransaction Table Policies
CREATE POLICY "Users can view and manage their own recurring transactions"
  ON "RecurringTransaction"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 7. Insight Table Policies
CREATE POLICY "Users can view and update their own insights"
  ON "Insight"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 8. Provider Connection & Import Policies
CREATE POLICY "Users can view and manage their own provider connections"
  ON "FinancialProviderConnection"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can view and manage their own imports"
  ON "TransactionImport"
  FOR ALL
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 9. Service Role Bypass
-- When Prisma connects with service_role privileges or direct DB connection, RLS is bypassed automatically by PostgreSQL.
