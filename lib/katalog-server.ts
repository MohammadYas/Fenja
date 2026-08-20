import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  EKSKLUDERET,
  FALLBACK_ALT,
  KATALOG_ALTS,
  KURATERET_RAEKKEFOELGE,
  SKJULTE,
  type KatalogBillede,
} from "@/lib/copy/katalog-billeder";

// Server-side opdagelse af katalogbilleder (ejer-ordre 2026-08-20: "også når
// jeg adder flere" — nye webp-filer i public/eksempler/katalog/ kommer
// automatisk med i slides og strøm uden kodeændring). Kurateret rækkefølge
// først; ukendte nye filer bagest i alfabetisk orden.
export function hentKatalogBilleder(): KatalogBillede[] {
  let filnavne: string[];
  try {
    filnavne = readdirSync(join(process.cwd(), "public", "eksempler", "katalog"))
      .filter((f) => f.endsWith(".webp"))
      .map((f) => f.replace(/\.webp$/, ""));
  } catch {
    // Mappen findes ikke (fx i test-miljø) — fald tilbage til den kuraterede liste
    filnavne = [...KURATERET_RAEKKEFOELGE];
  }

  const synlige = filnavne.filter(
    (navn) => !EKSKLUDERET.includes(navn) && !SKJULTE.includes(navn),
  );
  const kendte = KURATERET_RAEKKEFOELGE.filter((navn) => synlige.includes(navn));
  const nye = synlige.filter((navn) => !KURATERET_RAEKKEFOELGE.includes(navn)).sort();

  return [...kendte, ...nye].map((navn) => ({
    src: `/eksempler/katalog/${navn}.webp`,
    alt: KATALOG_ALTS[navn] ?? FALLBACK_ALT,
  }));
}

/** To rækker til annonce-strømmen — skiftevis, så begge får nye billeder */
export function hentKatalogRaekker(): [KatalogBillede[], KatalogBillede[]] {
  const alle = hentKatalogBilleder();
  return [alle.filter((_, i) => i % 2 === 0), alle.filter((_, i) => i % 2 === 1)];
}
