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


-- ============================================================
--  Global, admin-curated leaderboard.
--  Everyone signed in can READ. Only the admin email can WRITE.
--  >>> Change the admin email below to your own if needed. <<<
-- ============================================================
create table if not exists public.leaderboard (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  avatar_color    text default '#22e3ff',
  weight_lost     numeric default 0,
  streak          int default 0,
  weekly_workouts int default 0,
  note            text,
  updated_at      timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

-- Anyone signed in can read the leaderboard.
drop policy if exists "lb read" on public.leaderboard;
create policy "lb read" on public.leaderboard
  for select using (auth.role() = 'authenticated');

-- Only the admin can insert / update / delete.
drop policy if exists "lb admin insert" on public.leaderboard;
create policy "lb admin insert" on public.leaderboard
  for insert with check (auth.jwt() ->> 'email' = 'dilli.prasath0201@gmail.com');

drop policy if exists "lb admin update" on public.leaderboard;
create policy "lb admin update" on public.leaderboard
  for update using (auth.jwt() ->> 'email' = 'dilli.prasath0201@gmail.com')
  with check (auth.jwt() ->> 'email' = 'dilli.prasath0201@gmail.com');

drop policy if exists "lb admin delete" on public.leaderboard;
create policy "lb admin delete" on public.leaderboard
  for delete using (auth.jwt() ->> 'email' = 'dilli.prasath0201@gmail.com');
