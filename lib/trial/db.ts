import "server-only";

// Supabase-implementeringen af trial-databasen: værn-opslagene, selve
// trial_usage-rækkerne og event-loggen. Alt kører med service-klienten —
// anonyme har ingen direkte adgang (RLS uden policies).

import type { SupabaseClient } from "@supabase/supabase-js";
import { hentTrialIndstillinger } from "@/lib/admin/trial-indstillinger";
import { trial } from "@/lib/config";
import type { AnnonceTekst } from "@/lib/providers/text";
import type { TrialBlokAarsag, TrialVaernDb } from "./vaern";

export const TRIAL_BUCKET = "trial-photos";

export class SupabaseTrialVaernDb implements TrialVaernDb {
  constructor(private klient: SupabaseClient) {}

  async hentIndstillinger(): Promise<{ aktiv: boolean; dagligtBudgetDkk: number } | null> {
    return hentTrialIndstillinger();
  }

  async dagensForbrugDkk(): Promise<number> {
    const midnat = new Date();
    midnat.setUTCHours(0, 0, 0, 0);
    const { data, error } = await this.klient
      .from("trial_usage")
      .select("cost_estimat_dkk")
      .gte("created_at", midnat.toISOString());
    if (error) throw new Error(`Trial-forbrugsopslag fejlede: ${error.message}`);
    return (data ?? []).reduce(
      (sum, r) => sum + Number((r as { cost_estimat_dkk: number | null }).cost_estimat_dkk ?? 0),
      0,
    );
  }

  async antalSidsteTime(): Promise<number> {
    const siden = new Date(Date.now() - 3_600_000).toISOString();
    const { count, error } = await this.klient
      .from("trial_usage")
      .select("id", { count: "exact", head: true })
      .gte("created_at", siden);
    if (error) throw new Error(`Trial-timeopslag fejlede: ${error.message}`);
    return count ?? 0;
  }

  async harCompleted(
    kolonne: "ip_hash" | "fingerprint_hash" | "token_hash",
    vaerdi: string,
    sidenIso: string,
  ): Promise<boolean> {
    const { count, error } = await this.klient
      .from("trial_usage")
      .select("id", { count: "exact", head: true })
      .eq(kolonne, vaerdi)
      .eq("status", "completed")
      .gte("created_at", sidenIso);
    if (error) throw new Error(`Trial-værnopslag fejlede: ${error.message}`);
    return (count ?? 0) > 0;
  }
}

export type TrialRaekke = {
  id: string;
  status: "running" | "completed" | "failed";
  kategori: string | null;
  maerke: string | null;
  resultat: AnnonceTekst | null;
  original_sti: string | null;
  billede_sti: string | null;
  vandmaerket_sti: string | null;
  claimed_by: string | null;
  created_at: string;
};

export async function opretTrialRaekke(
  klient: SupabaseClient,
  raekke: { tokenHash: string; ipHash: string; fingerprintHash: string | null },
): Promise<string> {
  const { data, error } = await klient
    .from("trial_usage")
    .insert({
      token_hash: raekke.tokenHash,
      ip_hash: raekke.ipHash,
      fingerprint_hash: raekke.fingerprintHash,
      status: "running",
      // Kodereview 25/8: estimatet skrives fra START, så budgetloftet også
      // tæller igangværende og fejlede kørsler — den faktiske sum overskriver
      // ved completed. Konservativt: en fejlet trial beholder estimatet.
      cost_estimat_dkk: trial.costEstimatDkk,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Kunne ikke oprette trial: ${error?.message}`);
  return data.id as string;
}

export async function hentTrialViaTokenHash(
  klient: SupabaseClient,
  tokenHash: string,
): Promise<TrialRaekke | null> {
  const { data } = await klient
    .from("trial_usage")
    .select(
      "id, status, kategori, maerke, resultat, original_sti, billede_sti, vandmaerket_sti, claimed_by, created_at",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();
  return (data as TrialRaekke | null) ?? null;
}

/** Event-log til konverteringsmåling — best-effort, må aldrig vælte flowet */
export async function logTrialEvent(
  klient: SupabaseClient,
  event: "trial_started" | "trial_completed" | "trial_blocked" | "trial_to_signup",
  opts: { aarsag?: TrialBlokAarsag | "captcha"; trialId?: string } = {},
): Promise<void> {
  try {
    await klient.from("trial_events").insert({
      event,
      aarsag: opts.aarsag ?? null,
      trial_id: opts.trialId ?? null,
    });
  } catch {
    // stille — tracking må aldrig vælte noget
  }
}
