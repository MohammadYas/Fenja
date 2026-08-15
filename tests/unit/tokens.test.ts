import { describe, expect, it } from "vitest";
import { farver, roller } from "@/lib/design/tokens";

// WCAG-kontrastkravene fra DESIGN.md §2 håndhævet i kode (HANDOFF §2.2.5):
// ryger en token-ændring under tærsklen, fejler CI.

function linear(kanal: number): number {
  const c = kanal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminans(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`Ugyldig hex-farve: ${hex}`);
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h ?? "0", 16));
  return (
    0.2126 * linear(r ?? 0) + 0.7152 * linear(g ?? 0) + 0.0722 * linear(b ?? 0)
  );
}

function kontrast(a: string, b: string): number {
  const [lys, moerk] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return ((lys ?? 0) + 0.05) / ((moerk ?? 0) + 0.05);
}

describe("farvetokens overholder WCAG AA", () => {
  it("koks på kalk (brødtekst) ≥ 4,5:1", () => {
    expect(kontrast(farver.koks, farver.kalk)).toBeGreaterThanOrEqual(4.5);
  });

  it("koks på hør (tekst på flader) ≥ 4,5:1", () => {
    expect(kontrast(farver.koks, farver.hoer)).toBeGreaterThanOrEqual(4.5);
  });

  it("kalk på gran (primærknap) ≥ 4,5:1", () => {
    expect(kontrast(farver.kalk, farver.gran)).toBeGreaterThanOrEqual(4.5);
  });

  it("gran på kalk (links, aktiv tilstand) ≥ 4,5:1", () => {
    expect(kontrast(farver.gran, farver.kalk)).toBeGreaterThanOrEqual(4.5);
  });

  it("ravDyb på kalk (pristal i normal størrelse) ≥ 4,5:1", () => {
    expect(kontrast(farver.ravDyb, farver.kalk)).toBeGreaterThanOrEqual(4.5);
  });

  it("rav på kalk (kun display ≥ 24 px og dekoration) ≥ 2,5:1", () => {
    expect(kontrast(farver.rav, farver.kalk)).toBeGreaterThanOrEqual(2.5);
  });

  it("fejl på kalk (fejlbeskeder) ≥ 4,5:1", () => {
    expect(kontrast(farver.fejl, farver.kalk)).toBeGreaterThanOrEqual(4.5);
  });

  it("kalk på koks (visualiserings-badge) ≥ 4,5:1", () => {
    expect(kontrast(farver.kalk, farver.koks)).toBeGreaterThanOrEqual(4.5);
  });
});

// v2-farveblokke (REDESIGN §2.2): sektioner skifter grund — nye kombinationer
// skal bestå samme AA-regler som resten.
describe("v2-kombinationer på farveblokke overholder WCAG", () => {
  it("hør på gran (sekundær tekst på gran-blokke) ≥ 4,5:1", () => {
    expect(kontrast(farver.hoer, farver.gran)).toBeGreaterThanOrEqual(4.5);
  });

  it("rav på gran (kæmpe dekorative mono-tal, aldrig brødtekst) ≥ 2,5:1", () => {
    expect(kontrast(farver.rav, farver.gran)).toBeGreaterThanOrEqual(2.5);
  });

  it("ravDyb på hør (store pristal/stempler på prislap, ≥ 24 px) ≥ 3:1", () => {
    expect(kontrast(farver.ravDyb, farver.hoer)).toBeGreaterThanOrEqual(3);
  });

  it("koks på hør (prislappens brødtekst) ≥ 4,5:1", () => {
    expect(kontrast(farver.koks, farver.hoer)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("semantiske roller peger på paletten", () => {
  it("baggrund/tekst/primær matcher manifestets tokens", () => {
    expect(roller.baggrund).toBe(farver.kalk);
    expect(roller.tekst).toBe(farver.koks);
    expect(roller.primaer).toBe(farver.gran);
    expect(roller.pris).toBe(farver.ravDyb);
  });
});
