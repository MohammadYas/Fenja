-- Rate limits + ydelsesindekser
-- ALLEREDE ANVENDT i produktion 2026-08-23 via Supabase Management API
-- (migration: rate_limits_og_indekser). Idempotent — sikker at koere igen.
--
-- Derudover blev pg_cron aktiveret og foelgende job oprettet (koer IKKE igen — jobbet findes):
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   SELECT cron.schedule('ryd-rate-limit', '0 3 * * *',
--     $$DELETE FROM public.rate_limit WHERE created_at < now() - interval '7 days'$$);

CREATE INDEX IF NOT EXISTS idx_generations_created ON public.generations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_item_status ON public.generations (item_id, status);
CREATE INDEX IF NOT EXISTS idx_items_user_status ON public.items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_ts ON public.credit_ledger (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_besoeg_created ON public.besoeg (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_opslag ON public.rate_limit (noegle, rute, created_at DESC);

-- Graenser: 20 genereringer/time pr. bruger, 10 onmodel/time pr. bruger, 150/time globalt.
CREATE OR REPLACE FUNCTION public.enforce_generation_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_user uuid;
  n_user_hour int;
  n_onmodel_hour int;
  n_global_hour int;
BEGIN
  SELECT i.user_id INTO v_user FROM public.items i WHERE i.id = NEW.item_id;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'RATE_LIMIT: ukendt item';
  END IF;

  SELECT COUNT(*) INTO n_user_hour
  FROM public.generations g
  JOIN public.items i ON i.id = g.item_id
  WHERE i.user_id = v_user
    AND g.created_at > now() - interval '1 hour';

  IF n_user_hour >= 20 THEN
    RAISE EXCEPTION 'RATE_LIMIT_USER: maks 20 genereringer pr. time. Vent lidt.';
  END IF;

  IF NEW.kind::text = 'onmodel' THEN
    SELECT COUNT(*) INTO n_onmodel_hour
    FROM public.generations g
    JOIN public.items i ON i.id = g.item_id
    WHERE i.user_id = v_user
      AND g.kind::text = 'onmodel'
      AND g.created_at > now() - interval '1 hour';
    IF n_onmodel_hour >= 10 THEN
      RAISE EXCEPTION 'RATE_LIMIT_ONMODEL: maks 10 onmodel pr. time. Vent lidt.';
    END IF;
  END IF;

  SELECT COUNT(*) INTO n_global_hour
  FROM public.generations g
  WHERE g.created_at > now() - interval '1 hour';

  IF n_global_hour >= 150 THEN
    RAISE EXCEPTION 'RATE_LIMIT_GLOBAL: systemet er optaget. Vent lidt.';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_generation_rate_limit ON public.generations;
CREATE TRIGGER trg_generation_rate_limit
BEFORE INSERT ON public.generations
FOR EACH ROW EXECUTE FUNCTION public.enforce_generation_limits();
