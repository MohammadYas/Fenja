import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { AI_METADATA_TEKST, beskaerTilVinted, paafoerBadge } from "@/lib/pipeline/badge";

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

describe("AI-badge (C-4 — kan ikke fravælges)", () => {
  it("indlejrer AI-mærkning i EXIF-metadata", async () => {
    const output = await paafoerBadge(await testBillede());
    const meta = await sharp(output).metadata();
    const exif = meta.exif?.toString("utf8") ?? "";
    expect(exif).toContain("AI-genereret");
    expect(AI_METADATA_TEKST).toContain("art. 50");
  });

  it("ændrer pixels i badge-hjørnet (synligt badge)", async () => {
    const foer = await testBillede();
    const efter = await paafoerBadge(foer);
    const meta = await sharp(efter).metadata();
    expect(meta.width).toBe(800);
    // Nederste venstre hjørne skal indeholde mørke badge-pixels (koks #212523)
    const hjoerne = await sharp(efter)
      .extract({ left: 10, top: 520, width: 100, height: 60 })
      .greyscale()
      .raw()
      .toBuffer();
    const moerke = [...hjoerne].filter((v) => v < 80).length;
    expect(moerke).toBeGreaterThan(0);
  });

  it("beskærer til 4:5 uden at ændre bredden (C-8)", async () => {
    const output = await beskaerTilVinted(await testBillede(800, 600));
    const meta = await sharp(output).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1000);
  });
});
