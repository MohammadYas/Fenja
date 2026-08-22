-- Rate limiting på offentlige endepunkter (OWASP API4:2023). Tælleren bor i
-- databasen, ikke i hukommelsen: Netlify-functions er statsløse og skalerer
-- vandret, så en process-lokal tæller kunne omgås ved at ramme en anden
-- instans. Nøglen er (rute + identitet), hvor identiteten er bruger-id eller
-- en HASHET IP — rå IP gemmes aldrig, jf. privatlivspolitikken.
create table if not exists public.rate_limit (
  id bigserial primary key,
  rute text not null,
  noegle text not null,
  created_at timestamptz not null default now()
);

alter table public.rate_limit enable row level security;

create index if not exists rate_limit_opslag_idx
  on public.rate_limit (rute, noegle, created_at desc);
