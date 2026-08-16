import { describe, expect, it } from "vitest";
import {
  MAERKER,
  POPULAERE_MAERKER,
  normaliserMaerkeSoegning,
  soegMaerker,
} from "@/lib/data/maerker";
import { VAREGRUPPER } from "@/lib/data/varetyper";

describe("mærkekatalog", () => {
  it("har mindst 300 unikke, alfabetisk eksponerede mærker", () => {
    expect(MAERKER.length).toBeGreaterThanOrEqual(300);
    expect(new Set(MAERKER).size).toBe(MAERKER.length);
    expect(MAERKER).toEqual([...MAERKER].sort((a, b) => a.localeCompare(b, "da")));
  });

  it("har otte eksisterende populære mærker for hver gruppe", () => {
    for (const gruppe of VAREGRUPPER) {
      expect(POPULAERE_MAERKER[gruppe.id]).toHaveLength(8);
      for (const maerke of POPULAERE_MAERKER[gruppe.id]) {
        expect(MAERKER).toContain(maerke);
      }
    }
  });
});

describe("normaliserMaerkeSoegning", () => {
  it.each([
    ["Samsøe & Samsøe", "samsoe samsoe"],
    ["Levi's", "levis"],
    ["RÉSUMÉ", "resume"],
    ["  Marc   O’Polo ", "marc opolo"],
  ])("%s bliver %s", (input, forventet) => {
    expect(normaliserMaerkeSoegning(input)).toBe(forventet);
  });
});

describe("soegMaerker", () => {
  it("finder danske bogstaver, apostroffer og kompakt tegnsætning", () => {
    expect(soegMaerker("samsoe")).toContain("Samsøe Samsøe");
    expect(soegMaerker("levis")).toContain("Levi's");
    expect(soegMaerker("hm")).toContain("H&M");
    expect(soegMaerker("resume")).toContain("Résumé");
  });

  it("rangerer eksakt før start, ord-start og delmatch", () => {
    expect(soegMaerker("Nike")[0]).toBe("Nike");
    expect(soegMaerker("Ralph")[0]).toBe("Ralph Lauren");
    expect(soegMaerker("Lauren").indexOf("Ralph Lauren")).toBeLessThan(
      soegMaerker("Lauren").indexOf("Polo Ralph Lauren"),
    );
  });

  it("viser gruppens populære mærker ved tom søgning", () => {
    expect(soegMaerker("", "boern-baby")).toEqual(
      POPULAERE_MAERKER["boern-baby"],
    );
    expect(soegMaerker("  ", "sko")).toEqual(POPULAERE_MAERKER.sko);
  });

  it("returnerer aldrig flere end ti og kan returnere ingen", () => {
    expect(soegMaerker("a", "toej", 50).length).toBeLessThanOrEqual(10);
    expect(soegMaerker("ikke-et-rigtigt-maerke")).toEqual([]);
  });
});
