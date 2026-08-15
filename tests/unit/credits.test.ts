import { describe, expect, it } from "vitest";
import { kreditter } from "@/lib/config";
import {
  UtilstraekkeligSaldoFejl,
  refunderOnModel,
  registrerKoeb,
  tilfoejSignupKreditter,
  traekLevering,
} from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";

describe("kredit-ledger (E-1..E-4)", () => {
  it("signup giver ingen kreditter — gratis-tier er slået fra (ejer-beslutning)", async () => {
    const db = new MemoryLedgerDb();
    await tilfoejSignupKreditter(db, "u1");
    const saldo = await tilfoejSignupKreditter(db, "u1"); // dublet
    expect(saldo).toBe(0);
    expect(db.linjer).toHaveLength(0); // ingen tomme ledger-rækker
  });

  it("dobbelt webhook-køb koster kun én gang (E-4)", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 10, "evt_123");
    const saldo = await registrerKoeb(db, "u1", 10, "evt_123");
    expect(saldo).toBe(10);
    expect(db.linjer).toHaveLength(1);
  });

  it("levering trækker kredit; dublet-levering trækker ikke dobbelt (E-3/E-4)", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 10, "evt_seed");
    await traekLevering(db, "u1", "item-1");
    const saldo = await traekLevering(db, "u1", "item-1"); // genkørt job
    expect(saldo).toBe(10 - kreditter.prisPrAnnonce);
  });

  it("træk uden dækning afvises med typet fejl", async () => {
    const db = new MemoryLedgerDb();
    await expect(traekLevering(db, "u1", "item-1")).rejects.toThrow(
      UtilstraekkeligSaldoFejl,
    );
  });

  it("B-6: fejlet visualisering refunderes — netto nul for delvis leverance", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 10, "evt_seed");
    await traekLevering(db, "u1", "item-1");
    const saldo = await refunderOnModel(db, "u1", "item-1");
    expect(saldo).toBe(10);
    // refund er også idempotent
    await refunderOnModel(db, "u1", "item-1");
    expect(await db.hentSaldo("u1")).toBe(10);
  });
});
