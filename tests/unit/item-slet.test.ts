import { describe, expect, it } from "vitest";
import { sletItemsFiler, type ItemStorageOprydning } from "@/lib/item/slet";
import type { StorageMappe } from "@/lib/konto/slet";

// Sletning af et item (ejer-ordre 20/8): alle filer under <userId>/<itemId>
// skal væk — pagineret, så funktionen også holder hvis stistrukturen vokser.

class FakeStorage implements ItemStorageOprydning {
  fjernede: string[] = [];
  removeKald = 0;
  fejlVedRemove = false;

  constructor(private indhold: Record<string, StorageMappe[]>) {}

  async list(sti: string, opts: { limit: number; offset: number }) {
    const alle = this.indhold[sti] ?? [];
    return { data: alle.slice(opts.offset, opts.offset + opts.limit) };
  }

  async remove(stier: string[]) {
    this.removeKald++;
    this.fjernede.push(...stier);
    return {
      data: null,
      error: this.fejlVedRemove ? { message: "bucket nede" } : null,
    };
  }
}

describe("sletning af ét item (ejer-ordre 20/8)", () => {
  it("fjerner alle filer under annoncens mappe", async () => {
    const storage = new FakeStorage({
      "u1/i1": [
        { name: "renset-f1.jpg", id: "f1" },
        { name: "visualisering-1.jpg", id: "f2" },
      ],
    });
    const antal = await sletItemsFiler(storage, "u1", "i1");
    expect(antal).toBe(2);
    expect(storage.fjernede).toEqual([
      "u1/i1/renset-f1.jpg",
      "u1/i1/visualisering-1.jpg",
    ]);
  });

  it("tom mappe giver ingen remove-kald", async () => {
    const storage = new FakeStorage({});
    expect(await sletItemsFiler(storage, "u1", "i9")).toBe(0);
    expect(storage.removeKald).toBe(0);
  });

  it("en fejl i remove kastes videre — intet bliver stille slettet", async () => {
    const storage = new FakeStorage({
      "u1/i1": [{ name: "a.jpg", id: "f1" }],
    });
    storage.fejlVedRemove = true;
    await expect(sletItemsFiler(storage, "u1", "i1")).rejects.toThrow(
      "Kunne ikke slette annoncens billeder",
    );
  });
});
