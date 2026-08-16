-- S32 · velkomstmail én gang pr. bruger.
-- Første succesfulde login sender velkomstmailen; kolonnen markerer at den er
-- sendt, så gentagne logins (auth-callbacken kører hver gang) aldrig sender den
-- igen. NULL = endnu ikke budt velkommen. Sættes af app-laget efter en
-- bekræftet afsendelse — fejler mailen, forbliver den NULL og prøves næste login.
alter table public.profiles
  add column welcomed_at timestamptz;

comment on column public.profiles.welcomed_at is
  'Tidspunkt for afsendt velkomstmail (S32); NULL = ikke sendt endnu';
