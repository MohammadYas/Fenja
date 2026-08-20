import { describe, expect, it } from "vitest";
import { kreditter, misbrugsvaern } from "@/lib/config";
import { registrerKoeb, reserverVisninger } from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";

// Gratis-tier er slået fra (ejer-beslutning) — testene seeder saldo via køb
const STARTSALDO = 10;
import { BudgetloftFejl, koerItemPipeline } from "@/lib/pipeline/run";
import {
  HJEM,
  hjemVersionsTag,
  skabelonVersionsTag,
  vaelgHjem,
  vaelgSkabelon,
} from "@/lib/pipeline/skabeloner";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";
import { FakePipelineDb, FakePipelineStorage, testItem } from "../fakes/pipeline-fakes";

async function opsaetning(mock: {
  onModelFejler?: boolean;
  troskabsScore?: number;
  tekstFejler?: boolean;
} = {}) {
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

describe("item-pipelinen ende-til-ende mod mocks (S5)", () => {
  it("fuld leverance: rens + visualisering + tekst, kredit trukket", async () => {
    const { deps, db, ledger } = await opsaetning();
    // Ejer-ordre 20/8: kreditten reserveres ved oprettelsen (som API'et gør)
    await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]);
    const resultat = await koerItemPipeline(deps, "item-1");

    expect(resultat.rensede).toHaveLength(2);
    expect(resultat.visualisering).not.toBeNull();
    expect(resultat.tekst?.beskrivelse).toContain("lille hul");
    expect(resultat.refunderet).toBe(false);
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - kreditter.prisPrAnnonce,
    );
    expect(db.leverede).toContain("item-1");
    // Omkostningslog pr. generering (G-1)
    const kinds = db.generings.map((g) => g.kind).sort();
    expect(kinds).toEqual(["cleanup", "onmodel", "text"]);
    expect(db.generings.every((g) => g.status === "succeeded")).toBe(true);
  });

  it("delvis leverance (B-6): fejlet visualisering → rens+tekst leveres, kredit refunderes", async () => {
    const { deps, db, ledger } = await opsaetning({ onModelFejler: true });
    await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]);
    const resultat = await koerItemPipeline(deps, "item-1");

    expect(resultat.visualisering).toBeNull();
    expect(resultat.refunderet).toBe(true);
    expect(resultat.tekst?.titel).toContain("Ganni");
    // Netto nul: træk + refund
    expect(await ledger.hentSaldo("user-1")).toBe(STARTSALDO);
    expect(db.generings.find((g) => g.kind === "onmodel")?.status).toBe("failed");
  });

  it("lav troskab efter retry giver samme delvise leverance (C-3)", async () => {
    const { deps } = await opsaetning({ troskabsScore: 0.2 });
    const resultat = await koerItemPipeline(deps, "item-1");
    expect(resultat.visualisering).toBeNull();
    expect(resultat.refunderet).toBe(true);
  });

  it("tekst-fejl vælter IKKE billederne (bulletproof 20/8): billeder leveres, item markeres leveret", async () => {
    const { deps, db, ledger } = await opsaetning({ tekstFejler: true });
    await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]);
    const resultat = await koerItemPipeline(deps, "item-1");

    expect(resultat.tekst).toBeNull();
    expect(resultat.visualisering).not.toBeNull();
    expect(db.leverede).toContain("item-1");
    // Kreditten for billedet er trukket (ikke refunderet) — kun teksten mangler
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - kreditter.prisPrAnnonce,
    );
  });

  it("genkørsel trækker ikke dobbelt (E-4/NFR-10)", async () => {
    const { deps, ledger } = await opsaetning();
    await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]);
    await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]); // idempotent
    await koerItemPipeline(deps, "item-1");
    await koerItemPipeline(deps, "item-1"); // retry af hele jobbet
    expect(await ledger.hentSaldo("user-1")).toBe(
      STARTSALDO - kreditter.prisPrAnnonce,
    );
  });

  it("budgetloftet stopper nye kørsler (E-5 kill-switch)", async () => {
    const { deps, db } = await opsaetning();
    db.dagensForbrug = misbrugsvaern.dagligtBudgetloftDkk;
    await expect(koerItemPipeline(deps, "item-1")).rejects.toThrow(BudgetloftFejl);
  });

  it("prompt_version registrerer preset + skabelon + valgt hjem (FR-15/S31)", async () => {
    const valgtHjem = HJEM.find((h) => h.id !== vaelgHjem("user-1").id)!;
    const db = new FakePipelineDb(
      testItem({ kategori: "Kjole", hjemAnker: valgtHjem.id }),
    );
    const ledger = new MemoryLedgerDb();
    await registrerKoeb(ledger, "user-1", STARTSALDO, "evt_seed");
    await koerItemPipeline(
      {
        db,
        storage: new FakePipelineStorage(),
        image: new MockImageProvider(),
        text: new MockTextProvider(),
        ledger,
      },
      "item-1",
    );

    const onmodel = db.generings.find((g) => g.kind === "onmodel");
    expect(onmodel?.promptVersion).toContain(skabelonVersionsTag(vaelgSkabelon("Kjole")));
    expect(onmodel?.promptVersion).toContain(hjemVersionsTag(valgtHjem));
  });

  it("visualiseringen i storage er ren JPEG uden egen mærkning (ejer-beslutning 20/8)", async () => {
    const { deps } = await opsaetning();
    const resultat = await koerItemPipeline(deps, "item-1");
    const storage = deps.storage as FakePipelineStorage;
    const gemt = storage.gemte.get(resultat.visualisering!.sti);
    expect(gemt).toBeDefined();
    const sharp = (await import("sharp")).default;
    const meta = await sharp(gemt!).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.exif?.toString("utf8") ?? "").not.toContain("AI-genereret");
  });
});
