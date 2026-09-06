-- Nivora Phase 14 core schema
-- Run in Supabase SQL editor after enabling email/password Auth.
-- Every application row is owned by auth.uid(); RLS is mandatory before production use.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  currency text not null default 'INR',
  monthly_income numeric not null default 0 check (monthly_income >= 0),
  monthly_budget numeric not null default 0 check (monthly_budget >= 0),
  savings_target numeric not null default 0 check (savings_target >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  opening_balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('expense','income')),
  amount numeric not null check (amount > 0),
  category text not null,
  date date not null,
  note text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists accounts_user_idx on public.accounts(user_id);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

create policy "profiles own row" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "accounts own rows" on public.accounts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions own rows" on public.transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
