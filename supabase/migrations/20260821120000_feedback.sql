-- Feedback fra brugerne (ejer-ordre 21/8): kort besked + kategori, læses i
-- admin-panelet. RLS: brugeren kan kun indsætte og se sit eget; service-rollen
-- (admin-siden) ser alt.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kategori text not null check (kategori in ('ros', 'fejl', 'forslag', 'andet')),
  besked text not null check (char_length(besked) between 3 and 2000),
  status text not null default 'ny' check (status in ('ny', 'laest')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_indsaet_eget" on public.feedback;
create policy "feedback_indsaet_eget" on public.feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists "feedback_laes_eget" on public.feedback;
create policy "feedback_laes_eget" on public.feedback
  for select using (auth.uid() = user_id);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
