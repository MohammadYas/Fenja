import { describe, expect, it } from "vitest";
import { vinted } from "@/lib/config";
import { STANDE } from "@/lib/prisberegner";
import {
  VINTED_FARVER,
  stoerrelsesGrupperFor,
} from "@/lib/data/vinted-kriterier";

// Ejer-ordre 2026-08-20: stand, størrelse og farve skal matche Vinteds egne
// lister 1:1 (aflæst fra vinted.dk) — annoncen sættes ind uden oversættelse.

const VINTED_STANDSKALA = [
  "Ny med prismærker",
  "Ny uden prismærker",
  "Meget god",
  "God",
  "Tilfredsstillende",
];

describe("Vinted-kriterier 1:1", () => {
  it("standskalaen er Vinteds fem niveauer, i Vinteds rækkefølge", () => {
    expect([...vinted.standskala]).toEqual(VINTED_STANDSKALA);
  });

  it("prisberegnerens standnavne følger samme skala", () => {
    expect(STANDE.map((s) => s.navn)).toEqual(VINTED_STANDSKALA);
  });

  it("farvelisten er Vinteds 29 farver med Sort først", () => {
    expect(VINTED_FARVER).toHaveLength(29);
    expect(VINTED_FARVER[0]!.navn).toBe("Sort");
    expect(VINTED_FARVER.map((f) => f.navn)).toContain("Bourgogne");
    expect(VINTED_FARVER.map((f) => f.navn)).toContain("Klar");
  });

  it("jeans får både kvinde- og herrestørrelser (EU | W)", () => {
    const grupper = stoerrelsesGrupperFor("Jeans")!;
    expect(grupper.map((g) => g.navn)).toEqual(["Kvinder", "Mænd (EU | W)"]);
    expect(grupper[0]!.stoerrelser).toContain("M / 38 / 10");
    expect(grupper[1]!.stoerrelser).toContain("EU 48 | W32");
  });

  it("kjole og nederdel er kvindelister; taske er én størrelse", () => {
    expect(stoerrelsesGrupperFor("Kjole")!.map((g) => g.navn)).toEqual([
      "Kvinder",
    ]);
    expect(stoerrelsesGrupperFor("Taske")![0]!.stoerrelser).toEqual([
      "Én størrelse",
    ]);
  });

  it("ukendt tøjdel giver fritekst (null)", () => {
    expect(stoerrelsesGrupperFor("Andet")).toBeNull();
    expect(stoerrelsesGrupperFor("Vinyl-lp")).toBeNull();
  });
});
