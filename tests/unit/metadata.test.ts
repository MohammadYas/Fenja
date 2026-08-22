import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { fjernMetadata } from "@/lib/pipeline/metadata";

// Ejer-beslutning 22/8: "0 AI-metadata" på de billeder, Selja leverer.
// Provider-filer bærer EXIF/XMP (og C2PA-provenance i XMP/APP-markører) —
// intet af det må følge med ud til kunden. Låst her, så en fremtidig
// ændring ikke stille kan lukke metadataen ind igen.

/** Et lille billede MED metadata — som det provideren leverer */
async function medMetadata(): Promise<Buffer> {
  return sharp({
    create: { width: 40, height: 60, channels: 3, background: "#8a8378" },
  })
    .withMetadata({
      exif: {
        IFD0: {
          Software: "Google Gemini",
          ImageDescription: "AI-genereret visualisering",
          Copyright: "provider",
        },
      },
    })
    .jpeg()
    .toBuffer();
}

describe("fjernMetadata", () => {
  it("kilden HAR metadata (så testen er ægte)", async () => {
    const meta = await sharp(await medMetadata()).metadata();
    expect(meta.exif).toBeDefined();
  });

  it("fjerner exif, xmp, iptc og icc fra det leverede billede", async () => {
    const renset = await fjernMetadata(await medMetadata());
    const meta = await sharp(renset).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.xmp).toBeUndefined();
    expect(meta.iptc).toBeUndefined();
    expect(meta.icc).toBeUndefined();
  });

  it("efterlader ingen leverandør- eller modelnavne i filens bytes", async () => {
    const renset = await fjernMetadata(await medMetadata());
    const tekst = renset.toString("latin1").toLowerCase();
    for (const ord of ["gemini", "google", "ai-genereret", "deepseek", "c2pa"]) {
      expect(tekst, ord).not.toContain(ord);
    }
  });

  it("beholder billedet selv (mål og indhold er intakt)", async () => {
    const renset = await fjernMetadata(await medMetadata());
    const meta = await sharp(renset).metadata();
    expect(meta.width).toBe(40);
    expect(meta.height).toBe(60);
    expect(meta.format).toBe("jpeg");
  });

  it("bager EXIF-orienteringen ind, så telefonbilleder ikke vender forkert", async () => {
    // Orientation 6 = 90° — uden .rotate() ville billedet ligge ned, når
    // flaget forsvinder. Renset skal derfor være 60x40, ikke 40x60.
    const drejet = await sharp({
      create: { width: 40, height: 60, channels: 3, background: "#8a8378" },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const meta = await sharp(await fjernMetadata(drejet)).metadata();
    expect(meta.width).toBe(60);
    expect(meta.height).toBe(40);
    expect(meta.exif).toBeUndefined();
  });
});
