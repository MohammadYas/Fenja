-- Ét sted pr. sælger (ejer-ordre 22/8: "hvis steder er optaget skal man ik
-- ku vælge det"). To sælgere må aldrig dele hjem — ellers ligner deres
-- Vinted-profiler hinanden. Kravet håndhæves her i databasen, så tildelingen
-- er atomisk: to samtidige brugere kan ikke snuppe samme hjem.
create unique index if not exists profiles_home_anchor_unik
  on public.profiles (home_anchor)
  where home_anchor is not null;
