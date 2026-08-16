// In-memory-implementering af LedgerDb med samme semantik som SQL-funktionen
// (idempotens + saldo-tjek + kilde/udløb-genafspilning). Bruges i tests og som
// reference for invarianten. Tid: linjer stemples med Date.now(), så tests kan
// styre uret med vi.useFakeTimers.

import { beregnKreditStatus, type KreditStatus } from "./beregn";
import type { KreditKilde, LedgerAarsag, LedgerDb } from "./ledger";

type Linje = {
  userId: string;
  delta: number;
  reason: LedgerAarsag;
  idempotencyKey: string;
  stripeRef?: string;
  kilde?: KreditKilde;
  udloeber?: Date;
  ts: Date;
};

export class MemoryLedgerDb implements LedgerDb {
  linjer: Linje[] = [];

  async tilfoejKreditter(params: {
    userId: string;
    delta: number;
    reason: LedgerAarsag;
    idempotencyKey: string;
    stripeRef?: string;
    kilde?: KreditKilde;
    udloeber?: Date;
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }> {
    const dublet = this.linjer.some((l) => l.idempotencyKey === params.idempotencyKey);
    if (!dublet) {
      const linje: Linje = { ...params, ts: new Date() };
      this.linjer.push(linje);
      // Som SQL-funktionen: kun nye TRÆK kan afvises — og tjekket bruger den
      // udløbs-bevidste saldo, så udløbne kreditter ikke er dækning
      if (params.delta < 0 && (await this.hentSaldo(params.userId)) < 0) {
        this.linjer.pop();
        return { fejl: "utilstraekkelig_saldo" };
      }
    }
    return { saldo: await this.hentSaldo(params.userId) };
  }

  async hentSaldo(userId: string): Promise<number> {
    return (await this.hentStatus(userId)).saldo;
  }

  async hentStatus(userId: string): Promise<KreditStatus> {
    return beregnKreditStatus(
      this.linjer
        .filter((l) => l.userId === userId)
        .map((l) => ({ delta: l.delta, ts: l.ts, kilde: l.kilde, udloeber: l.udloeber })),
    );
  }
}
