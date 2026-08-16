import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { KreditStatus } from "./beregn";
import type { KreditKilde, LedgerAarsag, LedgerDb } from "./ledger";

// Rækkeform fra SQL-funktionen beregn_kredit_status (migration 20260816100000)
type StatusRaekke = {
  saldo: number;
  subscription_saldo: number;
  topup_saldo: number;
  pack_saldo: number;
  oevrig_saldo: number;
  naeste_udloeb: string | null;
  naeste_udloeb_antal: number;
};

// Produktions-implementering af LedgerDb: kalder den transaktionelle
// SQL-funktion tilfoej_kreditter med service-klienten.
export class SupabaseLedgerDb implements LedgerDb {
  constructor(private klient: SupabaseClient) {}

  async tilfoejKreditter(params: {
    userId: string;
    delta: number;
    reason: LedgerAarsag;
    idempotencyKey: string;
    stripeRef?: string;
    kilde?: KreditKilde;
    udloeber?: Date;
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }> {
    const { data, error } = await this.klient.rpc("tilfoej_kreditter", {
      p_user_id: params.userId,
      p_delta: params.delta,
      p_reason: params.reason,
      p_idempotency_key: params.idempotencyKey,
      p_stripe_ref: params.stripeRef ?? null,
      p_source: params.kilde ?? null,
      p_expires_at: params.udloeber?.toISOString() ?? null,
    });
    if (error) {
      if (error.message.includes("utilstraekkelig_saldo")) {
        return { fejl: "utilstraekkelig_saldo" };
      }
      throw new Error(`Ledger-kald fejlede: ${error.message}`);
    }
    return { saldo: data as number };
  }

  async hentSaldo(userId: string): Promise<number> {
    const { data, error } = await this.klient
      .from("credit_balances")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`Saldo-opslag fejlede: ${error.message}`);
    return (data?.balance as number | undefined) ?? 0;
  }

  async hentStatus(userId: string): Promise<KreditStatus> {
    const { data, error } = await this.klient.rpc("beregn_kredit_status", {
      p_user_id: userId,
    });
    if (error) throw new Error(`Status-opslag fejlede: ${error.message}`);
    const raekke = (Array.isArray(data) ? data[0] : data) as StatusRaekke | undefined;
    if (!raekke) {
      return {
        saldo: 0,
        prKilde: { subscription: 0, topup: 0, pack: 0, oevrige: 0 },
        naesteUdloeb: null,
      };
    }
    return {
      saldo: Number(raekke.saldo),
      prKilde: {
        subscription: Number(raekke.subscription_saldo),
        topup: Number(raekke.topup_saldo),
        pack: Number(raekke.pack_saldo),
        oevrige: Number(raekke.oevrig_saldo),
      },
      naesteUdloeb: raekke.naeste_udloeb
        ? { dato: new Date(raekke.naeste_udloeb), antal: Number(raekke.naeste_udloeb_antal) }
        : null,
    };
  }
}
