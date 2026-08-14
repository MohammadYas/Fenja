// In-memory-implementering af LedgerDb med samme semantik som SQL-funktionen
// (idempotens + saldo-tjek). Bruges i tests og som reference for invarianten.

import type { LedgerAarsag, LedgerDb } from "./ledger";

type Linje = {
  userId: string;
  delta: number;
  reason: LedgerAarsag;
  idempotencyKey: string;
  stripeRef?: string;
};

export class MemoryLedgerDb implements LedgerDb {
  linjer: Linje[] = [];

  async tilfoejKreditter(params: {
    userId: string;
    delta: number;
    reason: LedgerAarsag;
    idempotencyKey: string;
    stripeRef?: string;
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }> {
    const dublet = this.linjer.some((l) => l.idempotencyKey === params.idempotencyKey);
    if (!dublet) {
      const saldoEfter = (await this.hentSaldo(params.userId)) + params.delta;
      if (saldoEfter < 0) return { fejl: "utilstraekkelig_saldo" };
      this.linjer.push({ ...params });
    }
    return { saldo: await this.hentSaldo(params.userId) };
  }

  async hentSaldo(userId: string): Promise<number> {
    return this.linjer
      .filter((l) => l.userId === userId)
      .reduce((sum, l) => sum + l.delta, 0);
  }
}
