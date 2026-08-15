-- Salgstidspunkt til liggetids-statistik (B-10).
alter table public.items add column solgt_at timestamptz;
