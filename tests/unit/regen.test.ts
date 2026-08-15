// B-8: regenerér enkeltdele — reduceret pris, træk kun ved succes, idempotent
// pr. requestId, loft pr. delaftype.

import { describe, expect, it } from "vitest";
import { kreditter, misbrugsvaern } from "@/lib/config";
import { registrerKoeb } from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";
import {
  RegenGraenseFejl,
  RegenVisualiseringFejl,
  koerItemPipeline,
  koerRegenerering,
} from "@/lib/pipeline/run";
import { PRESETS } from "@/lib/pipeline/presets";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";
import { FakePipelineDb, FakePipelineStorage } from "../fakes/pipeline-fakes";

async function leveretOpsaetning(mock: { onModelFejler?: boolean } = {}) {
  const db = new FakePipelineDb();
  const ledger = new MemoryLedgerDb();
  await registrerKoeb(ledger, "user-1", 10, "evt_seed");
  const deps = {
    db,
    storage: new FakePipelineStorage(),
    image: new MockImageProvider(),
    text: new MockTextProvider(),
    ledger,
  };
  // Lever annoncen først — regenerering forudsætter en leveret annonce
  await koerItemPipeline(deps, "item-1");
  return {
    deps: { ...deps, image: new MockImageProvider(mock) },
    db,
    ledger,
  };
}

describe("regenerering af enkeltdele (B-8)", () => {
  it("ny tekst: reduceret pris trækkes, teksten overskrives", async () => {
    const { deps, db, ledger } = await leveretOpsaetning();
    const foer = await ledger.hentSaldo("user-1");

    const resultat = await koerRegenerering(deps, "item-1", "tekst", {
      requestId: "req-1",
    });

    expect(resultat.tekst).not.toBeNull();
    expect(resultat.saldoEfter).toBe(foer - kreditter.prisRegenerering);
    expect(db.tekster.get("item-1")).toBeDefined();
    expect(db.generings.filter((g) => g.kind === "text")).toHaveLength(2);
  });

  it("ny visualisering i andet preset: unik sti, reduceret pris", async () => {
    const { deps, db, ledger } = await leveretOpsaetning();
    const foer = await ledger.hentSaldo("user-1");
    const andetPreset = PRESETS[1]!.id;

    const resultat = await koerRegenerering(deps, "item-1", "visualisering", {
      requestId: "req-2",
      presetId: andetPreset,
    });

    expect(resultat.visualisering).not.toBeNull();
    expect(await ledger.hentSaldo("user-1")).toBe(foer - kreditter.prisRegenerering);
    const onmodels = db.generings.filter((g) => g.kind === "onmodel");
    expect(onmodels).toHaveLength(2);
    expect(onmodels[1]!.presetId).toBe(andetPreset);
    // Stien indeholder genererings-id — originalen er ikke overskrevet
    expect(resultat.visualisering!.sti).toContain(onmodels[1]!.id);
  });

  it("fejlet visualisering: RegenVisualiseringFejl og INTET træk", async () => {
    const { deps, ledger } = await leveretOpsaetning({ onModelFejler: true });
    const foer = await ledger.hentSaldo("user-1");

    await expect(
      koerRegenerering(deps, "item-1", "visualisering", { requestId: "req-3" }),
    ).rejects.toBeInstanceOf(RegenVisualiseringFejl);
    expect(await ledger.hentSaldo("user-1")).toBe(foer);
  });

  it("samme requestId to gange koster kun én gang (E-4)", async () => {
    const { deps, ledger } = await leveretOpsaetning();
    const foer = await ledger.hentSaldo("user-1");

    await koerRegenerering(deps, "item-1", "tekst", { requestId: "req-4" });
    await koerRegenerering(deps, "item-1", "tekst", { requestId: "req-4" });

    expect(await ledger.hentSaldo("user-1")).toBe(foer - kreditter.prisRegenerering);
  });

  it("loftet pr. del håndhæves", async () => {
    const { deps } = await leveretOpsaetning();
    // Originalen tæller som 1 — kør op til loftet
    for (let i = 1; i < misbrugsvaern.maksGenereringerPrDel; i++) {
      await koerRegenerering(deps, "item-1", "tekst", { requestId: `req-loft-${i}` });
    }
    await expect(
      koerRegenerering(deps, "item-1", "tekst", { requestId: "req-loft-sidste" }),
    ).rejects.toBeInstanceOf(RegenGraenseFejl);
  });
});
