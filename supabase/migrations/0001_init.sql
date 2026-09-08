-- Zoned schema.
--
-- Design notes:
--  * Raw beat-to-beat intervals are kept, not just the derived scores. Storage
--    is cheap and the scoring formulas will change as they are tuned; without
--    the raw data every past day would be frozen at whatever the formula said
--    on the night it was recorded.
--  * Every table is owned by a user and protected by row level security, so a
--    leaked anon key cannot read anyone else's heart.
--  * Times are timestamptz throughout. A night of sleep crosses midnight and
--    sometimes a timezone; storing local times would corrupt the record.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles --

create table public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  display_name    text,
  birth_year      int check (birth_year between 1900 and 2100),
  max_hr          int check (max_hr between 100 and 230),
  resting_hr      int check (resting_hr between 25 and 120),
  sex             text check (sex in ('male', 'female', 'unspecified')),
  sleep_need_hours numeric(3,1) default 8.0 check (sleep_need_hours between 4 and 14),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.profiles.max_hr is
  'Measured maximum heart rate. Null falls back to the Tanaka estimate from birth_year.';

-- ---------------------------------------------------------------- devices --

create table public.devices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  -- 'strap' today, 'band' once the custom hardware exists.
  kind         text not null default 'strap' check (kind in ('strap', 'band', 'watch', 'phone')),
  ble_id       text,
  firmware     text,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (user_id, ble_id)
);

-- --------------------------------------------------------------- sessions --

create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  device_id   uuid references public.devices on delete set null,
  kind        text not null check (kind in ('workout', 'sleep', 'rest', 'daily')),
  label       text,
  started_at  timestamptz not null,
  ended_at    timestamptz not null,
  -- Metrics computed on the phone at capture time. Recomputable from samples.
  summary     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  check (ended_at >= started_at)
);

create index sessions_user_started_idx on public.sessions (user_id, started_at desc);
create index sessions_user_kind_idx on public.sessions (user_id, kind, started_at desc);

-- ---------------------------------------------------------------- samples --

-- One row per second of recording would mean millions of rows per user, so
-- samples are stored in compact chunks: an array of readings under one row.
create table public.samples (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  started_at  timestamptz not null,
  -- [{ t, bpm, rr: number[] }, ...] — see @zoned/core HeartRateSample.
  heart_rate  jsonb not null default '[]'::jsonb,
  -- [{ t, g }, ...]
  motion      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index samples_session_idx on public.samples (session_id, started_at);

-- ------------------------------------------------------------ daily state --

-- One row per person per day: the numbers the home screen shows.
create table public.daily_metrics (
  user_id            uuid not null references auth.users on delete cascade,
  day                date not null,
  recovery_score     int check (recovery_score between 0 and 100),
  recovery_band      text check (recovery_band in ('red', 'yellow', 'green')),
  ln_rmssd           numeric(6,3),
  rmssd_ms           numeric(7,2),
  resting_hr         numeric(5,1),
  respiratory_rate   numeric(4,1),
  sleep_minutes      int,
  sleep_efficiency   numeric(4,3),
  sleep_performance  numeric(4,3),
  strain             numeric(4,2) check (strain between 0 and 21),
  trimp              numeric(8,2),
  -- Full breakdown: stage minutes, zone minutes, score contributions.
  detail             jsonb not null default '{}'::jsonb,
  computed_at        timestamptz not null default now(),
  primary key (user_id, day)
);

create index daily_metrics_user_day_idx on public.daily_metrics (user_id, day desc);

-- Rolling baselines, one row per metric per person. Cheap to recompute but
-- stored so the app can show a score before it has downloaded any history.
create table public.baselines (
  user_id     uuid not null references auth.users on delete cascade,
  metric      text not null,
  mean        double precision not null,
  sd          double precision not null,
  samples     int not null default 0,
  ready       boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, metric)
);

-- Subjective context: without it you can never tell whether a red day was the
-- training or the two glasses of wine.
create table public.journal_entries (
  user_id    uuid not null references auth.users on delete cascade,
  day        date not null,
  -- e.g. { "alcohol": true, "late_meal": false, "stress": 4, "soreness": 2 }
  answers    jsonb not null default '{}'::jsonb,
  note       text,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ------------------------------------------------------------------- RLS --

alter table public.profiles        enable row level security;
alter table public.devices         enable row level security;
alter table public.sessions        enable row level security;
alter table public.samples         enable row level security;
alter table public.daily_metrics   enable row level security;
alter table public.baselines       enable row level security;
alter table public.journal_entries enable row level security;

-- Every table follows the same rule: you may touch your own rows and no others.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'devices', 'sessions', 'samples',
    'daily_metrics', 'baselines', 'journal_entries'
  ] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (%s) with check (%s)',
      t || '_owner', t,
      case when t = 'profiles' then 'id = auth.uid()' else 'user_id = auth.uid()' end,
      case when t = 'profiles' then 'id = auth.uid()' else 'user_id = auth.uid()' end
    );
  end loop;
end $$;

-- ---------------------------------------------------------------- triggers --

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Give every new sign-up a profile row so the app never has to special-case
-- its absence.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
