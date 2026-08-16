// Fuld oprydning i storage ved kontosletning (A-4/GDPR art. 17).
//
// Supabase' storage.list() returnerer som standard 100 rækker. Ruten listede
// tidligere uden paginering, så en sælger med over 100 annoncer ville få
// billeder efterladt i bucket'en efter en "fuld sletning" — løftet i vilkårene
// og privatlivspolitikken ville ikke holde. Her hentes ALT via paginering, og
// sletningen sker i portioner, fordi remove() heller ikke er ubegrænset.

/** Den lille del af Supabase' storage-API, oprydningen behøver — så den kan testes */
export type StorageMappe = { name: string; id: string | null };

export interface StorageOprydning {
  list(
    sti: string,
    opts: { limit: number; offset: number },
  ): Promise<{ data: StorageMappe[] | null }>;
  remove(stier: string[]): Promise<{ data: unknown; error: { message: string } | null }>;
}

const SIDE = 100;
const SLET_AD_GANGEN = 100;

/** Alle navne under en sti — paginerer til listen er tom (aldrig kun de første 100) */
async function listAlle(storage: StorageOprydning, sti: string): Promise<StorageMappe[]> {
  const alle: StorageMappe[] = [];
  for (let offset = 0; ; offset += SIDE) {
    const { data } = await storage.list(sti, { limit: SIDE, offset });
    const side = data ?? [];
    alle.push(...side);
    if (side.length < SIDE) return alle;
  }
}

/**
 * Alle filstier under brugerens mappe: `<userId>/<item>/<fil>`. Mapper har
 * `id: null` i Supabase' listesvar; filer direkte i brugermappen tages med,
 * så intet bliver efterladt, hvis stistrukturen senere ændrer sig.
 */
export async function findBrugerensFiler(
  storage: StorageOprydning,
  userId: string,
): Promise<string[]> {
  const filer: string[] = [];
  for (const post of await listAlle(storage, userId)) {
    if (post.id) {
      filer.push(`${userId}/${post.name}`);
      continue;
    }
    for (const fil of await listAlle(storage, `${userId}/${post.name}`)) {
      filer.push(`${userId}/${post.name}/${fil.name}`);
    }
  }
  return filer;
}

/** Sletter i portioner; returnerer antal slettede filer */
export async function sletBrugerensFiler(
  storage: StorageOprydning,
  userId: string,
): Promise<number> {
  const filer = await findBrugerensFiler(storage, userId);
  for (let i = 0; i < filer.length; i += SLET_AD_GANGEN) {
    const portion = filer.slice(i, i + SLET_AD_GANGEN);
    const { error } = await storage.remove(portion);
    if (error) {
      throw new Error(`Kunne ikke slette brugerens billeder: ${error.message}`);
    }
  }
  return filer.length;
}
