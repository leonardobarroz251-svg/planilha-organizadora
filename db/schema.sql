-- =========================================================
-- Cofre — schema inicial
-- Rode no SQL Editor do Supabase. Idempotente (drop + create).
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  city text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"  on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- =========================================================
-- user_preferences (1:1 com profile)
-- =========================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light','dark','sepia')),
  accent text not null default 'sage' check (accent in ('sage','clay','cobalt','plum')),
  density text not null default 'comfortable' check (density in ('compact','comfortable')),
  hide_amounts boolean not null default false,
  weekly_summary_email boolean not null default true,
  budget_alerts boolean not null default true,
  goal_milestones boolean not null default true,
  ai_insights_email boolean not null default false,
  pin_lock boolean not null default false,
  local_ai boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "prefs self read" on public.user_preferences;
create policy "prefs self read"   on public.user_preferences for select using (auth.uid() = user_id);
drop policy if exists "prefs self insert" on public.user_preferences;
create policy "prefs self insert" on public.user_preferences for insert with check (auth.uid() = user_id);
drop policy if exists "prefs self update" on public.user_preferences;
create policy "prefs self update" on public.user_preferences for update using (auth.uid() = user_id);

-- =========================================================
-- categories + subcategories
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  name text not null,
  icon text,
  color text,
  kind text not null check (kind in ('income','expense')),
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists categories_user_idx on public.categories(user_id);

alter table public.categories enable row level security;
drop policy if exists "cat self crud" on public.categories;
create policy "cat self crud" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  position int not null default 0
);

create index if not exists subcategories_category_idx on public.subcategories(category_id);

alter table public.subcategories enable row level security;
drop policy if exists "subcat via parent" on public.subcategories;
create policy "subcat via parent" on public.subcategories
  for all using (
    exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid())
  );

-- =========================================================
-- accounts (bancos / carteiras)
-- =========================================================
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text,                 -- 'nubank', 'inter', 'bb', 'xp', 'manual'
  mask text,                     -- últimos 4 dígitos
  balance numeric(14,2) not null default 0,
  sync_status text default 'manual' check (sync_status in ('synced','error','off','manual')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists accounts_user_idx on public.accounts(user_id);

alter table public.accounts enable row level security;
drop policy if exists "acc self crud" on public.accounts;
create policy "acc self crud" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- transactions
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  merchant text not null,
  amount numeric(14,2) not null,    -- negativo = despesa, positivo = receita
  occurred_at date not null,
  is_recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists tx_user_date_idx on public.transactions(user_id, occurred_at desc);
create index if not exists tx_category_idx on public.transactions(category_id);

alter table public.transactions enable row level security;
drop policy if exists "tx self crud" on public.transactions;
create policy "tx self crud" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- budgets (mês a mês, por categoria)
-- =========================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null,              -- sempre dia 01
  planned_amount numeric(14,2) not null,
  unique (user_id, category_id, month)
);

create index if not exists budgets_user_month_idx on public.budgets(user_id, month);

alter table public.budgets enable row level security;
drop policy if exists "budget self crud" on public.budgets;
create policy "budget self crud" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- goals (metas de longo prazo)
-- =========================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  target_amount numeric(14,2) not null,
  saved_amount numeric(14,2) not null default 0,
  monthly_contribution numeric(14,2) not null default 0,
  interest_rate numeric(5,2) not null default 0,    -- % ao ano
  deadline date,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
drop policy if exists "goal self crud" on public.goals;
create policy "goal self crud" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- trips + trip_items (fase 2 — tabelas criadas para evitar migração futura)
-- =========================================================
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text,
  starts_on date,
  ends_on date,
  total_budget numeric(14,2) not null default 0,
  saved_amount numeric(14,2) not null default 0,
  monthly_contribution numeric(14,2) not null default 0,
  cover_color text,
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;
drop policy if exists "trip self crud" on public.trips;
create policy "trip self crud" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  kind text not null,                              -- voo, hospedagem, etc
  description text not null,
  planned_amount numeric(14,2) not null default 0,
  actual_amount numeric(14,2),
  status text default 'planned' check (status in ('planned','reserved','purchased')),
  occurred_at date
);

