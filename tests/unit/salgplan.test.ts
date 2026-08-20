import { describe, expect, it } from "vitest";
import {
  bygSalgsplan,
  MAKS_PUNKTER,
  type PlanInputItem,
} from "@/lib/salg/smart-plan";
import { SAESON, erHoesason, maanedsnavn, naesteHoesason } from "@/lib/salg/saeson";
import { KATEGORI_SKABELONER } from "@/lib/pipeline/skabeloner";

// Smart Salgsplan (ejer-ordre 20/8): reglerne testes mod faste datoer og den
// committede markedshøst (Carhartt jakke: p25 309 / median 450 / p75 738).

function item(overrides: Partial<PlanInputItem>): PlanInputItem {
  return {
    id: "i1",
    titel: "Carhartt jakke",
    maerke: "Carhartt",
    kategori: "Jakke",
    status: "active",
    leveretAt: null,
    prisTilDkk: null,
    ...overrides,
  };
}

const DAGE = 86_400_000;

// Fast "nu": 20. august — bukser/jakker er i lavsæson (højsæson 9-2),
// kjoler er i højsæson (4-8)
const NU = new Date("2026-08-20T12:00:00Z");
const LIGGET_LANGE = new Date(NU.getTime() - 21 * DAGE).toISOString();

describe("sæson-tabellen", () => {
  it("dækker ALLE kategori-skabeloner med mindst én måned", () => {
    for (const skabelon of KATEGORI_SKABELONER) {
      const saeson = SAESON[skabelon.id];
      expect(saeson, `mangler sæson for ${skabelon.id}`).toBeDefined();
      expect(saeson!.bedsteMaaneder.length).toBeGreaterThan(0);
    }
  });

  it("august: kjole er højsæson, jakke er det ikke", () => {
    expect(erHoesason("kjole", 8)).toBe(true);
    expect(erHoesason("jakke", 8)).toBe(false);
  });

  it("naesteHoesason finder september for jakker fra august", () => {
    expect(naesteHoesason("jakke", 8)).toEqual({ maanederTil: 1, maaned: 9 });
  });

  it("månedsnavne er danske og 1-baserede", () => {
    expect(maanedsnavn(1)).toBe("januar");
    expect(maanedsnavn(12)).toBe("december");
  });
});

describe("salgsplanens regler", () => {
  it("annonce der har ligget længe over markedets median → 'sæt ned' med konkret tal", () => {
    const plan = bygSalgsplan(
      [
        item({
          leveretAt: LIGGET_LANGE,
          prisTilDkk: 600, // over median 450
        }),
      ],
      NU,
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]!.handling).toBe("saetNed");
    expect(plan[0]!.foreslaaetPrisDkk).toBe(450); // 600 > median 450, men under p75 738
    expect(plan[0]!.tekst).toContain("21 dage");
  });

  it("annonce under medianen får ingen prisanbefaling — men sæsonen taler", () => {
    const plan = bygSalgsplan(
      [item({ leveretAt: LIGGET_LANGE, prisTilDkk: 200, kategori: "Kjole", maerke: "Ganni" })],
      NU,
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]!.handling).toBe("saelgNu"); // kjole er højsæson i august
  });

  it("aktiv annonce langt fra sæsonen får 'vent' med den bedste måned", () => {
    const plan = bygSalgsplan(
      [item({ leveretAt: LIGGET_LANGE, prisTilDkk: 200 })], // jakke, under median
      new Date("2026-05-20T12:00:00Z"), // maj — jakkesæsonen starter september
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]!.handling).toBe("vent");
    expect(plan[0]!.tekst).toContain("september");
  });

  it("kladde tæt på sæsonen → 'klargør'", () => {
    const plan = bygSalgsplan(
      [item({ status: "draft", leveretAt: null, kategori: "Kjole" })],
      new Date("2026-03-01T12:00:00Z"), // marts — kjolesæsonen starter april
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]!.handling).toBe("klarGoer");
    expect(plan[0]!.tekst).toContain("1 måned");
  });

  it("kladde med kørende pipeline rådgives ikke endnu", () => {
    const plan = bygSalgsplan(
      [item({ status: "draft", paaVej: true, kategori: "Kjole" })],
      NU,
    );
    expect(plan).toHaveLength(0);
  });

  it("solgte annoncer er ude af planen", () => {
    const plan = bygSalgsplan(
      [item({ status: "sold", leveretAt: LIGGET_LANGE, prisTilDkk: 600 })],
      NU,
    );
    expect(plan).toHaveLength(0);
  });

  it("planen er prioriteret: sælg nu > sæt ned > klargør > vent", () => {
    const NU_MARTS = new Date("2026-03-20T12:00:00Z");
    const LIGGET_TIL_MARTS = new Date(NU_MARTS.getTime() - 21 * DAGE).toISOString();
    const plan = bygSalgsplan(
      [
        // vent: jakke i marts (sæsonen starter september = 6 mdr. væk)
        item({ id: "a", titel: "venter", leveretAt: LIGGET_TIL_MARTS, prisTilDkk: 200 }),
        // sælg nu: overdel er i sæson i marts, og den har ikke ligget længe
        item({
          id: "b",
          titel: "sælges nu",
          kategori: "Striktrøje",
          maerke: "Ganni",
          leveretAt: new Date(NU_MARTS.getTime() - 2 * DAGE).toISOString(),
          prisTilDkk: 200,
        }),
        // sæt ned: lang liggetid + pris over medianen (vinder over sæson)
        item({
          id: "c",
          titel: "sættes ned",
          leveretAt: LIGGET_TIL_MARTS,
          prisTilDkk: 600,
        }),
        // klargør: kjole-draft lige før sæsonen starter i april
        item({
          id: "d",
          titel: "klargøres",
          status: "draft",
          kategori: "Kjole",
        }),
      ],
      NU_MARTS,
    );
    expect(plan.map((p) => p.handling)).toEqual([
      "saelgNu",
      "saetNed",
      "klarGoer",
      "vent",
    ]);
  });

  it("planen kappes ved MAKS_PUNKTER", () => {
    const mange = Array.from({ length: 12 }, (_, i) =>
      item({
        id: `i${i}`,
        titel: `jakke ${i}`,
        leveretAt: LIGGET_LANGE,
        prisTilDkk: 600,
      }),
    );
    const plan = bygSalgsplan(mange, NU);
    expect(plan.length).toBe(MAKS_PUNKTER);
  });
});
