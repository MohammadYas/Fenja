-- B-8: Regenerér enkeltdele til reduceret kreditpris.
-- Reduceret pris kræver brøkdele af en kredit — delta går fra integer til
-- numeric(6,2), og ledger-årsagen 'regen' tilføjes. Saldo-summen og den
-- transaktionelle funktion følger med. (Migreres FØR første db push — der
-- findes ingen produktionsdata at konvertere.)

alter type public.ledger_reason add value if not exists 'regen';

-- View'et afhænger af delta-kolonnen og SKAL droppes før typeskiftet
-- (0A000: cannot alter type of a column used by a view) — fundet ved første
-- kørsel mod cloud-databasen 2026-08-16.
drop view public.credit_balances;

alter table public.credit_ledger
  alter column delta type numeric(6, 2) using delta::numeric(6, 2);

create view public.credit_balances
  with (security_invoker = true) as
select user_id, coalesce(sum(delta), 0)::numeric(8, 2) as balance
from public.credit_ledger
group by user_id;

drop function public.tilfoej_kreditter(uuid, integer, public.ledger_reason, text, text);

create function public.tilfoej_kreditter(
  p_user_id uuid,
  p_delta numeric,
  p_reason public.ledger_reason,
  p_idempotency_key text,
  p_stripe_ref text default null
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

  insert into public.credit_ledger (user_id, delta, reason, stripe_ref, idempotency_key)
  values (p_user_id, p_delta, p_reason, p_stripe_ref, p_idempotency_key)
  on conflict (idempotency_key) do nothing;

  v_indsat := found;

  select coalesce(sum(delta), 0)::numeric into v_saldo
  from public.credit_ledger
  where user_id = p_user_id;

  -- Kun nye træk kan afvises; en dublet (v_indsat = false) er et no-op (E-4)
  if v_indsat and v_saldo < 0 then
    raise exception 'utilstraekkelig_saldo';
  end if;

  return v_saldo;
end;
$$;

-- Kaldes kun fra server/jobs med service-nøgle — aldrig fra klienten (NFR-6)
revoke execute on function public.tilfoej_kreditter from public, anon, authenticated;
