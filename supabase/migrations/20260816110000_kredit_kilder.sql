-- Pricing v3.0 (ejer-beslutning 2026-08-16): kredit-kilde-dimension.
-- Hver positiv bevægelse bærer nu sin kilde (subscription/topup/pack) og evt.
-- udløbsdato (12 mdr. fra køb, se lib/config.ts). Saldoen er stadig summen af
-- ledgeren (E-3) — men beregnes ved kronologisk genafspilning, så:
--   1) forbrug dækkes i strategisk rækkefølge:
--        subscription (kvoten brændes først, så abonnenten aldrig oplever
--        den spildt) → topup (dyreste engangskreditter) → pack, ældste
--        købsdato først (FIFO: de udløber først) → kilde-løse bevægelser
--        (refunds + alt fra før v3.0: udløber aldrig, brændes sidst)
--   2) udløbne kreditter bortfalder automatisk af beregningen.
-- Additiv migration: eksisterende rækker (source/expires_at = null) beholder
-- præcis deres gamle semantik. Reference-implementering: lib/credits/beregn.ts.

create type public.kredit_kilde as enum ('subscription', 'topup', 'pack');

-- Månedskvoter fra abonnementer får egen årsag i historikken
alter type public.ledger_reason add value if not exists 'subscription';

alter table public.credit_ledger
  add column source public.kredit_kilde,
  add column expires_at timestamptz;

