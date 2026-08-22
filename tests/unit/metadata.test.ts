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

/**
 * Bygger et ægte APP11/JUMBF-segment, som C2PA-provenance rent faktisk
 * transporteres i (JPEG-markør 0xFFEB, "JP" box-signatur + en "c2pa"-
 * content-type-boks) — ikke bare ordet "c2pa" et sted i filen. Indsat lige
 * efter SOI, som en rigtig C2PA-forsynet fil fra Gemini ville se ud.
 */
async function medFiktivC2paSegment(): Promise<Buffer> {
  const base = await sharp({
    create: { width: 40, height: 60, channels: 3, background: "#8a8378" },
  })
    .jpeg()
    .toBuffer();
  const payload = Buffer.concat([
    Buffer.from("JP", "ascii"),
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from("jumbc2pamanifestFAKEC2PAPROVENANCEDATA", "ascii"),
  ]);
  const laengde = Buffer.alloc(2);
  laengde.writeUInt16BE(payload.length + 2, 0);
  const segment = Buffer.concat([Buffer.from([0xff, 0xeb]), laengde, payload]);
  return Buffer.concat([base.subarray(0, 2), segment, base.subarray(2)]);
}

describe("fjernMetadata", () => {
  it("kilden HAR metadata (så testen er ægte)", async () => {
    const meta = await sharp(await medMetadata()).metadata();
    expect(meta.exif).toBeDefined();
  });

  it("fjerner Googles C2PA-provenance-segment (ejer-beslutning 22/8, skærpet: ikke længere 'vi styrer det ikke')", async () => {
    const kilde = await medFiktivC2paSegment();
    expect(kilde.toString("latin1").toLowerCase()).toContain("c2pa");
    const renset = await fjernMetadata(kilde);
    const tekst = renset.toString("latin1").toLowerCase();
    expect(tekst).not.toContain("c2pa");
    expect(tekst).not.toContain("jumb");
    const meta = await sharp(renset).metadata();
    expect(meta.width).toBe(40);
    expect(meta.height).toBe(60);
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
