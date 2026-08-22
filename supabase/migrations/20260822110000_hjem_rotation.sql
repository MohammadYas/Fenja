-- Rotationstæller for hjemmet (ejer-ordre 22/8): hjemmet er ikke et frit
-- gavebord. Man får ét tildelt og kan rotere det højst hjemRotation.maks
-- gange; tælleren skrives kun af serveren (service-rollen), så en klient
-- ikke kan nulstille den ved at skrive på sin egen profil.
alter table public.profiles
  add column if not exists hjem_rotationer integer not null default 0;
