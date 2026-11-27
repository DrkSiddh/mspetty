-- =====================================================================
-- PETTY RUN (3D) LEADERBOARD
-- Project: abstractia-today (ref xtkdnyqjheewsqnvugaj), schema: mspetty
-- Paste into the SQL editor of THAT project. Safe to re-run.
--
-- After running: Supabase Dashboard -> Integrations -> Data API ->
-- Exposed Schemas must include "mspetty" (SQL cannot do that step).
-- (On 2026-11-25 mspetty already answered on the Data API, so it is
--  probably exposed already. Check it anyway.)
--
-- Writes: only through mspetty.submit_petty_run_3d (security definer).
-- Reads:  only through the board / rank functions. No direct table access.
-- Negative scores are valid. EGO DEATH runs are real runs.
-- =====================================================================

create schema if not exists mspetty;
create extension if not exists pgcrypto;

create table if not exists mspetty.petty_run_3d (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  hater_name            text not null check (char_length(hater_name) between 1 and 20),
  wallet                text null check (wallet is null or wallet ~* '^0x[0-9a-f]{40}$'),
  ens                   text null check (ens is null or char_length(ens) <= 120),
  ship_id               text not null check (ship_id in ('aurora-voyager','harvest-moon-glider','plasmatic-glider','star-drift','sleigh-genesis','beast-mobile')),
  mode                  text not null check (mode in ('speed','infinite')),
  score                 int  not null check (score >= -2000),
  lolz                  int  not null default 0 check (lolz >= 0),
  value_extracted       int  not null default 0 check (value_extracted >= 0),
  balloons              int  not null default 0 check (balloons >= 0),
  catches               int  not null default 0 check (catches >= 0),
  poison                int  not null default 0 check (poison >= 0),
  fumbles               int  not null default 0 check (fumbles >= 0),
  biggest_fumble_emoji  text null check (biggest_fumble_emoji is null or char_length(biggest_fumble_emoji) <= 16),
  biggest_fumble_name   text null check (biggest_fumble_name is null or char_length(biggest_fumble_name) <= 40),
  biggest_fumble_value  int  null,
  best_chain            int  not null default 0 check (best_chain >= 0),
  worst_chain           int  not null default 0 check (worst_chain >= 0),
  level_reached         text null check (level_reached is null or char_length(level_reached) <= 24),
  duration_s            int  not null check (duration_s >= 5),
  ended                 text not null check (ended in ('time','ego_death','quit')),
  weapon_token          int  null,
  holds_ship            boolean not null default false,
  item_counts           jsonb not null default '{}'::jsonb,
  roast                 text null check (roast is null or char_length(roast) <= 300),
  rate_key              text not null
);

create index if not exists petty_run_3d_created_idx  on mspetty.petty_run_3d (created_at desc);
create index if not exists petty_run_3d_score_idx    on mspetty.petty_run_3d (score desc, created_at);
create index if not exists petty_run_3d_ship_idx     on mspetty.petty_run_3d (ship_id, score desc);
create index if not exists petty_run_3d_lolz_idx     on mspetty.petty_run_3d (lolz desc, created_at);
create index if not exists petty_run_3d_rate_idx     on mspetty.petty_run_3d (rate_key, created_at desc);

-- RLS on, no policies: anon and authenticated cannot read or write the table directly.
alter table mspetty.petty_run_3d enable row level security;
revoke all on mspetty.petty_run_3d from anon, authenticated;

-- ---------------------------------------------------------------------
-- INSERT: the only write path
-- ---------------------------------------------------------------------
create or replace function mspetty.submit_petty_run_3d(
  p_hater_name text, p_wallet text, p_ens text, p_ship_id text, p_mode text,
  p_score int, p_lolz int, p_value_extracted int, p_balloons int, p_catches int,
  p_poison int, p_fumbles int,
  p_biggest_fumble_emoji text, p_biggest_fumble_name text, p_biggest_fumble_value int,
  p_best_chain int, p_worst_chain int, p_level_reached text, p_duration_s int, p_ended text,
  p_weapon_token int, p_holds_ship boolean, p_item_counts jsonb, p_roast text
) returns uuid
language plpgsql
security definer
set search_path = mspetty, pg_temp
as $$
declare
  v_name    text := btrim(coalesce(p_hater_name, ''));
  v_wallet  text := case when p_wallet ~* '^0x[0-9a-f]{40}$' then lower(p_wallet) else null end;
  v_key     text;
  v_ceiling bigint;
  v_id      uuid;
