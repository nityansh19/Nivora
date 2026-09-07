create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspace_snapshots enable row level security;

create policy "Users can read their own workspace"
on public.workspace_snapshots
for select
using (auth.uid() = user_id);

create policy "Users can insert their own workspace"
on public.workspace_snapshots
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own workspace"
on public.workspace_snapshots
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own workspace"
on public.workspace_snapshots
for delete
using (auth.uid() = user_id);

create index if not exists workspace_snapshots_updated_at_idx
on public.workspace_snapshots(updated_at desc);
