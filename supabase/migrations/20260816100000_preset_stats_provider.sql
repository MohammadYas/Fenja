-- Gate 1-trekamp: preset_stats får en provider-dimension, så pass-rate og
-- troskab kan sammenlignes pr. billedprovider (fal / gemini-final /
-- gemini-preview). ADDITIV: eksisterende rækker bliver 'fal', og
-- registrer_preset_koersel beholder bagudkompatibilitet via default-værdi.

alter table public.preset_stats
  add column provider text not null default 'fal';

alter table public.preset_stats
  drop constraint preset_stats_pkey;

alter table public.preset_stats
  add primary key (preset_id, version, provider);

-- Signaturen udvides (nyt parameter med default) — den gamle 4-args-funktion
-- droppes, så kald uden p_provider ikke bliver flertydige.
drop function public.registrer_preset_koersel(text, integer, boolean, numeric);

create function public.registrer_preset_koersel(
  p_preset_id text,
  p_version integer,
  p_bestaaet boolean,
  p_fidelity numeric,
  p_provider text default 'fal'
) returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.preset_stats (preset_id, version, provider, runs, passes, avg_fidelity)
  values (
    p_preset_id,
    p_version,
    p_provider,
    1,
    case when p_bestaaet then 1 else 0 end,
    round(p_fidelity, 3)
  )
  on conflict (preset_id, version, provider) do update set
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
revoke execute on function public.registrer_preset_koersel(text, integer, boolean, numeric, text)
  from public, anon, authenticated;
