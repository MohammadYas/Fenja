// Aktiverings-nudge (dataanalyse 27/8): begge ægte brugere gennemførte
// tilmelding og lagde derefter aldrig et eneste stykke tøj op. Intet i
// systemet fulgte op på det. Dette modul finder dem og sender ÉT skub.
//
// Rent og injiceret (NFR-5): udvælgelsen og rækkefølgen kan testes uden
// hverken Supabase eller Resend.

/** Hvor længe en ny bruger får fred, før nudgen sendes */
export const NUDGE_EFTER_MS = 24 * 60 * 60 * 1000;

/** Loft pr. kørsel — en fejl må aldrig kunne blive til et masseudsendelse */
export const NUDGE_MAKS_PR_KOERSEL = 50;

export type NudgeKandidat = { id: string; email: string };

export type NudgeDb = {
  /** Profiler uden items, uden nudge-stempel, oprettet før skæringen */
  hentKandidater(foerIso: string, maks: number): Promise<NudgeKandidat[]>;
  /** Sætter aktivering_nudget_at — kun hvis den stadig er null (kapløbs-værn) */
  stempelNudget(userId: string, naarIso: string): Promise<boolean>;
};

export type NudgeResultat = {
  sendt: number;
  sprunget: number;
  fejlet: number;
};

/**
 * Adresser der aldrig kan leveres til. E2E-testkonti på example.com bounces
 * hos enhver udbyder, og bounces koster afsender-omdømme for de RIGTIGE
 * mails (kvittering, annonce klar). Derfor sorteres de fra før afsendelse.
 */
export function kanLeveresTil(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e)) return false;
  return !/@(example|test|invalid|localhost)\.(com|org|net|dk|invalid)$/.test(e);
}

/**
 * Sender nudgen til alle kandidater. Stemplet sættes FØR mailen sendes:
 * en dublet-nudge er værre for tilliden end en manglende, og et manglende
 * stempel efter et lykkedes send ville sende igen ved næste kørsel. Fejler
 * afsendelsen, tælles den som fejlet og kan hentes frem igen ved at nulstille
 * aktivering_nudget_at for den bruger.
 *
 * Kaster aldrig: én brugers fejl må ikke standse resten af kørslen.
 */
export async function koerAktiveringsNudge(
  db: NudgeDb,
  send: (kandidat: NudgeKandidat) => Promise<void>,
  nu: number = Date.now(),
): Promise<NudgeResultat> {
  const foer = new Date(nu - NUDGE_EFTER_MS).toISOString();
  const kandidater = await db.hentKandidater(foer, NUDGE_MAKS_PR_KOERSEL);

  const resultat: NudgeResultat = { sendt: 0, sprunget: 0, fejlet: 0 };
  for (const kandidat of kandidater) {
    if (!kanLeveresTil(kandidat.email)) {
      resultat.sprunget++;
      continue;
    }
    let reserveret = false;
    try {
      reserveret = await db.stempelNudget(kandidat.id, new Date(nu).toISOString());
    } catch {
      resultat.fejlet++;
      continue;
    }
    // En anden kørsel nåede den først — så er nudgen allerede på vej
    if (!reserveret) {
      resultat.sprunget++;
      continue;
    }
    try {
      await send(kandidat);
      resultat.sendt++;
    } catch {
      resultat.fejlet++;
    }
  }
  return resultat;
}