alter table public.trip_items enable row level security;
drop policy if exists "trip_items via parent" on public.trip_items;
create policy "trip_items via parent" on public.trip_items
  for all using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- =========================================================
-- insights (fase 2 — gerados por IA / regras)
-- =========================================================
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('win','alert','idea')),
  icon text,
  title text not null,
  detail text,
  action_label text,
  action_href text,
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);

alter table public.insights enable row level security;
drop policy if exists "insights self crud" on public.insights;
create policy "insights self crud" on public.insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Trigger: ao criar usuário no auth, criar profile + preferences + seeds
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_cat_renda uuid;
  v_cat_moradia uuid;
  v_cat_dia uuid;
  v_cat_transporte uuid;
begin
  -- profile
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)))
  on conflict (id) do nothing;

  -- preferences
  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;

  -- conta padrão
  insert into public.accounts (user_id, name, provider, sync_status, balance)
  values (new.id, 'Conta principal', 'manual', 'manual', 0)
  returning id into v_account_id;

  -- categorias padrão
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'moradia',     'Moradia',         'home',     'oklch(0.7 0.08 145)', 'expense', 0)  returning id into v_cat_moradia;
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'transporte',  'Transporte',      'car',      'oklch(0.7 0.09 245)', 'expense', 1)  returning id into v_cat_transporte;
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'dia-a-dia',   'Dia a dia',       'coffee',   'oklch(0.72 0.09 70)', 'expense', 2)  returning id into v_cat_dia;
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'saude',       'Saúde',           'heart',    'oklch(0.68 0.12 25)', 'expense', 3);
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'lazer',       'Lazer',           'sparkles', 'oklch(0.7 0.13 320)', 'expense', 4);
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'obrigacoes',  'Obrigações',      'receipt',  'oklch(0.6 0.05 270)', 'expense', 5);
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'carro-uber',  'Carro Uber/99',   'briefcase','oklch(0.66 0.1 50)',  'expense', 6);
  insert into public.categories (user_id, slug, name, icon, color, kind, position) values
    (new.id, 'renda',       'Renda',           'wallet',   'oklch(0.62 0.13 150)','income',  7) returning id into v_cat_renda;

  -- transações de exemplo (últimos 30 dias)
  insert into public.transactions (user_id, account_id, category_id, merchant, amount, occurred_at, is_recurring) values
    (new.id, v_account_id, v_cat_renda,      'Uber',                    1840.00, current_date - interval '1 day',  false),
    (new.id, v_account_id, v_cat_renda,      '99',                       720.00, current_date - interval '2 days', false),
    (new.id, v_account_id, v_cat_renda,      'Uber',                    1620.00, current_date - interval '5 days', false),
    (new.id, v_account_id, v_cat_transporte, 'Posto Shell — gasolina',  -240.00, current_date - interval '3 days', false),
    (new.id, v_account_id, v_cat_transporte, 'Pedágio CCR',              -18.50, current_date - interval '4 days', false),
    (new.id, v_account_id, v_cat_moradia,    'Aluguel',                -1900.00, current_date - interval '8 days', true),
    (new.id, v_account_id, v_cat_moradia,    'Conta de luz',            -184.20, current_date - interval '6 days', true),
    (new.id, v_account_id, v_cat_moradia,    'Internet Vivo Fibra',     -119.90, current_date - interval '10 days', true),
    (new.id, v_account_id, v_cat_dia,        'Mercado Pão de Açúcar',   -322.40, current_date - interval '7 days',  false),
    (new.id, v_account_id, v_cat_dia,        'Padaria do bairro',        -28.60, current_date - interval '2 days', false),
    (new.id, v_account_id, v_cat_dia,        'iFood — Burger King',      -48.00, current_date - interval '9 days', false);

  -- orçamentos do mês corrente
  insert into public.budgets (user_id, category_id, month, planned_amount) values
    (new.id, v_cat_moradia,    date_trunc('month', current_date)::date, 2400.00),
    (new.id, v_cat_transporte, date_trunc('month', current_date)::date,  900.00),
    (new.id, v_cat_dia,        date_trunc('month', current_date)::date, 1200.00);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