begin
  if char_length(v_name) < 1 or char_length(v_name) > 20 then
    raise exception 'hater_name must be 1 to 20 characters' using errcode = '22023';
  end if;
  if p_duration_s is null or p_duration_s < 5 then
    raise exception 'run shorter than 5 seconds' using errcode = '22023';
  end if;
  if p_score is null or p_score < -2000 then
    raise exception 'score below -2000' using errcode = '22023';
  end if;
  -- Plausible ceiling for the duration. Outside DRAGON the biggest catch is the
  -- 108-point Skeleton Key and balloons arrive about once a second, so 150/s is
  -- generous. DRAGON starts at 8888 and its One Shot is worth 888, so once a run
  -- could have reached it (60s+), allow 900/s on top of 8888.
  v_ceiling := greatest(250 + p_duration_s::bigint * 150,
                        case when p_duration_s >= 60 then 8888 + (p_duration_s::bigint - 60) * 900 else 0 end);
  if p_score > v_ceiling then
    raise exception 'score not plausible for the run duration' using errcode = '22023';
  end if;
  if p_item_counts is not null and pg_column_size(p_item_counts) > 4096 then
    raise exception 'item_counts too large' using errcode = '22023';
  end if;

  -- basic rate limit: one run per 10 seconds per wallet, or per name without a wallet
  v_key := coalesce(v_wallet, lower(v_name));
  if exists (select 1 from mspetty.petty_run_3d
             where rate_key = v_key and created_at > now() - interval '10 seconds') then
    raise exception 'one run per 10 seconds' using errcode = '22023';
  end if;

  insert into mspetty.petty_run_3d (
    hater_name, wallet, ens, ship_id, mode, score, lolz, value_extracted, balloons, catches,
    poison, fumbles, biggest_fumble_emoji, biggest_fumble_name, biggest_fumble_value,
    best_chain, worst_chain, level_reached, duration_s, ended, weapon_token, holds_ship,
    item_counts, roast, rate_key
  ) values (
    v_name, v_wallet, nullif(left(btrim(coalesce(p_ens, '')), 120), ''), p_ship_id, p_mode, p_score,
    greatest(coalesce(p_lolz, 0), 0), greatest(coalesce(p_value_extracted, 0), 0),
    greatest(coalesce(p_balloons, 0), 0), greatest(coalesce(p_catches, 0), 0),
    greatest(coalesce(p_poison, 0), 0), greatest(coalesce(p_fumbles, 0), 0),
    left(p_biggest_fumble_emoji, 16), left(p_biggest_fumble_name, 40), p_biggest_fumble_value,
    greatest(coalesce(p_best_chain, 0), 0), greatest(coalesce(p_worst_chain, 0), 0),
    left(p_level_reached, 24), p_duration_s, p_ended, p_weapon_token, coalesce(p_holds_ship, false),
    coalesce(p_item_counts, '{}'::jsonb), left(p_roast, 300), v_key
  ) returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- READ: four boards, top 20 each. Wallets are never returned.
--   p_board: 'today' | 'all_time' | 'ship' | 'fumbles'  ("today" = UTC day)
-- ---------------------------------------------------------------------
create or replace function mspetty.petty_run_3d_board(p_board text, p_ship_id text default null)
returns table (
  rank bigint, id uuid, hater_name text, ens text, ship_id text, mode text,
  score int, lolz int, fumbles int, holds_ship boolean, ended text, created_at timestamptz
)
language sql
stable
security definer
set search_path = mspetty, pg_temp
as $$
  select row_number() over (order by case when p_board = 'fumbles' then r.lolz else r.score end desc, r.created_at asc) as rank,
         r.id, r.hater_name, r.ens, r.ship_id, r.mode, r.score, r.lolz, r.fumbles, r.holds_ship, r.ended, r.created_at
  from mspetty.petty_run_3d r
  where (p_board <> 'today' or r.created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc')
    and (p_board <> 'ship'  or r.ship_id = p_ship_id)
  order by 1
  limit 20;
$$;

-- "my rank" for one run on every board (ship board = the ship that run flew).
create or replace function mspetty.petty_run_3d_my_rank(p_id uuid, p_ship_id text default null)
returns table (today bigint, all_time bigint, ship bigint, fumbles bigint)
language sql
stable
security definer
set search_path = mspetty, pg_temp
as $$
  with me as (select * from mspetty.petty_run_3d where id = p_id),
  day0 as (select date_trunc('day', now() at time zone 'utc') at time zone 'utc' as d)
  select
    (select count(*) + 1 from mspetty.petty_run_3d r, day0
      where r.created_at >= day0.d and (r.score > me.score or (r.score = me.score and r.created_at < me.created_at))),
    (select count(*) + 1 from mspetty.petty_run_3d r
      where r.score > me.score or (r.score = me.score and r.created_at < me.created_at)),
    (select count(*) + 1 from mspetty.petty_run_3d r
      where r.ship_id = me.ship_id and (r.score > me.score or (r.score = me.score and r.created_at < me.created_at))),
    (select count(*) + 1 from mspetty.petty_run_3d r
      where r.lolz > me.lolz or (r.lolz = me.lolz and r.created_at < me.created_at))
  from me;
$$;

revoke all on function mspetty.submit_petty_run_3d(text,text,text,text,text,int,int,int,int,int,int,int,text,text,int,int,int,text,int,text,int,boolean,jsonb,text) from public;
revoke all on function mspetty.petty_run_3d_board(text,text) from public;
revoke all on function mspetty.petty_run_3d_my_rank(uuid,text) from public;
grant usage on schema mspetty to anon, authenticated;
grant execute on function mspetty.submit_petty_run_3d(text,text,text,text,text,int,int,int,int,int,int,int,text,text,int,int,int,text,int,text,int,boolean,jsonb,text) to anon, authenticated;
grant execute on function mspetty.petty_run_3d_board(text,text) to anon, authenticated;
grant execute on function mspetty.petty_run_3d_my_rank(uuid,text) to anon, authenticated;

-- PostgREST picks up new functions after a schema reload.
notify pgrst, 'reload schema';
