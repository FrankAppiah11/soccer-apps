-- Run this SQL in your Supabase SQL Editor to create the tables.
-- Each table uses RLS (Row Level Security) so users can only access their own data.

-- 1. Game configs — persists setup preferences per user
create table if not exists public.game_configs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  competition_type text not null default '6v6',
  game_length_minutes integer not null default 20,
  equal_playtime boolean not null default true,
  sub_alerts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_game_configs_user on public.game_configs(user_id);

alter table public.game_configs enable row level security;

create policy "Users manage own configs"
  on public.game_configs for all
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 2. Players — persistent roster per user
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null default '',
  position text not null default 'CM',
  position_group text not null default 'MID',
  desired_minutes integer,
  is_injured boolean not null default false,
  is_gk boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_players_user on public.players(user_id);

alter table public.players enable row level security;

create policy "Users manage own players"
  on public.players for all
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 3. Matches — historical match records
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  competition_type text not null,
  game_length_minutes integer not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_subs integer not null default 0,
  player_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_matches_user on public.matches(user_id);

alter table public.matches enable row level security;

create policy "Users manage own matches"
  on public.matches for all
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- 4. Match events — substitution log per match
create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type text not null default 'substitution',
  minute integer not null default 0,
  second integer not null default 0,
  player_out_id text,
  player_in_id text,
  player_out_name text,
  player_in_name text,
  created_at timestamptz not null default now()
);

create index idx_match_events_match on public.match_events(match_id);

alter table public.match_events enable row level security;

create policy "Users manage own match events"
  on public.match_events for all
  using (
    match_id in (select id from public.matches where user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  )
  with check (
    match_id in (select id from public.matches where user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  );
