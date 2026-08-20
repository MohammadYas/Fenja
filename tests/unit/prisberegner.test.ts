import { describe, expect, it } from "vitest";
import { beregnPris, HOEST_PRESETS } from "@/lib/prisberegner";
import { hentPopulaere } from "@/lib/eksperimenter";

// Prisberegneren er kalibreret mod markedshøsten: estimatet for hver
// høst-søgnings preset (i god stand) skal ramme inden for ±40 % af den
// faktiske median — ellers er faktortabellen drevet ud af sync med data.
describe("prisberegner", () => {
  it("giver et fornuftigt interval med fra < median < til", () => {
    const e = beregnPris("kjole", "premium", "god");
    expect(e.fraDkk).toBeLessThan(e.medianDkk);
    expect(e.medianDkk).toBeLessThan(e.tilDkk);
    expect(e.fraDkk).toBeGreaterThan(0);
  });

  it("bedre stand og dyrere mærke giver højere pris", () => {
    const slidt = beregnPris("jeans", "budget", "slidt");
    const ny = beregnPris("jeans", "designer", "nyMedMaerke");
    expect(ny.medianDkk).toBeGreaterThan(slidt.medianDkk);
  });

  it("er kalibreret mod høstens medianer (±40 %)", () => {
    const hoest = hentPopulaere(100);
    for (const [soegning, preset] of Object.entries(HOEST_PRESETS)) {
      const punkt = hoest.find((m) => m.soegetekst === soegning);
      if (!punkt) continue; // søgningen kan udgå af fremtidige høster
      const estimat = beregnPris(preset.kategori, preset.tier, "god");
      const afvigelse =
        Math.abs(estimat.medianDkk - punkt.medianDkk) / punkt.medianDkk;
      expect(afvigelse, `${soegning}: estimat ${estimat.medianDkk} vs. høst ${punkt.medianDkk}`).toBeLessThanOrEqual(0.4);
    }
  });
});
