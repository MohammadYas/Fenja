import { describe, expect, it } from "vitest";
import { kreditter } from "@/lib/config";
import { registrerKoeb } from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";
import { koerItemPipeline } from "@/lib/pipeline/run";
import {
  VISNINGS_TYPER,
  eksempelBillede,
  normaliserVisningsvalg,
} from "@/lib/pipeline/visninger";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";
import { FakePipelineDb, FakePipelineStorage } from "../fakes/pipeline-fakes";

// Ejer-ordre 2026-08-20: brugeren vælger selv visningerne; 1 kredit pr. billede.

const STARTSALDO = 10;

async function opsaetning(mock: { onModelFejler?: boolean } = {}) {
  const db = new FakePipelineDb();
  const ledger = new MemoryLedgerDb();
  await registrerKoeb(ledger, "user-1", STARTSALDO, "evt_seed");
  return {
    deps: {
      db,
      storage: new FakePipelineStorage(),
      image: new MockImageProvider(mock),
      text: new MockTextProvider(mock),
      ledger,
    },
    db,
    ledger,
  };
}

describe("visningsvalg (ejer-ordre 20/8)", () => {
  it("normaliserer råt input: dedupliker, ukendte ryger, ikke-arrays giver []", () => {
    expect(
      normaliserVisningsvalg(["spejl", "gulv", "spejl", "ukendt"]).map((v) => v.id),
    ).toEqual(["spejl", "gulv"]);
    expect(normaliserVisningsvalg("spejl")).toEqual([]);
    expect(normaliserVisningsvalg(undefined)).toEqual([]);
  });

  it("hver visningstype har et eksempelbillede pr. kategori", () => {
    for (const type of VISNINGS_TYPER) {
      for (const kategori of ["Jeans", "Kjole", "Striktrøje", "Taske", "Andet"]) {
        expect(eksempelBillede(type.id, kategori)).toMatch(
          /^\/eksempler\/katalog\/.+\.webp$/,
        );
      }
    }
  });

  it("tre valgte visninger giver tre onmodel-generinger og tre kreditter", async () => {
    const { deps, db, ledger } = await opsaetning();
    const resultat = await koerItemPipeline(deps, "item-1", undefined, [
      "spejl",
      "gulv",
      "stativ",
    ]);

    expect(resultat.visualiseringer.map((v) => v.visningId).sort()).toEqual([
      "gulv",
      "spejl",
      "stativ",
    ]);
    expect(db.generings.filter((g) => g.kind === "onmodel")).toHaveLength(3);
    // 1 kredit pr. billede: basiskredit + 2 ekstra
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - 3 * kreditter.prisPrAnnonce,
    );
  });

  it("genkørsel med flere visninger trækker ikke dobbelt (E-4)", async () => {
    const { deps, ledger } = await opsaetning();
    await koerItemPipeline(deps, "item-1", undefined, ["spejl", "gulv"]);
    await koerItemPipeline(deps, "item-1", undefined, ["spejl", "gulv"]);
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - 2 * kreditter.prisPrAnnonce,
    );
  });

  it("fejler alle billeder, refunderes basiskreditten og intet ekstra trækkes", async () => {
    const { deps, ledger } = await opsaetning({ onModelFejler: true });
    const resultat = await koerItemPipeline(deps, "item-1", undefined, [
      "spejl",
      "gulv",
    ]);
    expect(resultat.refunderet).toBe(true);
    expect(resultat.visualiseringer).toEqual([]);
    expect(await ledger.hentSaldo("user-1")).toBe(STARTSALDO);
  });

  it("uden valg køres præcis ét billede (bagudkompatibelt)", async () => {
    const { deps, db, ledger } = await opsaetning();
    await koerItemPipeline(deps, "item-1");
    expect(db.generings.filter((g) => g.kind === "onmodel")).toHaveLength(1);
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - kreditter.prisPrAnnonce,
    );
  });

  it("prompt_version bærer visnings-tagget", async () => {
    const { deps, db } = await opsaetning();
    await koerItemPipeline(deps, "item-1", undefined, ["gulv"]);
    const onmodel = db.generings.find((g) => g.kind === "onmodel");
    expect(onmodel?.promptVersion).toContain("gulv@v1");
  });
});
