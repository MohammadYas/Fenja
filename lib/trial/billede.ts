// Billedhåndtering for trialen: magic bytes-tjek FØR alt andet (extension er
// klientens påstand, ikke bevis), nedskalering før provider-kaldet (halverer
// typisk billedomkostningen) og vandmærke + reduceret opløsning på det,
// anonyme får udleveret. Det RENE output gemmes separat og låses op ved signup.

import sharp from "sharp";
import { trial } from "@/lib/config";

export type TrialBilledType = "jpeg" | "png" | "webp" | "heic";

/**
 * Aflæs filtypen af de faktiske bytes — kun jpg/png/webp/heic accepteres.
 * null = ikke et billede vi tager imod (uanset hvad filnavnet påstår).
 */
export function aflaesBilledType(buffer: Buffer): TrialBilledType | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  // HEIC/HEIF: ISO-BMFF med "ftyp" + en heif-familie-brand på offset 8
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (["heic", "heix", "hevc", "heif", "mif1", "msf1"].includes(brand)) {
      return "heic";
    }
  }
  return null;
}

/**
 * Nedskalér + normalisér upload til JPEG før provider-kaldet. Kaster ved
 * ulæselige data (fx HEIC på en sharp-build uden HEIF-dekoder) — kalderen
 * viser en ærlig fejl i stedet for at brænde API-budget på et dødt input.
 */
export async function forberedInputBillede(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // EXIF-orientering fra mobilkameraer skal bages ind
    .resize({
      width: trial.maksInputKantPx,
      height: trial.maksInputKantPx,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

/** Diagonalt gentaget "selja.dk" — synligt men uden at ødelægge wow-øjeblikket */
function vandmaerkeSvg(bredde: number, hoejde: number): Buffer {
  const skrift = Math.round(Math.max(bredde, hoejde) / 12);
  const tekster: string[] = [];
  // 3×3-gitter roteret om centrum, så mærket ikke kan beskæres væk
  for (let raekke = 0; raekke < 3; raekke++) {
    for (let kolonne = 0; kolonne < 3; kolonne++) {
      const x = Math.round(((kolonne + 0.5) * bredde) / 3);
      const y = Math.round(((raekke + 0.5) * hoejde) / 3);
      tekster.push(
        `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})">selja.dk</text>`,
      );
    }
  }
  return Buffer.from(
    `<svg width="${bredde}" height="${hoejde}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text {
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${skrift}px;
          font-weight: 700;
          text-anchor: middle;
          fill: #ffffff;
          fill-opacity: 0.34;
          stroke: #1a1a1a;
          stroke-opacity: 0.22;
          stroke-width: ${Math.max(1, Math.round(skrift / 28))}px;
        }
      </style>
      ${tekster.join("\n      ")}
    </svg>`,
  );
}

/**
 * Den udgave anonyme får: maks 1024 px lang side + synligt selja.dk-vandmærke.
 * Det rene billede rører aldrig denne funktion.
 */
export async function vandmaerkOgFormindsk(buffer: Buffer): Promise<Buffer> {
  const formindsket = await sharp(buffer)
    .resize({
      width: trial.maksOutputKantPx,
      height: trial.maksOutputKantPx,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82 })
    .toBuffer();
  const meta = await sharp(formindsket).metadata();
  const bredde = meta.width ?? trial.maksOutputKantPx;
  const hoejde = meta.height ?? trial.maksOutputKantPx;
  return sharp(formindsket)
    .composite([{ input: vandmaerkeSvg(bredde, hoejde), top: 0, left: 0 }])
    .jpeg({ quality: 82 })
    .toBuffer();
}
