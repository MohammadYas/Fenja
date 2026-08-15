import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { LedgerAarsag, LedgerDb } from "./ledger";

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
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }> {
    const { data, error } = await this.klient.rpc("tilfoej_kreditter", {
      p_user_id: params.userId,
      p_delta: params.delta,
      p_reason: params.reason,
      p_idempotency_key: params.idempotencyKey,
      p_stripe_ref: params.stripeRef ?? null,
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
}
