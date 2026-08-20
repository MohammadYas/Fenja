import { describe, expect, it } from "vitest";
import { beregnPris, bygTitel, HOEST_PRESETS, prisZone } from "@/lib/prisberegner";
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

  it("pris-zoner dækker hele skalaen i rækkefølge", () => {
    const e = beregnPris("kjole", "premium", "god");
    expect(prisZone(e.fraDkk - 5, e)).toBe("hurtig");
    expect(prisZone(e.medianDkk, e)).toBe("balance");
    expect(prisZone(e.tilDkk, e)).toBe("taalmodig");
    expect(prisZone(e.tilDkk + 5, e)).toBe("over");
  });

  it("bygger søgbare titler med og uden valgfrie felter", () => {
    expect(
      bygTitel({ kategori: "kjole", maerke: "Ganni", farve: "grøn", stoerrelse: "S" }),
    ).toBe("Ganni kjole · grøn · str. S");
    expect(bygTitel({ kategori: "jeans", maerke: "Weekday" })).toBe("Weekday jeans");
    expect(bygTitel({ kategori: "sneakers", maerke: " Nike ", farve: "" })).toBe(
      "Nike sneakers",
    );
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
