-- Kontakt-henvendelser (ejer-ordre 21/8 nat): offentlig kontaktformular +
-- kontakt fra Konto. Ingen RLS-policies for almindelige brugere — kun
-- service-rollen (API-ruten og admin-siden) rører tabellen; anonyme skriver
-- gennem API-ruten, aldrig direkte.
create table if not exists public.henvendelser (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  navn text not null check (char_length(navn) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  besked text not null check (char_length(besked) between 3 and 4000),
  status text not null default 'ny' check (status in ('ny', 'laest')),
  created_at timestamptz not null default now()
);

alter table public.henvendelser enable row level security;

create index if not exists henvendelser_created_at_idx
  on public.henvendelser (created_at desc);
