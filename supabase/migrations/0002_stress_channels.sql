-- Stress channels: electrodermal activity, skin temperature, cortisol.
--
-- Split from 0001 rather than folded into it so an existing database can adopt
-- the bracelet's extra sensors without a rebuild.

-- ------------------------------------------------------------------ samples --

-- EDA and temperature ride along in the existing sample chunks: they are
-- recorded by the same device over the same window, and keeping them in one row
-- means one insert per chunk rather than three.
alter table public.samples
  add column if not exists eda jsonb not null default '[]'::jsonb,
  add column if not exists temperature jsonb not null default '[]'::jsonb;

comment on column public.samples.eda is
  'Skin conductance: [{ t, us }, ...] where us is microsiemens.';
comment on column public.samples.temperature is
  'Skin temperature: [{ t, c }, ...] in degrees Celsius.';

-- ----------------------------------------------------------------- cortisol --

-- Cortisol is not a sensor reading. It comes from a saliva kit, a blood draw or
-- a hair segment, so it is entered by hand and lives in its own table rather
-- than inside a recording session.
create table if not exists public.cortisol_readings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  taken_at    timestamptz not null,
  -- Concentration in nmol/L. Saliva and serum differ by roughly 20x; the app
  -- normalises to a salivary equivalent before comparing anything.
  nmol_per_l  numeric(8,2) not null check (nmol_per_l >= 0),
  source      text not null check (source in ('saliva', 'serum', 'hair', 'sweat')),
  -- Cortisol is meaningless without knowing how long you had been awake.
  wake_time   timestamptz,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists cortisol_user_taken_idx
  on public.cortisol_readings (user_id, taken_at desc);

comment on table public.cortisol_readings is
  'Lab cortisol. The sweat source exists for a future wearable biosensor; no such device is commercially available yet.';

-- ------------------------------------------------------------ daily metrics --

alter table public.daily_metrics
  add column if not exists stress_score int
    check (stress_score between 0 and 100),
  add column if not exists stress_band text
    check (stress_band in ('calm', 'moderate', 'elevated', 'high')),
  add column if not exists scr_per_min numeric(6,2),
  add column if not exists mean_scl numeric(6,2),
  add column if not exists skin_temperature numeric(4,1),
  add column if not exists cortisol_car numeric(6,3),
  add column if not exists cortisol_slope numeric(6,4);

comment on column public.daily_metrics.scr_per_min is
  'Skin conductance responses per minute — the direct sympathetic arousal measure.';
comment on column public.daily_metrics.cortisol_car is
  'Cortisol awakening response as a fraction of the waking value.';
comment on column public.daily_metrics.cortisol_slope is
  'Diurnal slope of ln(cortisol) per hour. Flatter is the chronic stress pattern.';

-- ------------------------------------------------------------------- RLS --

alter table public.cortisol_readings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cortisol_readings'
      and policyname = 'cortisol_readings_owner'
  ) then
    create policy cortisol_readings_owner on public.cortisol_readings
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;
