import { describe, expect, it } from "vitest";
import {
  VAREGRUPPER,
  VARETYPER,
  hentVaretype,
  hentVaretypeFraKategori,
  hentVaretyperForGruppe,
  type PromptFamilie,
} from "@/lib/data/varetyper";

const PROMPTFAMILIER: readonly PromptFamilie[] = [
  "overdel",
  "underdel",
  "kjole",
  "overtoej",
  "sport-bad",
  "undertoej-nattoej",
  "sko",
  "taske",
  "accessory",
  "barn-produkt",
];

describe("varetypekatalog", () => {
  it("har fem grupper og præcis 27 brede varetyper", () => {
    expect(VAREGRUPPER.map((gruppe) => gruppe.id)).toEqual([
      "toej",
      "sko",
      "tasker",
      "accessories",
      "boern-baby",
    ]);
    expect(VARETYPER).toHaveLength(27);
  });

  it("har unikke id'er og kanoniske kategorier", () => {
    expect(new Set(VARETYPER.map((varetype) => varetype.id)).size).toBe(27);
    expect(new Set(VARETYPER.map((varetype) => varetype.kategori)).size).toBe(27);
  });

  it("refererer kun til kendte grupper og promptfamilier", () => {
    const gruppeIds = new Set(VAREGRUPPER.map((gruppe) => gruppe.id));
    for (const varetype of VARETYPER) {
      expect(gruppeIds.has(varetype.gruppeId)).toBe(true);
      expect(PROMPTFAMILIER).toContain(varetype.promptFamilie);
    }
  });

  it("returnerer gruppens egne varetyper i katalogrækkefølge", () => {
    expect(hentVaretyperForGruppe("sko").map((varetype) => varetype.label)).toEqual([
      "Sneakers",
      "Sko",
      "Støvler",
      "Sandaler",
    ]);
    expect(hentVaretyperForGruppe("ukendt")).toEqual([]);
  });

  it("giver hver af de fem grupper mindst én af sine egne varetyper", () => {
    for (const gruppe of VAREGRUPPER) {
      const varetyper = hentVaretyperForGruppe(gruppe.id);
      expect(varetyper.length).toBeGreaterThan(0);
      expect(varetyper.every((varetype) => varetype.gruppeId === gruppe.id)).toBe(
        true,
      );
    }
  });

  it("slår id og kanonisk kategori op", () => {
    expect(hentVaretype("boern-toej")).toMatchObject({
      label: "Tøj",
      kategori: "Børne- og babytøj",
      promptFamilie: "barn-produkt",
    });
    expect(hentVaretypeFraKategori(" Børne- og babytøj ")?.id).toBe("boern-toej");
    expect(hentVaretype("ukendt")).toBeUndefined();
    expect(hentVaretypeFraKategori("gammel fritekst")).toBeUndefined();
  });
});
