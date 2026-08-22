// Genererer public/og-billede.jpg (1200×630) — delebilledet der vises, når
// selja.dk-links deles (TikTok-bio, DM'er, iMessage, Slack osv.). Motivet er
// produktets signatur: cardigan-eksemplets FØR til venstre og EFTER til
// højre, adskilt af en tynd søm. Kør ved motiv-skift og commit resultatet:
//   npx tsx scripts/lav-og-billede.ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BREDDE = 1200;
const HOEJDE = 630;
const SOEM = 4; // px mellem de to paneler, i kant-farven

const ROD = path.join(__dirname, "..");
const FOER = path.join(ROD, "public/eksempler/katalog/p18-foer-cardigan.webp");
const EFTER = path.join(ROD, "public/eksempler/katalog/p2-entre-cardigan.webp");
const UD = path.join(ROD, "public/og-billede.jpg");

async function panel(kilde: string, bredde: number): Promise<Buffer> {
  // Cover-beskæring med fokus lidt over midten — tøjet sidder højt i motivet
  return sharp(kilde)
    .resize(bredde, HOEJDE, { fit: "cover", position: "attention" })
    .toBuffer();
}

async function main(): Promise<void> {
  const panelBredde = Math.floor((BREDDE - SOEM) / 2);
  const [foer, efter] = await Promise.all([
    panel(FOER, panelBredde),
    panel(EFTER, BREDDE - SOEM - panelBredde),
  ]);

  const billede = await sharp({
    create: {
      width: BREDDE,
      height: HOEJDE,
      channels: 3,
      background: { r: 26, g: 24, b: 20 }, // koks — sømmen mellem panelerne
    },
  })
    .composite([
      { input: foer, left: 0, top: 0 },
      { input: efter, left: panelBredde + SOEM, top: 0 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  await mkdir(path.dirname(UD), { recursive: true });
  await writeFile(UD, billede);
  console.log(`skrev ${UD} (${billede.length} bytes)`);
}

main().catch((fejl) => {
  console.error(fejl);
  process.exit(1);
});
