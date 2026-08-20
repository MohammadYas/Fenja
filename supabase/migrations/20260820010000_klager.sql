-- Klager over genererede billeder (ejer-ordre 2026-08-20): brugeren kan
-- anmode om at få sin kredit tilbage; anmodningen lander i admin-panelet,
-- hvor ejeren godkender (refusion via tilfoej_kreditter) eller afviser.
-- Én klage pr. item — refusionen er idempotent på klage-id i ledgeren.

create table public.klager (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  begrundelse text not null check (char_length(begrundelse) between 10 and 1000),
  status text not null default 'aaben' check (status in ('aaben', 'godkendt', 'afvist')),
  oprettet_at timestamptz not null default now(),
  behandlet_at timestamptz,
  unique (item_id)
);

create index klager_status_idx on public.klager (status, oprettet_at);

alter table public.klager enable row level security;

-- Brugeren ser og opretter kun egne klager, og kun på egne items.
-- Afgørelser (update) sker udelukkende med service-rollen fra admin-API'et.
create policy "klager_select_egen" on public.klager
  for select using (auth.uid() = user_id);

create policy "klager_insert_egen" on public.klager
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.items i
      where i.id = item_id and i.user_id = auth.uid()
    )
  );
