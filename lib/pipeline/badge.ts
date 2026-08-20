// AI-mærkning indlejret i selve billedfilen (C-4, EU AI-forordningen art.
// 50). EJER-ORDRE 2026-08-20: der må UNDER INGEN OMSTÆNDIGHEDER stå synlig
// tekst på billedet — mærkningen er metadata i filen (+ Googles egen C2PA-
// signatur fra genereringen) og de synlige noter i UI'et/på forsiden.
// Kaldes stadig altid på genererede billeder før levering.

import sharp from "sharp";

export const AI_METADATA_TEKST =
  "AI-genereret visualisering. Maerket jf. EU AI-forordningen art. 50. Lavet med Selja.";

/**
 * Indlejrer AI-mærkning i billedets metadata (ingen synlig badge —
 * ejer-ordre 20/8). Returnerer altid JPEG (Vinted-venligt).
 */
export async function paafoerBadge(billede: Buffer): Promise<Buffer> {
  return sharp(billede)
    .withExif({
      IFD0: {
        ImageDescription: AI_METADATA_TEKST,
        Software: "Selja (AI-genereret visualisering)",
      },
    })
    .jpeg({ quality: 88 })
    .toBuffer();
}

/** 4:5-venlig beskæring til Vinteds visning (C-8) — ændrer aldrig indholdet, kun beskæring */
export async function beskaerTilVinted(billede: Buffer): Promise<Buffer> {
  const meta = await sharp(billede).metadata();
  const bredde = meta.width ?? 1024;
  const oensketHoejde = Math.round((bredde * 5) / 4);
  return sharp(billede)
    .resize({ width: bredde, height: oensketHoejde, fit: "cover", position: "attention" })
    .jpeg({ quality: 88 })
    .toBuffer();
}
