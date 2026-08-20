import { describe, expect, it } from "vitest";
import { kreditter } from "@/lib/config";
import { refunderKlage } from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";

// Klage-refusion (ejer-ordre 2026-08-20): godkendt klage giver annonce-prisen
// tilbage — idempotent pr. klage-id, så dobbeltklik i admin aldrig refunderer
// dobbelt.
describe("refunderKlage", () => {
  it("refunderer annonce-prisen ved godkendt klage", async () => {
    const db = new MemoryLedgerDb();
    const saldo = await refunderKlage(db, "bruger-1", "klage-1");
    expect(saldo).toBe(kreditter.prisPrAnnonce);
  });

  it("er idempotent pr. klage — dobbelt godkendelse refunderer kun én gang", async () => {
    const db = new MemoryLedgerDb();
    await refunderKlage(db, "bruger-1", "klage-1");
    const saldo = await refunderKlage(db, "bruger-1", "klage-1");
    expect(saldo).toBe(kreditter.prisPrAnnonce);
  });

  it("forskellige klager refunderer hver for sig", async () => {
    const db = new MemoryLedgerDb();
    await refunderKlage(db, "bruger-1", "klage-1");
    const saldo = await refunderKlage(db, "bruger-1", "klage-2");
    expect(saldo).toBe(2 * kreditter.prisPrAnnonce);
  });
});
