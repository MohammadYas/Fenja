// Kladde-lager (ejer-ordre 2026-08-20: wizarden skal være bulletproof —
// slukket telefon, tabt net eller refresh må ALDRIG koste brugerens indtastning
// eller fotos). Felterne bor i localStorage, foto-blobs i IndexedDB. Alt er
// best-effort: fejler lageret (fx privat browsing), kører wizarden videre uden
// persistens i stedet for at vælte.

export type KladdeFelter = {
  kladdeId: string;
  trin: number;
  kategori: string;
  maerke: string;
  stoerrelse: string;
  stand: string;
  fejlTekst: string;
  farver: string[];
  labelTekst: string;
  koebspris: string;
  visninger: string[];
};

const FELT_NOEGLE = "selja-kladde-v1";
const DB_NAVN = "selja-kladde";
const FOTO_STORE = "fotos";

export function gemFelter(felter: KladdeFelter): void {
  try {
    localStorage.setItem(FELT_NOEGLE, JSON.stringify(felter));
  } catch {
    // Fuldt/blokeret lager må aldrig vælte wizarden
  }
}

export function hentFelter(): KladdeFelter | null {
  try {
    const raa = localStorage.getItem(FELT_NOEGLE);
    if (!raa) return null;
    const felter = JSON.parse(raa) as KladdeFelter;
    return typeof felter.kladdeId === "string" && felter.kladdeId ? felter : null;
  } catch {
    return null;
  }
}

function aabnDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const anmodning = indexedDB.open(DB_NAVN, 1);
    anmodning.onupgradeneeded = () => {
      if (!anmodning.result.objectStoreNames.contains(FOTO_STORE)) {
        anmodning.result.createObjectStore(FOTO_STORE);
      }
    };
    anmodning.onsuccess = () => resolve(anmodning.result);
    anmodning.onerror = () => reject(anmodning.error);
  });
}

export async function gemFotoBlob(rolle: string, blob: Blob): Promise<void> {
  try {
    const db = await aabnDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FOTO_STORE, "readwrite");
      tx.objectStore(FOTO_STORE).put(blob, rolle);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Best-effort
  }
}

export async function hentFotoBlobs(): Promise<Record<string, Blob>> {
  try {
    const db = await aabnDb();
    const resultat = await new Promise<Record<string, Blob>>(
      (resolve, reject) => {
        const tx = db.transaction(FOTO_STORE, "readonly");
        const store = tx.objectStore(FOTO_STORE);
        const noegler = store.getAllKeys();
        const vaerdier = store.getAll();
        tx.oncomplete = () => {
          const ud: Record<string, Blob> = {};
          (noegler.result as string[]).forEach((noegle, i) => {
            const blob = vaerdier.result[i];
            if (blob instanceof Blob) ud[noegle] = blob;
          });
          resolve(ud);
        };
        tx.onerror = () => reject(tx.error);
      },
    );
    db.close();
    return resultat;
  } catch {
    return {};
  }
}

/** Ryd hele kladden (efter vellykket oprettelse) */
export async function rydKladde(): Promise<void> {
  try {
    localStorage.removeItem(FELT_NOEGLE);
  } catch {
    // Best-effort
  }
  try {
    const db = await aabnDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FOTO_STORE, "readwrite");
      tx.objectStore(FOTO_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Best-effort
  }
}

/** Kør et kald igen ved forbigående fejl — eksponentiel pause (net-glitches) */
export async function medForsoeg<T>(
  fn: () => Promise<T>,
  forsoeg = 3,
  pauseMs = 800,
): Promise<T> {
  let sidsteFejl: unknown;
  for (let i = 0; i < forsoeg; i++) {
    try {
      return await fn();
    } catch (fejl) {
      sidsteFejl = fejl;
      if (i < forsoeg - 1) {
        await new Promise((r) => setTimeout(r, pauseMs * 2 ** i));
      }
    }
  }
  throw sidsteFejl;
}
