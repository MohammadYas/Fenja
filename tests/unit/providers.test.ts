import { describe, expect, it } from "vitest";
import { troskabsSpoergsmaal } from "@/lib/providers/deepseek";
import {
  MockImageProvider,
  MockTextProvider,
  MockVideoProvider,
} from "@/lib/providers/mock";

// Ejer-rapport 20/8: gulv- og bøjle-billederne blev ALTID kasseret, fordi
// troskabs-spørgsmålet gav score 0 til tøj der ikke bæres — en regel der kun
// giver mening for on-model-visninger.
describe("troskabs-spørgsmålet pr. visningsslags", () => {
  it("on-model kræver stadig at tøjet bæres (bøjle-reglen fra runde 9)", () => {
    const spoergsmaal = troskabsSpoergsmaal("onmodel");
    expect(spoergsmaal).toContain("BÆRER");
    expect(spoergsmaal).toContain("bøjle");
    expect(spoergsmaal).toContain("ALTID 0");
  });

  it("produkt-visninger straffes ALDRIG for at der ikke er en person", () => {
    const spoergsmaal = troskabsSpoergsmaal("produkt");
    expect(spoergsmaal).toContain("MED VILJE ingen person");
    expect(spoergsmaal).toContain("ALDRIG trække scoren ned");
    expect(spoergsmaal).not.toContain("ALTID 0");
  });

  it("begge spørgsmål beder om samme JSON-format", () => {
    for (const slags of ["onmodel", "produkt"] as const) {
      expect(troskabsSpoergsmaal(slags)).toContain(`"score"`);
      expect(troskabsSpoergsmaal(slags)).toContain(`"begrundelse"`);
    }
  });
});

describe("MockImageProvider", () => {
  it("renser baggrund deterministisk med omkostning", async () => {
    const provider = new MockImageProvider();
    const resultat = await provider.rensBaggrund({ fotoUrl: "https://x/foto.jpg" });
    expect(resultat.url).toBe("https://x/foto.jpg#renset");
    expect(resultat.costDkk).toBeGreaterThan(0);
  });

  it("kan konfigureres til at fejle on-model (B-6-testvej)", async () => {
    const provider = new MockImageProvider({ onModelFejler: true });
    await expect(
      provider.genererOnModel({
        referenceUrl: "https://x/foto.jpg",
        prompt: "p",
        referenceVaegt: 0.65,
      }),
    ).rejects.toThrow();
  });

  it("registrerer referencevægt pr. kald (retry-verifikation)", async () => {
    const provider = new MockImageProvider();
    await provider.genererOnModel({
      referenceUrl: "u",
      prompt: "p",
      referenceVaegt: 0.85,
    });
    expect(provider.kald).toContain("onmodel:vaegt=0.85");
  });
});

describe("MockTextProvider", () => {
  it("fletter fejlbeskrivelsen ind i beskrivelsen (D-2)", async () => {
    const provider = new MockTextProvider();
    const tekst = await provider.genererAnnonceTekst({
      maerke: "Ganni",
      stoerrelse: "M",
      stand: "God",
      kategori: "Striktrøje",
      fejlBeskrivelse: "lille hul ved sømmen",
      labelTekst: null,
      koebsprisDkk: null,
    });
    expect(tekst.beskrivelse).toContain("lille hul ved sømmen");
    expect(tekst.titel).toContain("Ganni");
    expect(tekst.titel).toContain("M");
  });

  it("giver konfigurerbar troskabs-score", async () => {
    const provider = new MockTextProvider({ troskabsScore: 0.4 });
    const resultat = await provider.vurderTroskab({
      aegteUrl: "a",
      genereretUrl: "b",
    });
    expect(resultat.score).toBe(0.4);
  });
});

describe("MockVideoProvider", () => {
  it("er bevidst uimplementeret indtil fase B (H-1)", async () => {
    const provider = new MockVideoProvider();
    await expect(
      provider.genererKlip({
        script: "s",
        referenceUrls: [],
        varighedSek: 8,
        format: "9:16",
      }),
    ).rejects.toThrow(/fase B/);
  });
});
