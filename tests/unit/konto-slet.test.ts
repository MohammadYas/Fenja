import { describe, expect, it } from "vitest";
import {
  findBrugerensFiler,
  sletBrugerensFiler,
  type StorageMappe,
  type StorageOprydning,
} from "@/lib/konto/slet";

// A-4/art. 17: "fuld sletning inden 24 timer" skal også holde for en sælger med
// mange annoncer. Supabase' list() giver 100 rækker ad gangen — uden paginering
// bliver resten liggende i bucket'en.

const BRUGER = "bruger-1";

class FakeStorage implements StorageOprydning {
  fjernede: string[] = [];
  removeKald = 0;

  constructor(private indhold: Record<string, StorageMappe[]>) {}

  async list(sti: string, opts: { limit: number; offset: number }) {
    const alle = this.indhold[sti] ?? [];
    return { data: alle.slice(opts.offset, opts.offset + opts.limit) };
  }

  async remove(
    stier: string[],
  ): Promise<{ data: unknown; error: { message: string } | null }> {
    this.removeKald++;
    this.fjernede.push(...stier);
    return { data: null, error: null };
  }
}

function mapper(antal: number): StorageMappe[] {
  return Array.from({ length: antal }, (_, i) => ({ name: `item-${i}`, id: null }));
}

function medItems(antal: number): FakeStorage {
  const indhold: Record<string, StorageMappe[]> = { [BRUGER]: mapper(antal) };
  for (let i = 0; i < antal; i++) {
    indhold[`${BRUGER}/item-${i}`] = [
      { name: "original-full.jpg", id: "f1" },
      { name: "visualisering-1.jpg", id: "f2" },
    ];
  }
  return new FakeStorage(indhold);
}

describe("oprydning i storage ved kontosletning (A-4)", () => {
  it("finder filerne i alle mapper, ikke kun de første 100", async () => {
    const storage = medItems(250);
    const filer = await findBrugerensFiler(storage, BRUGER);
    expect(filer).toHaveLength(500);
    expect(filer).toContain(`${BRUGER}/item-249/visualisering-1.jpg`);
  });

  it("sletter alt — også når det kræver flere kald", async () => {
    const storage = medItems(250);
    const antal = await sletBrugerensFiler(storage, BRUGER);
    expect(antal).toBe(500);
    expect(storage.fjernede).toHaveLength(500);
    expect(storage.removeKald).toBe(5);
  });

  it("tager også filer, der ligger direkte i brugerens mappe", async () => {
    const storage = new FakeStorage({
      [BRUGER]: [
        { name: "løs-fil.jpg", id: "f9" },
        { name: "item-1", id: null },
      ],
      [`${BRUGER}/item-1`]: [{ name: "original-full.jpg", id: "f1" }],
    });
    expect(await findBrugerensFiler(storage, BRUGER)).toEqual([
      `${BRUGER}/løs-fil.jpg`,
      `${BRUGER}/item-1/original-full.jpg`,
    ]);
  });

  it("tom mappe giver ingen kald til remove", async () => {
    const storage = new FakeStorage({});
    expect(await sletBrugerensFiler(storage, BRUGER)).toBe(0);
    expect(storage.removeKald).toBe(0);
  });

  it("en fejl fra remove stopper sletningen med en tydelig besked", async () => {
    const storage = medItems(1);
    storage.remove = async () => ({ data: null, error: { message: "netværksfejl" } });
    await expect(sletBrugerensFiler(storage, BRUGER)).rejects.toThrow("netværksfejl");
  });
});
