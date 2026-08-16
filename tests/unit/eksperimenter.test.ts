import { afterEach, describe, expect, it } from "vitest";
import {
  eksperimentAktiv,
  eksperimenter,
  hentBedsteFund,
  hentPopulaere,
  nyesteHoestDato,
} from "@/lib/eksperimenter";
import { MARKEDSPRISER } from "@/lib/data/markedspriser";

const oprindelig = process.env.EKSPERIMENTER_FRA;

afterEach(() => {
  if (oprindelig === undefined) delete process.env.EKSPERIMENTER_FRA;
  else process.env.EKSPERIMENTER_FRA = oprindelig;
});

describe("eksperiment-flag (hurtig kill-switch)", () => {
  it("følger flaget i koden når env ikke er sat", () => {
    delete process.env.EKSPERIMENTER_FRA;
    for (const navn of Object.keys(eksperimenter) as (keyof typeof eksperimenter)[]) {
      expect(eksperimentAktiv(navn)).toBe(eksperimenter[navn]);
    }
  });

  it('EKSPERIMENTER_FRA="alle" slår alt fra uden kodeændring', () => {
    process.env.EKSPERIMENTER_FRA = "alle";
    expect(eksperimentAktiv("populaertLigeNu")).toBe(false);
    expect(eksperimentAktiv("bedsteFund")).toBe(false);
    expect(eksperimentAktiv("prisTjek")).toBe(false);
  });

  it("kan slå enkelte flag fra i en kommasepareret liste", () => {
    process.env.EKSPERIMENTER_FRA = "prisTjek, bedsteFund";
    expect(eksperimentAktiv("prisTjek")).toBe(false);
    expect(eksperimentAktiv("bedsteFund")).toBe(false);
    expect(eksperimentAktiv("populaertLigeNu")).toBe(eksperimenter.populaertLigeNu);
  });
});

describe("markedsafledte lister (aldrig opdigtede tal)", () => {
  it("populære er sorteret efter flest aktive annoncer", () => {
    const liste = hentPopulaere(6);
    expect(liste.length).toBeGreaterThan(0);
    expect(liste.length).toBeLessThanOrEqual(6);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1]!.antal).toBeGreaterThanOrEqual(liste[i]!.antal);
    }
    // Alt kommer fra den committede høst — intet opdigtet
    for (const punkt of liste) {
      expect(MARKEDSPRISER).toContain(punkt);
    }
  });

  it("bedste fund er sorteret efter højeste medianpris", () => {
    const liste = hentBedsteFund(5);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i - 1]!.medianDkk).toBeGreaterThanOrEqual(liste[i]!.medianDkk);
    }
  });

  it("nyeste høstdato er datasættets maksimum", () => {
    const dato = nyesteHoestDato();
    expect(dato).toBe([...MARKEDSPRISER.map((m) => m.hoestetDato)].sort().at(-1));
  });
});
