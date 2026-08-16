-- Selja · første migration — kerneskemaet fra SPEC §7.
-- Invariant (E-3): kreditsaldo ER summen af credit_ledger; den gemmes ikke som tal
-- på profilen. Trækning sker i samme transaktion som leverancen markeres komplet.

-- Profiler spejler auth.users (Supabase Auth ejer selve login).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  age_confirmed boolean not null default false, -- 18+-bekræftelse ved signup (A-2)
  created_at timestamptz not null default now()
);

create type public.item_status as enum ('draft', 'active', 'sold');

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand text,
  size text,
  condition text, -- Vinteds standskala (B-3)
  defects_text text, -- SKAL med i annonceteksten (D-2)
  category text,
  purchase_price_dkk numeric(10, 2),
  status public.item_status not null default 'draft',
  sold_price_dkk numeric(10, 2),
  created_at timestamptz not null default now()
);

create index items_user_id_idx on public.items (user_id);

create type public.photo_role as enum ('full', 'back', 'label', 'defect');

create table public.item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  role public.photo_role not null,
  original_url text not null,
  cleaned_url text,
  created_at timestamptz not null default now()
);

create index item_photos_item_id_idx on public.item_photos (item_id);

create type public.generation_kind as enum ('cleanup', 'onmodel', 'text');
create type public.generation_status as enum ('queued', 'running', 'succeeded', 'failed');

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  kind public.generation_kind not null,
  preset_id uuid,
  provider_job_id text,
  status public.generation_status not null default 'queued',
  fidelity_score numeric(4, 3), -- troskabs-tjek (C-3/K1)
  cost_dkk numeric(10, 4), -- omkostningslog pr. generering (G-1)
  output_url text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create index generations_item_id_idx on public.generations (item_id);

create table public.presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null default 1,
  style_prompt text not null,
  pass_rate numeric(4, 3), -- troskab pr. preset-version (FR-15)
  created_at timestamptz not null default now(),
  unique (name, version)
);

alter table public.generations
  add constraint generations_preset_id_fkey
  foreign key (preset_id) references public.presets (id);

create type public.ledger_reason as enum ('signup', 'purchase', 'delivery', 'refund');

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  reason public.ledger_reason not null,
  stripe_ref text,
  idempotency_key text unique, -- dubletter må aldrig koste dobbelt (E-4)
  ts timestamptz not null default now()
);

create index credit_ledger_user_id_idx on public.credit_ledger (user_id);

create view public.credit_balances
  with (security_invoker = true) as
select user_id, coalesce(sum(delta), 0)::integer as balance
from public.credit_ledger
group by user_id;

create table public.guides (
  slug text primary key,
  title text not null,
  body_md text not null,
  "order" integer not null default 0
);

-- RLS på alle tabeller (NFR-6). Skrivning til items sker fra klienten;
-- generations, ledger og fotos skrives af server/jobs med service-nøgle
-- (service role omgår RLS), så der er bevidst ingen klient-skrivepolitik dér.
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_photos enable row level security;
alter table public.generations enable row level security;
alter table public.presets enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.guides enable row level security;

create policy "egen profil læses" on public.profiles
  for select using (auth.uid() = id);

create policy "egen profil opdateres" on public.profiles
  for update using (auth.uid() = id);

create policy "egne items læses" on public.items
  for select using (auth.uid() = user_id);

create policy "egne items skrives" on public.items
  for insert with check (auth.uid() = user_id);

create policy "egne items opdateres" on public.items
  for update using (auth.uid() = user_id);

create policy "egne items slettes" on public.items
  for delete using (auth.uid() = user_id);

create policy "egne fotos læses" on public.item_photos
  for select using (
    exists (
      select 1 from public.items
      where items.id = item_photos.item_id and items.user_id = auth.uid()
    )
  );

create policy "egne genereringer læses" on public.generations
  for select using (
    exists (
      select 1 from public.items
      where items.id = generations.item_id and items.user_id = auth.uid()
    )
  );

create policy "egen ledger læses" on public.credit_ledger
  for select using (auth.uid() = user_id);

create policy "presets læses af alle" on public.presets
  for select using (true);

create policy "guides læses af alle" on public.guides
  for select using (true);

-- Profil oprettes automatisk ved signup; signup-kreditter (E-1) tildeles
-- først efter e-mailverifikation (E-5) og håndteres i app-laget, ikke her.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Privat bucket til brugerfotos; adgang kun via signerede URLs (NFR-6/NFR-7).
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false);
