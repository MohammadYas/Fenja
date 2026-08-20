// Sletning af ét item med ALT hvad der hører til (ejer-ordre 20/8: man skal
// kunne slette fra oversigten, med dobbelt bekræftelse i UI'et). Rækkefølgen
// er bevidst: storage-filer fjernes FØRST, så et nedbrud aldrig efterlader
// forældreløse billeder i bucket'en (samme princip som kontosletning, A-4).

import type { StorageMappe } from "@/lib/konto/slet";

const SIDE = 100;

/** Den lille del af storage-API'et, oprydningen behøver — testbar uden Supabase */
export interface ItemStorageOprydning {
  list(
    sti: string,
    opts: { limit: number; offset: number },
  ): Promise<{ data: StorageMappe[] | null }>;
  remove(stier: string[]): Promise<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Fjerner alle filer under `<userId>/<itemId>/` i bucket'en. Et item har få
 * filer (rensede fotos + visualiseringer), men listen pagineres alligevel,
 * så funktionen holder — også hvis stistrukturen senere ændrer sig.
 */
export async function sletItemsFiler(
  storage: ItemStorageOprydning,
  userId: string,
  itemId: string,
): Promise<number> {
  const sti = `${userId}/${itemId}`;
  const filer: string[] = [];
  for (let offset = 0; ; offset += SIDE) {
    const { data } = await storage.list(sti, { limit: SIDE, offset });
    const side = data ?? [];
    filer.push(...side.map((post) => `${sti}/${post.name}`));
    if (side.length < SIDE) break;
  }
  if (filer.length === 0) return 0;
  const { error } = await storage.remove(filer);
  if (error) {
    throw new Error(`Kunne ikke slette annoncens billeder: ${error.message}`);
  }
  return filer.length;
}
