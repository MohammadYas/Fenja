import "server-only";

// ÉT STED PR. SÆLGER (ejer-ordre 22/8: "hvis steder er optaget skal man ik
// ku vælge det"). To sælgere må aldrig dele hjem — ellers ligner deres
// Vinted-profiler hinanden, og hele idéen med et fast, personligt sted
// falder fra hinanden.
//
// Kravet håndhæves i DATABASEN: profiles.home_anchor har et unikt indeks
// (migration 20260822120000). Vi forsøger derfor at SKRIVE hjemmet; slår
// skrivningen fejl på unikhed, er stedet taget, og vi går videre til det
// næste. Det er atomisk — to samtidige nye brugere kan ikke snuppe samme
// hjem, uanset timing.
//
// Startpunktet er brugerens egen hash, så tildelingen spredes jævnt ud over
// alle hjem i stedet for at klumpe fra indeks 0.

import { HJEM } from "./skabeloner";

/** Hvor mange hjem vi højst prøver, før vi giver op (beskytter mod uendelig løkke) */
const MAKS_FORSOEG = 200;

function stabilHash(tekst: string): number {
  let hash = 0;
  for (const tegn of tekst) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

// Supabase-klienten er struktureret nok til at typeafhænge minimalt af:
// vi kalder kun update().eq() og læser error. Løst typet, så vi ikke binder
// os til en bestemt supabase-js-generic.
type Klient = {
  from: (tabel: string) => {
    update: (v: Record<string, unknown>) => {
      eq: (k: string, v: string) => PromiseLike<{ error: { message: string } | null }>;
    };
  };
};

/**
 * Tildeler sælgeren et LEDIGT hjem og returnerer det. `startFra` gør det
 * muligt at rotere videre fra det nuværende hjem (ejerens 3-skifts-regel).
 * Returnerer null, hvis alle hjem i vinduet er optaget — så beholder
 * sælgeren sit nuværende.
 */
export async function tildelLedigtHjem(
  service: Klient,
  userId: string,
  startFra?: string | null,
  ekstraFelter: Record<string, unknown> = {},
): Promise<{ id: string; navn: string } | null> {
  const nuIndex = startFra ? HJEM.findIndex((h) => h.id === startFra) : -1;
  // Rotation starter efter det nuværende hjem; nye brugere starter på deres
  // egen hash, så tildelingen ikke klumper i toppen af listen
  const start = nuIndex >= 0 ? nuIndex + 1 : stabilHash(userId);

  for (let forsoeg = 0; forsoeg < Math.min(MAKS_FORSOEG, HJEM.length); forsoeg++) {
    const hjem = HJEM[(start + forsoeg) % HJEM.length]!;
    const { error } = await service
      .from("profiles")
      .update({ home_anchor: hjem.id, ...ekstraFelter })
      .eq("id", userId);
    if (!error) return { id: hjem.id, navn: hjem.navn };
    // 23505 = unique_violation → stedet er taget, prøv det næste
    if (!/duplicate key|unique/i.test(error.message)) throw new Error(error.message);
  }
  return null;
}
