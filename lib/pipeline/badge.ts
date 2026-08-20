// EJER-BESLUTNING 2026-08-20 (overstyrer C-4/manifest §2.1.7): billedfilen
// bærer HVERKEN synlig badge ELLER egen metadata. AI-mærkningen bor i
// UI'et/på forsiden — og Googles egen C2PA-signatur fra genereringen sidder
// stadig i filen fra deres side. Funktionen normaliserer kun til JPEG.

import sharp from "sharp";

/** Normaliserer leverancen til JPEG (Vinted-venligt) — ingen mærkning i filen */
export async function paafoerBadge(billede: Buffer): Promise<Buffer> {
  return sharp(billede).jpeg({ quality: 88 }).toBuffer();
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
