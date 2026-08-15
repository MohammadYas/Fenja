-- S31 · Hjem-anker som brugervalg.
-- Sælgerens faste "hjem" på visualiseringerne vælges i dag deterministisk af
-- user-id (lib/pipeline/skabeloner.ts). Denne kolonne lader sælgeren låse et
-- bestemt hjem i stedet. NULL = intet aktivt valg → det deterministiske hjem
-- bruges som før, så "samme sælger → samme bolig" stadig gælder.
--
-- Værdien er hjem-id'et fra HJEM (fx 'vesterbro-lejlighed'). Listen bor
-- versioneret i TS og ændrer sig over tid, så gyldigheden håndhæves i app-laget
-- (API-ruten + pipelinen falder tilbage til det deterministiske hjem ved et
-- ukendt id) — ikke som en CHECK-constraint, der ville drive ud af sync.
alter table public.profiles
  add column home_anchor text;

comment on column public.profiles.home_anchor is
  'Selvvalgt hjem-id (S31); NULL = deterministisk hjem ud fra user-id';

-- Ingen ny RLS-politik: de eksisterende "egen profil læses/opdateres"-politikker
-- (auth.uid() = id) dækker allerede læsning og skrivning af egen kolonne.
