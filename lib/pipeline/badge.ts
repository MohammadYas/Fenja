// Synligt "Visualisering"-badge + AI-metadata indlejret i selve billedfilen
// (C-4, EU AI-forordningen art. 50). Kan ikke fravælges — kaldes altid på
// genererede billeder før levering, og fjernes aldrig (HANDOFF §2.2.6).

import sharp from "sharp";

export const BADGE_TEKST = "VISUALISERING";
export const AI_METADATA_TEKST =
  "AI-genereret visualisering. Maerket jf. EU AI-forordningen art. 50. Lavet med Fenja.";

function badgeSvg(bredde: number): { svg: Buffer; hoejde: number; margin: number } {
  // Skalerer med billedet: ~4 % af bredden i højde, mono-uppercase som i UI'et.
  // Badgen må aldrig være bredere end billedet — skaleres ned på små billeder.
  let hoejde = Math.max(28, Math.round(bredde * 0.045));
  let skrift = Math.round(hoejde * 0.5);
  let pad = Math.round(hoejde * 0.55);
  let tekstBredde = Math.round(BADGE_TEKST.length * skrift * 0.62);
  let margin = Math.round(hoejde * 0.4);

  const totalBredde = () => tekstBredde + pad * 2 + margin;
  if (totalBredde() > bredde) {
    const faktor = bredde / totalBredde();
    hoejde = Math.max(10, Math.floor(hoejde * faktor));
    skrift = Math.max(6, Math.floor(skrift * faktor));
    pad = Math.max(2, Math.floor(pad * faktor));
    margin = Math.max(1, Math.floor(margin * faktor));
    tekstBredde = Math.round(BADGE_TEKST.length * skrift * 0.62);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tekstBredde + pad * 2}" height="${hoejde}">
  <rect width="100%" height="100%" fill="#212523"/>
  <text x="${pad}" y="${Math.round(hoejde * 0.68)}" font-family="monospace" font-size="${skrift}" letter-spacing="2" fill="#F1F3F2">${BADGE_TEKST}</text>
</svg>`;
  return { svg: Buffer.from(svg), hoejde, margin };
}

/**
 * Lægger badge i nederste venstre hjørne og indlejrer AI-mærkning i metadata.
 * Returnerer altid JPEG (Vinted-venligt).
 */
export async function paafoerBadge(billede: Buffer): Promise<Buffer> {
  const base = sharp(billede);
  const meta = await base.metadata();
  const bredde = meta.width ?? 1024;
  const hoejde = meta.height ?? 1024;
  const badge = badgeSvg(bredde);

  return base
    .composite([
      {
        input: badge.svg,
        left: badge.margin,
        top: Math.max(0, hoejde - badge.hoejde - badge.margin),
      },
    ])
    .withExif({
      IFD0: {
        ImageDescription: AI_METADATA_TEKST,
        Software: "Fenja (AI-genereret visualisering)",
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
