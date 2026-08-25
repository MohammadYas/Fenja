-- Gratis prøve uden konto (ejer-ordre 2026-08-25): én anonym trial pr. person,
-- håndhævet server-side på hashet IP + signeret cookie + fingerprint. Rå IP
-- gemmes ALDRIG (samme løfte som rate_limit og besoeg). Resultatet læses kun
-- via serveren med et token — anonyme har INGEN direkte adgang (RLS uden
-- policies, kun service-rollen).

create table if not exists public.trial_usage (
  id uuid primary key default gen_random_uuid(),
  -- SHA-256 af adgangs-tokenet: selve tokenet bor kun i brugerens cookie/URL,
  -- så en databaselæk ikke giver adgang til andres resultater
  token_hash text not null unique,
  ip_hash text not null,
  fingerprint_hash text,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  -- Estimeret API-omkostning (kalibreres mod regningen som generations.cost_dkk)
  cost_estimat_dkk numeric(10, 4) not null default 0,
  kategori text,
  maerke text,
  -- Hele annonceteksten (titel, beskrivelse, soegeord, pris) — serveren
  -- udleverer kun de første 60 % af beskrivelsen til anonyme
  resultat jsonb,
  -- Stier i trial-photos-bucketen: uploadet foto (nedskaleret), rent output
  -- og den vandmærkede/nedskalerede udgave anonyme får vist
  original_sti text,
  billede_sti text,
  vandmaerket_sti text,
  fejl text,
  -- Claim ved signup: resultatet kopieres ind som item på kontoen
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

-- IP-opslaget (1 completed pr. IP pr. 7 dage) og døgn-/time-tællerne
create index if not exists idx_trial_usage_ip on public.trial_usage (ip_hash, created_at desc);
create index if not exists idx_trial_usage_fingerprint on public.trial_usage (fingerprint_hash, created_at desc);
create index if not exists idx_trial_usage_created on public.trial_usage (created_at desc);

-- Konverterings-tracking (trial_started/completed/blocked/to_signup) —
-- samme cookieløse princip som besoeg: ingen identitet, kun hændelser
create table if not exists public.trial_events (
  id uuid primary key default gen_random_uuid(),
  event text not null
    check (event in ('trial_started', 'trial_completed', 'trial_blocked', 'trial_to_signup')),
  -- Ved trial_blocked: lukket/budget/time/ip/cookie/fingerprint/captcha
  aarsag text,
  trial_id uuid references public.trial_usage (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_trial_events_created on public.trial_events (event, created_at desc);

-- RLS til, INGEN policies: alt går via service-rollen. Anonyme læser kun
-- deres eget resultat gennem /api/prov/resultat med token.
alter table public.trial_usage enable row level security;
alter table public.trial_events enable row level security;

-- Privat bucket til trial-fotos — adskilt fra item-photos, så oprydningen
-- aldrig kan røre betalende brugeres billeder
insert into storage.buckets (id, name, public)
values ('trial-photos', 'trial-photos', false)
on conflict (id) do nothing;

-- Oprydning (pg_cron er allerede aktiveret 23/8 — kør planlægningen ÉN gang
-- manuelt i Supabase, ligesom 'ryd-rate-limit'):
--   SELECT cron.schedule('ryd-trial-fotos', '15 3 * * *',
--     $$DELETE FROM storage.objects
--       WHERE bucket_id = 'trial-photos' AND created_at < now() - interval '7 days'$$);
--   SELECT cron.schedule('ryd-trial-usage', '20 3 * * *',
--     $$DELETE FROM public.trial_usage
--       WHERE created_at < now() - interval '90 days' AND claimed_by IS NULL$$);
