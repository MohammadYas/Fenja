-- Unikke besøgende (ejer-ordre 22/8, TikTok-lancering): vi kunne kun tælle
-- sidevisninger, ikke hvor mange MENNESKER der kom. Løsningen er samme
-- privatlivsvenlige greb som Plausible: en daglig, roterende hash af
-- IP + user-agent. Der gemmes stadig ALDRIG en IP, og hashen kan ikke
-- vendes om eller følges fra dag til dag (saltet skifter ved midnat), så
-- der kræves fortsat intet cookie-banner.
alter table public.besoeg
  add column if not exists besoegende text check (char_length(besoegende) <= 32);

create index if not exists besoeg_besoegende_idx on public.besoeg (besoegende);
create index if not exists besoeg_utm_source_idx on public.besoeg (utm_source);
