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

-- ------------------------------------------------------------
--  Teammate data sharing.
--  A group teammate may READ another member's pulse_state row, but ONLY when
--  that member has turned sharing on (data->sharing->enabled = true). Which
--  individual pages are visible is then filtered client-side from
--  data->sharing->pages. This policy is additive (OR) to "own row select".
-- ------------------------------------------------------------
-- True when the signed-in user and `other` are both members of some common group.
create or replace function public.shares_group(other uuid)
  returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;
grant execute on function public.shares_group(uuid) to authenticated;

drop policy if exists "shared row select" on public.pulse_state;
create policy "shared row select" on public.pulse_state
  for select using (
    coalesce((data -> 'sharing' ->> 'enabled')::boolean, false) = true
    and public.shares_group(user_id)
  );


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


-- ============================================================
--  Groups / teams with invite codes.
--  Members can read their groups and fellow members' published stats.
-- ============================================================
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id        uuid not null references public.groups (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text,
  color           text default '#22e3ff',
  weight_lost     numeric default 0,
  streak          int default 0,
  weekly_workouts int default 0,
  updated_at      timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Avoids RLS recursion when checking membership.
create or replace function public.is_group_member(gid uuid)
  returns boolean language sql security definer stable as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid());
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

drop policy if exists "groups read" on public.groups;
create policy "groups read" on public.groups
  for select using (owner_id = auth.uid() or public.is_group_member(id));
drop policy if exists "groups insert" on public.groups;
create policy "groups insert" on public.groups
  for insert with check (owner_id = auth.uid());
drop policy if exists "groups delete" on public.groups;
create policy "groups delete" on public.groups
  for delete using (owner_id = auth.uid());

drop policy if exists "gm read" on public.group_members;
create policy "gm read" on public.group_members
  for select using (public.is_group_member(group_id));
drop policy if exists "gm insert" on public.group_members;
create policy "gm insert" on public.group_members
  for insert with check (user_id = auth.uid());
drop policy if exists "gm update" on public.group_members;
create policy "gm update" on public.group_members
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "gm delete" on public.group_members;
create policy "gm delete" on public.group_members
  for delete using (user_id = auth.uid());

-- Join a group by its invite code (resolves code -> id and adds you).
create or replace function public.join_group(p_code text, p_name text, p_color text)
  returns uuid language plpgsql security definer as $$
declare gid uuid;
begin
  select id into gid from public.groups where invite_code = p_code;
  if gid is null then return null; end if;
  insert into public.group_members (group_id, user_id, name, color)
    values (gid, auth.uid(), p_name, p_color)
    on conflict (group_id, user_id) do update set name = excluded.name, color = excluded.color;
  return gid;
end; $$;
grant execute on function public.join_group(text, text, text) to authenticated;
