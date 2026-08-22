-- Cookieløs besøgs-statistik (ejer-ordre 21/8 nat: "track alt, også UTM").
-- Privatliv: der gemmes ALDRIG IP, bruger-id eller andet identificerende —
-- kun side, henvisnings-host, UTM-parametre og enhedsklasse. Derfor kræves
-- intet cookie-banner, og privatlivspolitikkens løfte holder.
create table if not exists public.besoeg (
  id uuid primary key default gen_random_uuid(),
  sti text not null check (char_length(sti) between 1 and 300),
  referrer_host text check (char_length(referrer_host) <= 200),
  utm_source text check (char_length(utm_source) <= 120),
  utm_medium text check (char_length(utm_medium) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 160),
  utm_content text check (char_length(utm_content) <= 160),
  enhed text not null default 'ukendt' check (enhed in ('mobil', 'desktop', 'ukendt')),
  created_at timestamptz not null default now()
);

alter table public.besoeg enable row level security;

create index if not exists besoeg_created_at_idx on public.besoeg (created_at desc);
create index if not exists besoeg_sti_idx on public.besoeg (sti);
