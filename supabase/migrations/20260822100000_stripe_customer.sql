-- Stripe-kunde på profilen (omsætnings-audit 21/8, punkt 2): abonnements-
-- opslag hang udelukkende på e-mail-match mod Stripe. Betalte en kunde med
-- en anden adresse end sin Selja-konto (Apple/Google-relay, familiens kort),
-- mistede de ALLE abonnent-fordele selvom pengene var trukket. Kunde-id'et
-- gemmes nu ved checkout og bruges som primær nøgle; e-mail er fallback.
alter table public.profiles
  add column if not exists stripe_customer_id text;

create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Varsel om udløbende kreditter (ejer-ordre 22/8): sættes når mailen er
-- sendt, så samme udløb aldrig varsles to gange.
alter table public.profiles
  add column if not exists udloeb_varslet_at timestamptz;
