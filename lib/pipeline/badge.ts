// EJER-BESLUTNING 2026-08-20 (overstyrer C-4/manifest §2.1.7), SKÆRPET 22/8:
// billedfilen bærer HVERKEN synlig badge ELLER nogen metadata. AI-mærkningen
// bor udelukkende i UI'et/på forsiden (art. 50-oplysningen). Googles egen
// C2PA-provenance fra genereringen skal OGSÅ væk nu — det var tidligere
// bevidst efterladt ("vi styrer det ikke"), men ejeren har omgjort den
// beslutning. Denne re-encode fjerner den allerede (JUMBF/APP11-segmenter
// overlever ikke en gen-kodning med sharp), og gemBillede (supabase-db.ts)
// kører desuden fjernMetadata() som en uafhængig sikkerhedsspærre på alt,
// der lander i storage. Låst med testen for det fiktive C2PA-segment i
// metadata.test.ts. Funktionen normaliserer i øvrigt kun til JPEG.

import sharp from "sharp";

/** Normaliserer leverancen til JPEG (Vinted-venligt) — ingen mærkning eller metadata i filen */
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
