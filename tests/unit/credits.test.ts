import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { abonnementer, kreditter } from "@/lib/config";
import {
  UtilstraekkeligSaldoFejl,
  hentStatus,
  refunderOnModel,
  registrerAbonnementsKvote,
  registrerKoeb,
  registrerTopUp,
  tilfoejSignupKreditter,
  traekLevering,
} from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";

const DAG_MS = 24 * 60 * 60 * 1000;

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

// Pricing v3.0: kilder, udløb, forbrugsrækkefølge og rollover.
// Uret styres med fake timers, så udløb (12 mdr.) kan testes deterministisk.
describe("kredit-kilder og forbrugsrækkefølge (pricing v3.0)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-16T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("forbrug brænder subscription før topup før pack", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 5, "evt_pack");
    await registrerTopUp(db, "u1", 10, "evt_topup");
    await registrerAbonnementsKvote(db, "u1", "plus", "fak_1"); // 12 stk.
    await traekLevering(db, "u1", "item-1");
    const status = await hentStatus(db, "u1");
    expect(status.prKilde.subscription).toBe(11); // kvoten brændes først
    expect(status.prKilde.topup).toBe(10);
    expect(status.prKilde.pack).toBe(5);
    // Kvoten tømmes helt før top-up røres
    for (let i = 2; i <= 13; i++) await traekLevering(db, "u1", `item-${i}`);
    const efter = await hentStatus(db, "u1");
    expect(efter.prKilde.subscription).toBe(0);
    expect(efter.prKilde.topup).toBe(9); // først nu brændes top-up
    expect(efter.prKilde.pack).toBe(5);
  });

  it("pack-forbrug tager ældste køb først (FIFO — de udløber først)", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 5, "evt_gammel");
    vi.advanceTimersByTime(30 * DAG_MS);
    await registrerKoeb(db, "u1", 5, "evt_ny");
    for (let i = 1; i <= 6; i++) await traekLevering(db, "u1", `item-${i}`);
    // 6 brændt: hele det gamle køb (5) + 1 fra det nye. Var rækkefølgen LIFO,
    // ville 4 ligge tilbage i det GAMLE køb og udløbe ved dets 12 mdr.
    vi.advanceTimersByTime(340 * DAG_MS); // godt forbi det gamle købs udløb
    expect(await db.hentSaldo("u1")).toBe(4); // resten ligger i det nye køb
  });

  it("udløbne kreditter bortfalder automatisk og er ikke dækning", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 10, "evt_1");
    expect(await db.hentSaldo("u1")).toBe(10);
    vi.advanceTimersByTime(370 * DAG_MS); // forbi 12 mdr.
    expect(await db.hentSaldo("u1")).toBe(0);
    await expect(traekLevering(db, "u1", "item-1")).rejects.toThrow(
      UtilstraekkeligSaldoFejl,
    );
  });

  it("refunds udløber aldrig og brændes sidst", async () => {
    const db = new MemoryLedgerDb();
    await registrerKoeb(db, "u1", 2, "evt_1");
    await traekLevering(db, "u1", "item-1");
    await refunderOnModel(db, "u1", "item-1"); // +1 uden kilde
    await traekLevering(db, "u1", "item-2"); // brænder pack-kreditten, ikke refunden
    vi.advanceTimersByTime(370 * DAG_MS); // pakken ville være udløbet
    expect(await db.hentSaldo("u1")).toBe(1); // refunden består
  });

  it("top-up og abonnementskvote er idempotente (E-4/NFR-10)", async () => {
    const db = new MemoryLedgerDb();
    await registrerTopUp(db, "u1", 10, "evt_top");
    const saldoTop = await registrerTopUp(db, "u1", 10, "evt_top"); // dublet
    expect(saldoTop).toBe(10);
    await registrerAbonnementsKvote(db, "u1", "plus", "fak_1");
    const saldoAbo = await registrerAbonnementsKvote(db, "u1", "plus", "fak_1");
    expect(saldoAbo).toBe(10 + 12);
    expect(db.linjer).toHaveLength(2);
  });

  it("rollover med loft: abonnements-saldoen fyldes kun op til loftet", async () => {
    const db = new MemoryLedgerDb();
    const plus = abonnementer.tiers.find((t) => t.id === "plus")!;
    const loft = plus.annoncerPrMd * abonnementer.rolloverLoftFaktor; // 24
    await registrerAbonnementsKvote(db, "u1", "plus", "fak_1"); // +12
    await registrerAbonnementsKvote(db, "u1", "plus", "fak_2"); // +12 → 24
    const vedLoft = await registrerAbonnementsKvote(db, "u1", "plus", "fak_3"); // +0
    expect(vedLoft).toBe(loft);
    expect(db.linjer).toHaveLength(2); // fak_3 skrev ingenting
    // Efter forbrug fyldes der kun op til loftet igen
    for (let i = 1; i <= 4; i++) await traekLevering(db, "u1", `item-${i}`);
    const efter = await registrerAbonnementsKvote(db, "u1", "plus", "fak_4"); // +4
    expect(efter).toBe(loft);
  });

  it("tidligste udløb rapporteres ærligt til kreditsiden", async () => {
    const db = new MemoryLedgerDb();
    const koebt = new Date();
    await registrerKoeb(db, "u1", 5, "evt_1");
    const status = await hentStatus(db, "u1");
    const forventet = new Date(koebt);
    forventet.setMonth(forventet.getMonth() + kreditter.udloebMdr);
    expect(status.naesteUdloeb?.dato.getTime()).toBe(forventet.getTime());
    expect(status.naesteUdloeb?.antal).toBe(5);
  });
});
