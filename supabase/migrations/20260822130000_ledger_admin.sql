-- Manuel kredittildeling fra admin-panelet (ejer-ordre 22/8): support,
-- kompensation ved fejl, testbrugere og kampagner. Egen årsag, så den kan
-- skelnes fra rigtige køb i regnskabet.
alter type public.ledger_reason add value if not exists 'admin';
