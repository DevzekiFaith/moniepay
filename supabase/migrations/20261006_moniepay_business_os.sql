-- ─────────────────────────────────────────────────────────────────
-- MoniePay — PostgreSQL Schema for Supabase
-- Business Decision Intelligence Platform for Nigeria's Informal Economy
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  phone text,
  role text default 'business_owner',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. BUSINESSES
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  trade_type text default 'retail_provisions', -- retail_provisions, boutique, food_canteen, electronics, pos_agency, artisan, pharmacy, services
  currency text default 'NGN',
  daily_sales_target numeric default 50000,
  operating_city text default 'Lagos',
  market_location text default 'Balogun Market',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ACCOUNTS (Cash Drawer, POS terminals, Bank accounts, Wallets)
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null, -- e.g. "Cash at Hand / Drawer", "OPay POS", "Moniepoint Terminal", "GTBank Business", "PalmPay"
  account_type text not null check (account_type in ('CASH', 'POS', 'BANK', 'WALLET')),
  current_balance numeric default 0,
  is_primary boolean default false,
  account_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. CUSTOMERS (Informal CRM & Credit trust tracking)
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  phone text,
  trust_rating text default 'FAIR' check (trust_rating in ('GOOD', 'FAIR', 'RISKY')),
  total_credit_taken numeric default 0,
  total_credit_paid numeric default 0,
  current_debt_balance numeric default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. TRANSACTIONS (Core captured business activity with client idempotency)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  client_tx_id text unique not null, -- idempotent sync key from mobile client
  business_id uuid references public.businesses(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in (
    'SALE',               -- Money in: product or service sale
    'EXPENSE',            -- Operational cost: fuel/gen, shop rent, transport, levy, security
    'STOCK_PURCHASE',     -- Restocking goods/materials
    'STAFF_PAYMENT',      -- Wages paid to shop assistants / apprentices
    'OWNER_WITHDRAWAL',   -- "Chop money", personal expense, family support
    'DEBT_COLLECTION',    -- Customer paying back money owed
    'SUPPLIER_PAYMENT'    -- Paying supplier for goods previously bought
  )),
  amount numeric not null check (amount > 0),
  payment_method text not null check (payment_method in ('CASH', 'TRANSFER', 'POS', 'CREDIT')),
  category text not null, -- e.g. "Goods Sold", "Shop Gen Fuel", "Restock Provisions", "Shop Boy Wage", "Home Feeding"
  description text,
  customer_id uuid references public.customers(id) on delete set null,
  debt_id uuid,
  is_reconciled boolean default true,
  metadata jsonb default '{}'::jsonb,
  transaction_date timestamptz default now(),
  created_at timestamptz default now()
);

-- 6. DEBTS (Customer credit & Supplier credit book)
create table if not exists public.debts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  debt_type text not null check (debt_type in ('CUSTOMER_CREDIT', 'SUPPLIER_OBLIGATION')),
  person_name text not null,
  phone text,
  customer_id uuid references public.customers(id) on delete set null,
  original_amount numeric not null check (original_amount > 0),
  amount_paid numeric default 0,
  balance_due numeric not null,
  due_date date,
  status text default 'PENDING' check (status in ('PENDING', 'PARTIAL', 'SETTLED', 'OVERDUE')),
  last_reminder_sent_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. RECOMMENDATIONS (Decision Intelligence layer outputs)
create table if not exists public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  priority_rank int default 1,
  action_type text not null check (action_type in (
    'COLLECT_DEBT',
    'SAFE_WITHDRAWAL',
    'PRICE_ADJUSTMENT',
    'REDUCE_STOCK_ORDER',
    'FUEL_ALERT',
    'SUPPLIER_DUE',
    'MARGIN_ALERT',
    'GENERAL'
  )),
  title text not null,
  description text not null,
  impact_summary text not null,
  action_payload jsonb default '{}'::jsonb, -- e.g. { customer_id, phone, suggested_text, safe_amount, debt_id }
  status text default 'ACTIVE' check (status in ('ACTIVE', 'DISMISSED', 'COMPLETED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. BUSINESS_EVENTS (Tracking outcomes and continuous learning)
create table if not exists public.business_events (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  event_type text not null, -- 'RECOMMENDATION_ACTIONED', 'DEBT_REMINDER_SENT', 'OFFLINE_SYNC_COMPLETED', 'WITHDRAWAL_LOGGED'
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
-- INDEXES FOR INSTANT QUERY PERFORMANCE
-- ─────────────────────────────────────────────────────────────────
create index if not exists idx_transactions_business_date on public.transactions (business_id, transaction_date desc);
create index if not exists idx_transactions_client_tx on public.transactions (client_tx_id);
create index if not exists idx_transactions_type on public.transactions (business_id, type);
create index if not exists idx_debts_business_status on public.debts (business_id, status);
create index if not exists idx_accounts_business on public.accounts (business_id);
create index if not exists idx_recommendations_business_active on public.recommendations (business_id, status, priority_rank);
create index if not exists idx_customers_business on public.customers (business_id);

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.accounts enable row level security;
alter table public.customers enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.recommendations enable row level security;
alter table public.business_events enable row level security;

-- Policies: Owners can only see and manipulate their own business data
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Owners manage own business" on public.businesses
  for all using (auth.uid() = owner_id);

create policy "Owners manage accounts" on public.accounts
  for all using (
    exists (select 1 from public.businesses where businesses.id = accounts.business_id and businesses.owner_id = auth.uid())
  );

create policy "Owners manage customers" on public.customers
  for all using (
    exists (select 1 from public.businesses where businesses.id = customers.business_id and businesses.owner_id = auth.uid())
  );

create policy "Owners manage transactions" on public.transactions
  for all using (
    exists (select 1 from public.businesses where businesses.id = transactions.business_id and businesses.owner_id = auth.uid())
  );

create policy "Owners manage debts" on public.debts
  for all using (
    exists (select 1 from public.businesses where businesses.id = debts.business_id and businesses.owner_id = auth.uid())
  );

create policy "Owners manage recommendations" on public.recommendations
  for all using (
    exists (select 1 from public.businesses where businesses.id = recommendations.business_id and businesses.owner_id = auth.uid())
  );

create policy "Owners manage business_events" on public.business_events
  for all using (
    exists (select 1 from public.businesses where businesses.id = business_events.business_id and businesses.owner_id = auth.uid())
  );
