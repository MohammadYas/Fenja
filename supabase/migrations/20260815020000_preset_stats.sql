-- C-5/FR-15: pass-rate-statistik pr. preset-version — troskab pr. preset er
-- kvalitets-moatet. Hver troskabs-vurdering registreres som én kørsel via
-- registrer_preset_koersel (Gate 1-scriptet nu, pipelinen senere), og rækken
-- aggregeres inkrementelt. preset_id er kode-presettets slug (fx
-- 'lys-minimalisme' fra lib/pipeline/presets) — de versionerede presets bor
-- i koden og udrulles med den (SPEC §9), så der er bevidst ingen FK til
-- public.presets (uuid-tabellen fra init-migrationen).

create table public.preset_stats (
  preset_id text not null,
  version integer not null,
  runs integer not null default 0,
  passes integer not null default 0,
  avg_fidelity numeric(4, 3), -- gennemsnitlig troskabs-score; null før første kørsel
  updated_at timestamptz not null default now(),
  primary key (preset_id, version),
  constraint preset_stats_passes_inden_for_runs check (passes between 0 and runs)
);

-- RLS på alle tabeller (NFR-6). Aggregeret pass-rate er ikke persondata —
-- læses af alle, som public.presets.
alter table public.preset_stats enable row level security;

create policy "preset-statistik læses af alle" on public.preset_stats
  for select using (true);

-- Skrivning sker KUN via funktionen her (service-nøgle fra server/scripts):
-- runs/passes tælles op, og gennemsnittet opdateres inkrementelt uden at
-- gemme enkeltkørsler — enkeltscores bor i generations.fidelity_score (G-1).
create function public.registrer_preset_koersel(
  p_preset_id text,
  p_version integer,
  p_bestaaet boolean,
  p_fidelity numeric
) returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.preset_stats (preset_id, version, runs, passes, avg_fidelity)
  values (
    p_preset_id,
    p_version,
    1,
    case when p_bestaaet then 1 else 0 end,
    round(p_fidelity, 3)
  )
  on conflict (preset_id, version) do update set
    runs = preset_stats.runs + 1,
    passes = preset_stats.passes + case when p_bestaaet then 1 else 0 end,
    avg_fidelity = round(
      (coalesce(preset_stats.avg_fidelity, 0) * preset_stats.runs + p_fidelity)
        / (preset_stats.runs + 1),
      3
    ),
    updated_at = now();
end;
$$;

-- Kaldes kun fra server/jobs/scripts med service-nøgle — aldrig fra klienten (NFR-6)
revoke execute on function public.registrer_preset_koersel(text, integer, boolean, numeric)
  from public, anon, authenticated;
