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

// Ejer-uploadede billeder (21/8 nat: admin-panelet kan tilføje forside-
// billeder uden deploy). De ligger i den offentlige forside-billeder-bucket
// og hentes ved sidens revalidering. Fejler kaldet (demo/lokalt uden nøgler),
// vises blot de bundlede billeder.
async function hentUploadedeBilleder(): Promise<KatalogBillede[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !noegle) return [];
  try {
    const { opretServiceKlient } = await import("@/lib/supabase/service");
    const service = opretServiceKlient();
    const { data, error } = await service.storage
      .from("forside-billeder")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) return [];
    return data
      .filter((f) => f.name.endsWith(".webp"))
      .map((f) => ({
        src: `${url}/storage/v1/object/public/forside-billeder/${f.name}`,
        alt: FALLBACK_ALT,
      }));
  } catch {
    return [];
  }
}

/** Bundlede + ejer-uploadede billeder — uploadede sidst, så serien vokser */
export async function hentAlleKatalogBilleder(): Promise<KatalogBillede[]> {
  return [...hentKatalogBilleder(), ...(await hentUploadedeBilleder())];
}

/** To rækker til annonce-strømmen — skiftevis, så begge får nye billeder */
export function hentKatalogRaekker(): [KatalogBillede[], KatalogBillede[]] {
  const alle = hentKatalogBilleder();
  return [alle.filter((_, i) => i % 2 === 0), alle.filter((_, i) => i % 2 === 1)];
}

/** Som hentKatalogRaekker, men inkl. ejer-uploadede billeder */
export async function hentAlleKatalogRaekker(): Promise<
  [KatalogBillede[], KatalogBillede[]]
> {
  const alle = await hentAlleKatalogBilleder();
  return [alle.filter((_, i) => i % 2 === 0), alle.filter((_, i) => i % 2 === 1)];
}
