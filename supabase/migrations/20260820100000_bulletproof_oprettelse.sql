-- Bulletproof oprettelse (ejer-ordre 2026-08-20):
-- 1) kladde_id: samme kladde må ALDRIG blive to annoncer, uanset hvor mange
--    gange klienten prøver igen efter netudfald (API'et er idempotent på den).
-- 2) visninger: brugerens valgte billedtyper gemmes, så en hængende pipeline
--    kan genoptages med præcis samme valg.
-- Koden er fejltolerant og virker også FØR migrationen er kørt (fallback uden
-- kolonnerne) — men idempotens- og genoptag-garantien gælder først efter.

alter table public.items add column if not exists kladde_id uuid;
alter table public.items add column if not exists visninger jsonb;

create unique index if not exists items_kladde_unik
  on public.items (user_id, kladde_id)
  where kladde_id is not null;
