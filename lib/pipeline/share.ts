// Delbart before/after-billede (F-4): 9:16 til TikTok-slideshows. Ægte fotos
// (original + renset) — ingen AI-indhold, derfor ingen badge. Deling er altid
// brugerens eget valg; intet deles automatisk.

import sharp from "sharp";

const BREDDE = 1080;
const HOEJDE = 1920;
const PANEL_HOEJDE = 830;
const KANT = 40;

// Tokens fra DESIGN.md — hardkodet som hex her fordi sharp ikke kan læse TS-tokens;
// holdes i sync af tests mod lib/design/tokens.ts
export const DELE_FARVER = {
  kalk: "#F1F3F2",
  koks: "#212523",
  rav: "#C97F1B",
} as const;

function etiketSvg(tekst: string): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="64">
      <rect width="100%" height="100%" fill="${DELE_FARVER.koks}"/>
      <text x="24" y="43" font-family="monospace" font-size="30" letter-spacing="4" fill="${DELE_FARVER.kalk}">${tekst}</text>
    </svg>`,
  );
}

function soemSvg(): Buffer {
  // Sømmen som horisontal deler (DESIGN.md §6)
  const stiplet = Array.from({ length: Math.ceil(BREDDE / 22) }, (_, i) =>
    `<rect x="${i * 22}" y="0" width="12" height="4" fill="${DELE_FARVER.rav}"/>`,
  ).join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BREDDE}" height="4">${stiplet}</svg>`,
  );
}

function ordmaerkeSvg(): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BREDDE}" height="80">
      <text x="${BREDDE / 2}" y="52" text-anchor="middle" font-family="monospace" font-size="34" letter-spacing="6" fill="${DELE_FARVER.koks}">SELJA</text>
    </svg>`,
  );
}

async function panel(billede: Buffer): Promise<Buffer> {
  return sharp(billede)
    .resize({
      width: BREDDE - KANT * 2,
      height: PANEL_HOEJDE,
      fit: "cover",
      position: "attention",
    })
    .toBuffer();
}

export async function lavDelebillede(foer: Buffer, efter: Buffer): Promise<Buffer> {
  const [foerPanel, efterPanel] = await Promise.all([panel(foer), panel(efter)]);
  const midte = Math.round(HOEJDE / 2);

  return sharp({
    create: {
      width: BREDDE,
      height: HOEJDE,
      channels: 3,
      background: DELE_FARVER.kalk,
    },
  })
    .composite([
      { input: foerPanel, left: KANT, top: midte - PANEL_HOEJDE - 24 },
      { input: efterPanel, left: KANT, top: midte + 24 },
      { input: soemSvg(), left: 0, top: midte - 2 },
      { input: etiketSvg("FØR"), left: KANT, top: midte - PANEL_HOEJDE - 24 },
      { input: etiketSvg("EFTER"), left: KANT, top: midte + 24 },
      { input: ordmaerkeSvg(), left: 0, top: HOEJDE - 90 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}
