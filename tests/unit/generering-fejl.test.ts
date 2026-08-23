// Fejl ved billedgenerering skal kunne SES i admin (ejer-ordre 23/8 aften)
// — ikke kun stå som status "failed" med årsagen tabt i serverloggen.
// Kæden der låses her: provider-/troskabsfejl → generations.fejl → admin.

import { describe, expect, it } from "vitest";
import { registrerKoeb, reserverVisninger } from "@/lib/credits/ledger";
import { MemoryLedgerDb } from "@/lib/credits/memory";
import { koerItemPipeline } from "@/lib/pipeline/run";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";
import { FakePipelineDb, FakePipelineStorage } from "../fakes/pipeline-fakes";

async function opsaetning(mock: {
  onModelFejler?: boolean;
  troskabsScore?: number;
} = {}) {
  const db = new FakePipelineDb();
  const ledger = new MemoryLedgerDb();
  await registrerKoeb(ledger, "user-1", 10, "evt_seed");
  await reserverVisninger(ledger, "user-1", "item-1", ["spejl"]);
  return {
    deps: {
      db,
      storage: new FakePipelineStorage(),
      image: new MockImageProvider(mock),
      text: new MockTextProvider(mock),
      ledger,
    },
    db,
  };
}

describe("fejltekst på fejlede genereringer (admin, 23/8)", () => {
  it("provider-fejl: årsagen står på generations-rækken", async () => {
    const { deps, db } = await opsaetning({ onModelFejler: true });
    await koerItemPipeline(deps, "item-1");

    const fejlet = db.generings.find(
      (g) => g.kind === "onmodel" && g.status === "failed",
    );
    expect(fejlet).toBeDefined();
    // Mock-provideren kaster "mock: on-model-generering fejlede" — netop den
    // tekst skal admin kunne se
    expect(fejlet!.fejl).toContain("on-model-generering fejlede");
  });

  it("troskab under tærsklen: fejlteksten siger det, med scores", async () => {
    // Billeder genereres fint, men kasseres af troskabs-tjekket (B-6)
    const { deps, db } = await opsaetning({ troskabsScore: 0.2 });
    await koerItemPipeline(deps, "item-1");

    const fejlet = db.generings.find(
      (g) => g.kind === "onmodel" && g.status === "failed",
    );
    expect(fejlet).toBeDefined();
    expect(fejlet!.fejl).toContain("troskab under tærsklen");
    expect(fejlet!.fejl).toContain("0.20");
  });

  it("vellykkede genereringer har INGEN fejltekst", async () => {
    const { deps, db } = await opsaetning();
    await koerItemPipeline(deps, "item-1");

    for (const g of db.generings.filter((g) => g.status === "succeeded")) {
      expect(g.fejl).toBeUndefined();
    }
  });
});
