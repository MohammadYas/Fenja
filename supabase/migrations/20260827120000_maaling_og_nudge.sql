-- Måling af trial-tragtens sidste trin + aktiverings-nudge (dataanalyse 27/8).
--
-- Baggrund: 26/8 fuldførte 2 besøgende en gratis prøve, og NUL af dem
-- oprettede en konto. Tragten kunne ikke forklare hvorfor, fordi der intet
-- måles mellem "resultatet blev vist" og "kontoen blev oprettet". Og begge
-- ægte brugere tilmeldte sig uden nogensinde at lægge et item op, uden at
-- noget fulgte op på det.

-- 1) trial_cta_klik: den besøgende trykkede på "Opret gratis konto" på
--    resultatet. Adskiller "ville ikke" fra "ville, men faldt fra undervejs"
--    — to helt forskellige problemer med to helt forskellige rettelser.
alter table public.trial_events
  drop constraint if exists trial_events_event_check;

alter table public.trial_events
  add constraint trial_events_event_check
  check (event in (
    'trial_started',
    'trial_completed',
    'trial_blocked',
    'trial_cta_klik',
    'trial_to_signup'
  ));

-- 2) Aktiverings-nudge: ét venligt skub til brugere der tilmeldte sig og
--    aldrig lagde noget op. Kolonnen er stemplet ÉN gang pr. bruger, så
--    ingen kan modtage nudgen to gange — også hvis jobbet kører flere gange.
alter table public.profiles
  add column if not exists aktivering_nudget_at timestamptz;

-- Kandidat-opslaget filtrerer på "endnu ikke nudget" og sorterer på alder.
-- Delvist indeks: kun de rækker der stadig kan nudges, ligger i indekset.
create index if not exists idx_profiles_afventer_nudge
  on public.profiles (created_at)
  where aktivering_nudget_at is null;
