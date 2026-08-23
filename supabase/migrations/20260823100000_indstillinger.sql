-- Driftsindstillinger som ejeren kan ændre i admin-panelet uden deploy
-- (ejer-ordre 2026-08-23: "jeg skal på admin-panellet vælge hvilken model
-- brugerne skal have"). Nøgle/værdi, så senere driftsvalg kan bo samme sted.
--
-- Første nøgle er 'billedmodel' med formen:
--   { "preview": "<model-id>", "final": "<model-id>" }
-- hvor model-id'erne er dem fra kataloget i lib/config.ts (billedModeller).
-- Ukendte id'er er harmløse: koden falder tilbage til standardvalget.
create table if not exists public.indstillinger (
  noegle text primary key,
  vaerdi jsonb not null,
  opdateret_at timestamptz not null default now(),
  opdateret_af text
);

-- RLS til, INGEN policies: kun service-rollen (server + Trigger.dev-jobs) må
-- læse og skrive. Almindelige brugere skal hverken kunne se eller ændre,
-- hvilken model der køres på.
alter table public.indstillinger enable row level security;
