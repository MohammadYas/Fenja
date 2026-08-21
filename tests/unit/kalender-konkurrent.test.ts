import { describe, expect, it } from "vitest";
import { bygSaesonKalender } from "@/lib/salg/kalender";
import { bygKonkurrentTjek } from "@/lib/salg/konkurrent";

// Sæson-kalender (alle abonnenter) + konkurrent-tjek (Pro) — 21/8.

const NU = new Date("2026-08-21T12:00:00Z"); // august

describe("bygSaesonKalender", () => {
  const striktrooje = {
    id: "i1",
    titel: "Blå striktrøje",
    kategori: "Striktrøje",
    status: "active" as const,
  };

  it("giver 12 måneder der starter med nu, og placerer tøjet i dets sæson", () => {
    const kalender = bygSaesonKalender([striktrooje], NU);
    expect(kalender).toHaveLength(12);
    expect(kalender[0]!.maaned).toBe(8);
    expect(kalender[0]!.erNu).toBe(true);
    // Strik topper i efterår/vinter — titlen skal optræde i mindst én måned
    const medTitel = kalender.filter((m) => m.titler.includes("Blå striktrøje"));
    expect(medTitel.length).toBeGreaterThan(0);
    // …og aldrig i juli
    expect(kalender.find((m) => m.maaned === 7)?.titler).not.toContain("Blå striktrøje");
  });

  it("solgte annoncer optræder aldrig, og overskydende titler tælles", () => {
    const mange = Array.from({ length: 6 }, (_, i) => ({
      ...striktrooje,
      id: `i${i}`,
      titel: `Strik ${i}`,
    }));
    const kalender = bygSaesonKalender(
      [...mange, { ...striktrooje, id: "solgt", titel: "Solgt strik", status: "sold" as const }],
      NU,
    );
    const december = kalender.find((m) => m.maaned === 12)!;
    expect(december.titler.length).toBeLessThanOrEqual(4);
    expect(december.flere).toBe(2);
    for (const m of kalender) expect(m.titler).not.toContain("Solgt strik");
  });
});

describe("bygKonkurrentTjek", () => {
  // Levi's jeans findes i den committede markedshøst
  const jeans = {
    id: "i1",
    titel: "Levi's 501",
    maerke: "Levi's",
    kategori: "Jeans",
    status: "active" as const,
    prisTilDkk: 10_000,
  };

  it("placerer en skyhøj pris som dyrest med et konkret råd", () => {
    const punkter = bygKonkurrentTjek([jeans]);
    expect(punkter).toHaveLength(1);
    expect(punkter[0]!.position).toBe("dyrest");
    expect(punkter[0]!.tekst).toContain("kr.");
    expect(punkter[0]!.medianDkk).toBeGreaterThan(0);
  });

  it("pris i bunden er billigst, og dyrest sorteres først", () => {
    const punkter = bygKonkurrentTjek([
      { ...jeans, id: "billig", prisTilDkk: 1 },
      jeans,
    ]);
    expect(punkter[0]!.position).toBe("dyrest");
    expect(punkter[1]!.position).toBe("billigst");
  });

  it("springer annoncer over uden pris, uden marked eller som er solgt", () => {
    expect(
      bygKonkurrentTjek([
        { ...jeans, prisTilDkk: null },
        { ...jeans, id: "ukendt", maerke: "UkendtMærkeXYZ" },
        { ...jeans, id: "solgt", status: "sold" as const },
      ]),
    ).toHaveLength(0);
  });
});
