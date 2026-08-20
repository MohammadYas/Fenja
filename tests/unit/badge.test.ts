import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { beskaerTilVinted, paafoerBadge } from "@/lib/pipeline/badge";

async function testBillede(bredde = 800, hoejde = 600): Promise<Buffer> {
  return sharp({
    create: {
      width: bredde,
      height: hoejde,
      channels: 3,
      background: { r: 200, g: 195, b: 185 },
    },
  })
    .jpeg()
    .toBuffer();
}

describe("leverance-billede (ejer-beslutning 20/8: ingen mærkning i filen)", () => {
  it("tilføjer INGEN egen metadata til billedet", async () => {
    const output = await paafoerBadge(await testBillede());
    const meta = await sharp(output).metadata();
    const exif = meta.exif?.toString("utf8") ?? "";
    expect(exif).not.toContain("AI-genereret");
    expect(exif).not.toContain("Selja");
  });

  it("sætter ALDRIG synlig tekst på billedet (ejer-ordre 20/8)", async () => {
    const foer = await testBillede();
    const efter = await paafoerBadge(foer);
    const meta = await sharp(efter).metadata();
    expect(meta.width).toBe(800);
    // Nederste venstre hjørne (hvor badget sad) skal være urørt — ingen
    // mørke badge-pixels; mærkningen bor i metadata + UI'et
    const hjoerne = await sharp(efter)
      .extract({ left: 10, top: 520, width: 100, height: 60 })
      .greyscale()
      .raw()
      .toBuffer();
    const moerke = [...hjoerne].filter((v) => v < 80).length;
    expect(moerke).toBe(0);
  });

  it("beskærer til 4:5 uden at ændre bredden (C-8)", async () => {
    const output = await beskaerTilVinted(await testBillede(800, 600));
    const meta = await sharp(output).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1000);
  });
});
