-- Kreditbevægelser som transaktionel SQL-funktion (E-3/E-4/NFR-10):
-- al skrivning til credit_ledger går gennem tilfoej_kreditter, som er
-- idempotent (unik idempotency_key) og afviser træk uden dækning atomisk.

create function public.tilfoej_kreditter(
  p_user_id uuid,
  p_delta integer,
  p_reason public.ledger_reason,
  p_idempotency_key text,
  p_stripe_ref text default null
) returns integer -- ny saldo
language plpgsql
security definer set search_path = ''
as $$
declare
  v_saldo integer;
  v_indsat boolean;
begin
  -- Serialisér pr. bruger, så saldo-tjek + insert er atomisk uden race
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  insert into public.credit_ledger (user_id, delta, reason, stripe_ref, idempotency_key)
  values (p_user_id, p_delta, p_reason, p_stripe_ref, p_idempotency_key)
  on conflict (idempotency_key) do nothing;

  v_indsat := found;

  select coalesce(sum(delta), 0)::integer into v_saldo
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
