-- Onboarding (ejer-ordre 2026-08-20): personen på de genererede billeder
-- skal matche sælgeren — køn og hårfarve gemmes på profilen og styrer
-- person-ankeret i prompten. Koden er fejltolerant før migrationen er kørt
-- (falder tilbage til den neutrale rotation).

alter table public.profiles add column if not exists koen text
  check (koen in ('mand', 'kvinde'));
alter table public.profiles add column if not exists haar_farve text;
