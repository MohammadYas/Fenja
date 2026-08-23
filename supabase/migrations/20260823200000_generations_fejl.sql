-- Fejl ved billedgenerering skal kunne ses i admin-panelet (ejer-ordre
-- 23/8 aften). Hidtil fik generations-rækken kun status 'failed', og selve
-- årsagen forsvandt i serverloggen — nu gemmes fejlteksten på rækken.
-- Teksten er afkortet i koden (500 tegn) og indeholder aldrig nøgler.
alter table public.generations
  add column if not exists fejl text;
