import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { farver } from "@/lib/design/tokens";
import { DELE_FARVER, lavDelebillede } from "@/lib/pipeline/share";

async function foto(farve: { r: number; g: number; b: number }): Promise<Buffer> {
  return sharp({ create: { width: 800, height: 1000, channels: 3, background: farve } })
    .jpeg()
    .toBuffer();
}

describe("delebillede (F-4)", () => {
  it("er 1080x1920 (9:16 til TikTok)", async () => {
    const billede = await lavDelebillede(
      await foto({ r: 120, g: 110, b: 100 }),
      await foto({ r: 230, g: 228, b: 225 }),
    );
    const meta = await sharp(billede).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1920);
  });

  it("farverne er i sync med design-tokens", () => {
    expect(DELE_FARVER.kalk).toBe(farver.kalk);
    expect(DELE_FARVER.koks).toBe(farver.koks);
    expect(DELE_FARVER.rav).toBe(farver.rav);
  });
});