-- Genafspilning af én brugers ledger frem til p_naar. Returnerer samlet saldo,
-- saldo pr. kilde og det tidligste udløb (til ærlig visning på kreditsiden).
create function public.beregn_kredit_status(
  p_user_id uuid,
  p_naar timestamptz default now()
) returns table (
  saldo numeric,
  subscription_saldo numeric,
  topup_saldo numeric,
  pack_saldo numeric,
  oevrig_saldo numeric,
  naeste_udloeb timestamptz,
  naeste_udloeb_antal numeric
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  r record;
  -- Partier (positive bevægelser) som parallelle arrays
  v_prio int[] := '{}';
  v_ts timestamptz[] := '{}';
  v_udloeb timestamptz[] := '{}';
  v_rest numeric[] := '{}';
  v_underskud numeric := 0; -- kan kun opstå i en legacy-ledger; skjules aldrig
  v_mangler numeric;
  v_tag numeric;
  v_bedst int;
  i int;
  n int;
begin
  saldo := 0;
  subscription_saldo := 0;
  topup_saldo := 0;
  pack_saldo := 0;
  oevrig_saldo := 0;
  naeste_udloeb := null;
  naeste_udloeb_antal := 0;

  for r in
    select cl.delta, cl.ts, cl.source, cl.expires_at
    from public.credit_ledger cl
    where cl.user_id = p_user_id and cl.ts <= p_naar
    order by cl.ts, cl.id
  loop
    if r.delta > 0 then
      v_prio := v_prio || case r.source
        when 'subscription' then 1
        when 'topup' then 2
        when 'pack' then 3
        else 4 end;
      v_ts := v_ts || r.ts;
      v_udloeb := v_udloeb || r.expires_at;
      v_rest := v_rest || r.delta;
    elsif r.delta < 0 then
      v_mangler := -r.delta;
      while v_mangler > 0 loop
        -- Vælg parti: lavest prioritet → tidligst udløb (intet udløb sidst)
        -- → ældste købsdato (FIFO)
        v_bedst := null;
        n := coalesce(array_length(v_rest, 1), 0);
        for i in 1..n loop
          continue when v_rest[i] <= 0
            or (v_udloeb[i] is not null and v_udloeb[i] <= r.ts);
          if v_bedst is null or v_prio[i] < v_prio[v_bedst] then
            v_bedst := i;
          elsif v_prio[i] = v_prio[v_bedst] then
            if coalesce(v_udloeb[i], 'infinity'::timestamptz)
                 < coalesce(v_udloeb[v_bedst], 'infinity'::timestamptz) then
              v_bedst := i;
            elsif coalesce(v_udloeb[i], 'infinity'::timestamptz)
                    = coalesce(v_udloeb[v_bedst], 'infinity'::timestamptz)
                  and v_ts[i] < v_ts[v_bedst] then
              v_bedst := i;
            end if;
          end if;
        end loop;
        if v_bedst is null then
          v_underskud := v_underskud + v_mangler;
          exit;
        end if;
        v_tag := least(v_mangler, v_rest[v_bedst]);
        v_rest[v_bedst] := v_rest[v_bedst] - v_tag;
        v_mangler := v_mangler - v_tag;
      end loop;
    end if;
  end loop;

  -- Aktive partier ved p_naar: udløbne bortfalder her
  n := coalesce(array_length(v_rest, 1), 0);
  for i in 1..n loop
    continue when v_rest[i] <= 0
      or (v_udloeb[i] is not null and v_udloeb[i] <= p_naar);
    saldo := saldo + v_rest[i];
    if v_prio[i] = 1 then
      subscription_saldo := subscription_saldo + v_rest[i];
    elsif v_prio[i] = 2 then
      topup_saldo := topup_saldo + v_rest[i];
    elsif v_prio[i] = 3 then
      pack_saldo := pack_saldo + v_rest[i];
    else
      oevrig_saldo := oevrig_saldo + v_rest[i];
    end if;
    if v_udloeb[i] is not null then
      if naeste_udloeb is null or v_udloeb[i] < naeste_udloeb then
        naeste_udloeb := v_udloeb[i];
        naeste_udloeb_antal := v_rest[i];
      elsif v_udloeb[i] = naeste_udloeb then
        naeste_udloeb_antal := naeste_udloeb_antal + v_rest[i];
      end if;
    end if;
  end loop;

  saldo := saldo - v_underskud;
  return next;
end;
$$;

-- Saldo-view'et skal nu regne med udløb — genafspilningen erstatter sum(delta).
-- security_invoker består: RLS på credit_ledger afgør stadig hvem der kan se hvad.
drop view public.credit_balances;

create view public.credit_balances
  with (security_invoker = true) as
select u.user_id, s.saldo::numeric(8, 2) as balance
from (select distinct cl.user_id from public.credit_ledger cl) u
cross join lateral public.beregn_kredit_status(u.user_id) s;

-- tilfoej_kreditter udvides med kilde + udløb (begge valgfri — alle
-- eksisterende kald virker uændret). Dækningstjekket bruger nu den
-- udløbs-bevidste saldo, så udløbne kreditter ikke kan bruges som dækning.
drop function public.tilfoej_kreditter(uuid, numeric, public.ledger_reason, text, text);

create function public.tilfoej_kreditter(
  p_user_id uuid,
  p_delta numeric,
  p_reason public.ledger_reason,
  p_idempotency_key text,
  p_stripe_ref text default null,
  p_source public.kredit_kilde default null,
  p_expires_at timestamptz default null
) returns numeric -- ny saldo
language plpgsql
security definer set search_path = ''
as $$
declare
  v_saldo numeric;
  v_indsat boolean;
begin
  -- Serialisér pr. bruger, så saldo-tjek + insert er atomisk uden race
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  insert into public.credit_ledger (user_id, delta, reason, stripe_ref, idempotency_key, source, expires_at)
  values (p_user_id, p_delta, p_reason, p_stripe_ref, p_idempotency_key, p_source, p_expires_at)
  on conflict (idempotency_key) do nothing;

  v_indsat := found;

  select s.saldo into v_saldo
  from public.beregn_kredit_status(p_user_id) s;

  -- Kun nye TRÆK kan afvises; en dublet (v_indsat = false) er et no-op (E-4),
  -- og en kreditering må aldrig blokeres af et legacy-underskud
  if v_indsat and p_delta < 0 and v_saldo < 0 then
    raise exception 'utilstraekkelig_saldo';
  end if;

  return v_saldo;
end;
$$;

-- Kaldes kun fra server/jobs med service-nøgle — aldrig fra klienten (NFR-6)
revoke execute on function public.tilfoej_kreditter from public, anon, authenticated;
