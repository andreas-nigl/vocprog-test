-- VOC public shared dataset, opt-in migration (2026-11-10).
-- Execute manually AFTER review; DOES NOT make vocprog_records public.
-- PUBLIC means ANY internet visitor with the publishable key may read and modify these records.
create table if not exists public.vocprog_public_records (
  record_id text primary key check (length(record_id) between 1 and 160),
  record_type text not null check (record_type in ('book','vocab','special','event')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);
create index if not exists vocprog_public_records_type_idx
  on public.vocprog_public_records (record_type);
alter table public.vocprog_public_records enable row level security;
revoke all on public.vocprog_public_records from public, authenticated;
grant select, insert, update on public.vocprog_public_records to anon;
-- The three policies are intentionally PUBLIC for one shared, non-private dataset.
-- Re-running the script drops and recreates THESE policies only; no table is removed.
drop policy if exists "vocprog_public_read" on public.vocprog_public_records;
create policy "vocprog_public_read"
  on public.vocprog_public_records for select to anon using (true);
drop policy if exists "vocprog_public_insert" on public.vocprog_public_records;
create policy "vocprog_public_insert"
  on public.vocprog_public_records for insert to anon with check (true);
drop policy if exists "vocprog_public_update" on public.vocprog_public_records;
create policy "vocprog_public_update"
  on public.vocprog_public_records for update to anon
  using (true) with check (true);
-- No DELETE grant/policy: app records deletions using versioned tombstones.
-- This is deliberately NOT private, NOT tamper-proof and has no per-device identity.
