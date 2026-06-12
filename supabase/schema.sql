-- ============================================================
--  PULSE — Supabase schema
--  Run this once in your Supabase project:
--  Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- One row per user holds the entire app state as JSON.
create table if not exists public.pulse_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: each user can only read/write their own row.
alter table public.pulse_state enable row level security;

drop policy if exists "own row select" on public.pulse_state;
create policy "own row select" on public.pulse_state
  for select using (auth.uid() = user_id);

drop policy if exists "own row insert" on public.pulse_state;
create policy "own row insert" on public.pulse_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "own row update" on public.pulse_state;
create policy "own row update" on public.pulse_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own row delete" on public.pulse_state;
create policy "own row delete" on public.pulse_state
  for delete using (auth.uid() = user_id);
