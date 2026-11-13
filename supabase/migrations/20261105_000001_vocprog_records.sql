-- vocprog | 2026-11-05 | Version 0.2 staging
-- REVIEW BEFORE RUNNING. Does not delete or modify existing tables.
create table if not exists public.vocprog_records (
  owner_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null check (length(record_id) between 1 and 160),
  record_type text not null check (record_type in ('book','vocab','special','event')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (owner_id, record_id)
);
create index if not exists vocprog_records_owner_type_idx
  on public.vocprog_records (owner_id, record_type);
alter table public.vocprog_records enable row level security;
revoke all on public.vocprog_records from anon;
grant select, insert, update, delete on public.vocprog_records to authenticated;
drop policy if exists "vocprog_select_own" on public.vocprog_records;
create policy "vocprog_select_own" on public.vocprog_records for select to authenticated
  using (owner_id = (select auth.uid()));
drop policy if exists "vocprog_insert_own" on public.vocprog_records;
create policy "vocprog_insert_own" on public.vocprog_records for insert to authenticated
  with check (owner_id = (select auth.uid()));
drop policy if exists "vocprog_update_own" on public.vocprog_records;
create policy "vocprog_update_own" on public.vocprog_records for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "vocprog_delete_own" on public.vocprog_records;
create policy "vocprog_delete_own" on public.vocprog_records for delete to authenticated
  using (owner_id = (select auth.uid()));
-- The shared family account uses profiles inside payload. All profiles in the same account
-- are intentionally accessible to that account. Separate Supabase users are isolated by RLS.
