-- Annoncetekstens felter gemmes på items (D-1/D-4), plus leveringstidspunkt
-- og indeks til dagens omkostningsopgørelse (G-1/E-5).

alter table public.items
  add column titel text,
  add column beskrivelse text,
  add column soegeord text[],
  add column pris_fra_dkk integer,
  add column pris_til_dkk integer,
  add column pris_begrundelse text,
  add column leveret_at timestamptz;

create index generations_created_at_idx on public.generations (created_at);
