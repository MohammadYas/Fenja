-- Label og farve skrives af brugeren (ejer-ordre 2026-08-20: AI skal ikke
-- læse label-fotos — brugeren skriver materiale/størrelse og farve, og
-- teksten genereres ud fra det. Sparer et vision-kald pr. annonce).
alter table public.items add column if not exists label_text text;
alter table public.items add column if not exists color text;
