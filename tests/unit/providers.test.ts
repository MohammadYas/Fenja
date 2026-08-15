import { describe, expect, it } from "vitest";
import {
  MockImageProvider,
  MockTextProvider,
  MockVideoProvider,
} from "@/lib/providers/mock";

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
