import { describe, expect, it } from "vitest";
import { RADAR_ANTAL, bygRadar } from "@/lib/salg/radar";
import { bygSalgsstatistik } from "@/lib/salg/statistik";

// Garderobe-radar + salgsstatistik (abonnent-fordele, 21/8) — rene funktioner.

describe("bygRadar", () => {
  it("leverer højst RADAR_ANTAL punkter med sæson-tekst og medianpris", () => {
    const punkter = bygRadar(new Date("2026-08-21T12:00:00Z"));
    expect(punkter.length).toBeGreaterThan(0);
    expect(punkter.length).toBeLessThanOrEqual(RADAR_ANTAL);
    for (const punkt of punkter) {
      expect(punkt.medianDkk).toBeGreaterThan(0);
      expect(punkt.saesonTekst.length).toBeGreaterThan(0);
    }
  });

  it("sætter punkter i sæson før alt andet", () => {
    const punkter = bygRadar(new Date("2026-08-21T12:00:00Z"));
    const foersteUdenSaeson = punkter.findIndex((p) => !p.iSaeson);
    if (foersteUdenSaeson === -1) return; // alle i sæson — fint
    for (const punkt of punkter.slice(foersteUdenSaeson)) {
      expect(punkt.iSaeson).toBe(false);
    }
  });
});

describe("bygSalgsstatistik", () => {
  const solgt = {
    status: "sold" as const,
    soldPrisDkk: 200,
    solgtAt: "2026-08-10T00:00:00Z",
    leveretAt: "2026-08-01T00:00:00Z",
    createdAt: "2026-07-30T00:00:00Z",
    maerke: "Levi's",
    kategori: "Jeans",
    prisTilDkk: null,
  };

  it("regner solgt sum, median-liggetid og bedste kategori", () => {
    const stat = bygSalgsstatistik([
      solgt,
      { ...solgt, soldPrisDkk: 100, kategori: "Skjorte" },
    ]);
    expect(stat.solgtAntal).toBe(2);
    expect(stat.solgtSumDkk).toBe(300);
    expect(stat.medianLiggetidDage).toBe(9);
    expect(stat.bedsteKategori).toEqual({ navn: "Jeans", sumDkk: 200 });
  });

  it("aktiv værdi bruger prisforslaget og falder tilbage til markeds-medianen", () => {
    const stat = bygSalgsstatistik([
      { ...solgt, status: "active", soldPrisDkk: null, solgtAt: null, prisTilDkk: 150 },
      // Levi's jeans findes i markedshøsten — fallback skal give > 0
      { ...solgt, status: "active", soldPrisDkk: null, solgtAt: null, prisTilDkk: null },
    ]);
    expect(stat.aktivAntal).toBe(2);
    expect(stat.aktivVaerdiDkk).toBeGreaterThan(150);
  });

  it("tom liste giver nul-statistik uden fejl", () => {
    const stat = bygSalgsstatistik([]);
    expect(stat.solgtAntal).toBe(0);
    expect(stat.medianLiggetidDage).toBeNull();
    expect(stat.bedsteKategori).toBeNull();
    expect(stat.aktivVaerdiDkk).toBe(0);
  });
});
