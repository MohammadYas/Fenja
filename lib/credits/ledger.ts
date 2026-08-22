// Kredit-ledger (E-1..E-5): hver bevægelse er en linje, saldoen er summen.
// Al skrivning går gennem SQL-funktionen tilfoej_kreditter (transaktionel,
// idempotent — se migration 20260814130000). Dette lag ejer idempotency-nøglerne,
// så dubletter fra webhooks/jobs aldrig koster dobbelt (E-4).
//
// Pricing v3.0 (ejer-beslutning 2026-08-16): hver kreditering bærer en kilde
// og evt. udløbsdato, og forbrug dækkes i en fast rækkefølge. Rækkefølgen ER
// prisstrategien — ærligt begrundet, intet skjult for brugeren:
//   1) subscription — månedskvoten brændes først, så en abonnent aldrig
//      oplever at kvoten gik til spilde mens købte kreditter blev brugt.
//   2) topup — de dyreste engangskreditter pr. stk. brændes før pakkerne,
//      så pakke-lageret består (fyldt lager = mindre grund til at churne).
//   3) pack — ældste købsdato først (FIFO): de udløber først og er derfor
//      mindst værd at gemme. NB: ejerens brief var tvetydig her ("ældste
//      sidst" ét sted, "ældste først" et andet) — FIFO er implementeret og
//      valget er flaget i PR'en, så ejeren kan omgøre det.
//   Kilde-løse bevægelser (refunds + alt fra før v3.0) udløber aldrig og
//   brændes sidst — det mest generøse valg for brugeren.
// Udløb (12 mdr., lib/config.ts) håndhæves i beregningen: udløbne kreditter
// bortfalder automatisk. Se lib/credits/beregn.ts + migration 20260816100000.

import { abonnementer, kreditter } from "@/lib/config";
import type { KreditKilde, KreditStatus } from "./beregn";

export type { KreditKilde, KreditStatus } from "./beregn";

export type LedgerAarsag =
  | "signup"
  | "purchase"
  | "delivery"
  | "refund"
  | "regen"
  | "subscription"
  // Manuel tildeling fra admin-panelet (support/kompensation/kampagne, 22/8)
  | "admin";

// Tyndt db-interface så logikken kan testes uden Supabase (NFR-5)
export interface LedgerDb {
  tilfoejKreditter(params: {
    userId: string;
    delta: number;
    reason: LedgerAarsag;
    idempotencyKey: string;
    stripeRef?: string;
    kilde?: KreditKilde;
    udloeber?: Date;
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }>;
  hentSaldo(userId: string): Promise<number>;
  hentStatus(userId: string): Promise<KreditStatus>;
}

export class UtilstraekkeligSaldoFejl extends Error {
  constructor() {
    super("Ikke nok kreditter til leverancen");
  }
}

// Idempotency-nøgler: stabile og entydige pr. forretningshændelse
export const noegler = {
  signup: (userId: string) => `signup:${userId}`,
  koeb: (stripeEventId: string) => `koeb:${stripeEventId}`,
  topUp: (stripeEventId: string) => `topup:${stripeEventId}`,
  // Abonnementskvote: nøglen er fakturareferencen (én pr. betalingsperiode),
  // så Stripes gentagne leveringsforsøg aldrig giver dobbelt kvote
  abonnement: (fakturaRef: string) => `abo:${fakturaRef}`,
  levering: (itemId: string) => `levering:${itemId}`,
  // Ejer-ordre 20/8: kreditterne RESERVERES når genereringen sættes i gang —
  // 1 kredit pr. valgt visning, idempotent pr. (item, visningstype). Fejler
  // et billede, refunderes præcis dét (refundVisning). Ingen gratis API-spam.
  visning: (itemId: string, visningId: string) => `visning:${itemId}:${visningId}`,
  refundVisning: (itemId: string, visningId: string) =>
    `refund-visning:${itemId}:${visningId}`,
  refundOnModel: (itemId: string) => `refund-onmodel:${itemId}`,
  // B-8: nøglen er requestId (mintet af API-routen), så genkørsler af samme
  // regenerering aldrig koster dobbelt
  regen: (requestId: string) => `regen:${requestId}`,
  // Klage-refusion (ejer-godkendt i admin): nøglen er klage-id, så en klage
  // aldrig kan refunderes dobbelt — uanset hvor mange gange der klikkes
  klage: (klageId: string) => `refund-klage:${klageId}`,
} as const;

/** Udløbsdato for en kreditering: 12 mdr. fra købsdatoen (lib/config.ts) */
export function nyUdloebsdato(fra: Date = new Date()): Date {
  const dato = new Date(fra);
  dato.setMonth(dato.getMonth() + kreditter.udloebMdr);
  return dato;
}

/** E-1: gratis-kreditter ved signup — idempotent pr. bruger.
 *  Ejer-beslutning 2026-08-15: gratis-tier er slået fra (misbrugsrisiko med
 *  nye konti/devices). Med gratisVedSignup ≤ 0 er kaldet en no-op, så første
 *  login ikke skriver tomme ledger-rækker. */
export async function tilfoejSignupKreditter(db: LedgerDb, userId: string): Promise<number> {
  if (kreditter.gratisVedSignup <= 0) return db.hentSaldo(userId);
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: kreditter.gratisVedSignup,
    reason: "signup",
    idempotencyKey: noegler.signup(userId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** E-2: pakkekøb via Stripe — idempotent pr. Stripe-event, dubletter er no-ops.
 *  v3.0: kilden er 'pack' og kreditterne gælder 12 mdr. fra købet. */
export async function registrerKoeb(
  db: LedgerDb,
  userId: string,
  antalKreditter: number,
  stripeEventId: string,
): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: antalKreditter,
    reason: "purchase",
    idempotencyKey: noegler.koeb(stripeEventId),
    stripeRef: stripeEventId,
    kilde: "pack",
    udloeber: nyUdloebsdato(),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** v3.0: top-up-køb ("Fyld op") — som pakkekøb, men kilden 'topup' brændes
 *  før pakkerne (se forbrugsrækkefølgen øverst). Idempotent pr. Stripe-event. */
export async function registrerTopUp(
  db: LedgerDb,
  userId: string,
  antalKreditter: number,
  stripeEventId: string,
): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: antalKreditter,
    reason: "purchase",
    idempotencyKey: noegler.topUp(stripeEventId),
    stripeRef: stripeEventId,
    kilde: "topup",
    udloeber: nyUdloebsdato(),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** v3.0: månedskvote fra et abonnement (Plus/Pro) — idempotent pr. faktura.
 *  Rollover med loft: ubrugt kvote følger med, men den samlede abonnements-
 *  saldo er loftet til rolloverLoftFaktor × månedskvoten, så kvoten ikke
 *  bliver en ubegrænset opsparing (FORSLAG — flaget i PR'en). */
export async function registrerAbonnementsKvote(
  db: LedgerDb,
  userId: string,
  tierId: (typeof abonnementer.tiers)[number]["id"],
  fakturaRef: string,
): Promise<number> {
  const tier = abonnementer.tiers.find((t) => t.id === tierId);
  if (!tier) throw new Error(`Ukendt abonnements-tier: ${tierId}`);
  const status = await db.hentStatus(userId);
  const loft = tier.annoncerPrMd * abonnementer.rolloverLoftFaktor;
  const kvote = Math.min(
    tier.annoncerPrMd,
    Math.max(0, loft - status.prKilde.subscription),
  );
  if (kvote <= 0) return status.saldo;
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: kvote,
    reason: "subscription",
    idempotencyKey: noegler.abonnement(fakturaRef),
    stripeRef: fakturaRef,
    kilde: "subscription",
    udloeber: nyUdloebsdato(),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** E-3: træk ved leverance — kaldes i samme flow som leverancen markeres komplet */
export async function traekLevering(db: LedgerDb, userId: string, itemId: string): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: -kreditter.prisPrAnnonce,
    reason: "delivery",
    idempotencyKey: noegler.levering(itemId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** B-6: automatisk refund når visualiseringen fejler men rens+tekst leveres */
export async function refunderOnModel(db: LedgerDb, userId: string, itemId: string): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: kreditter.prisPrAnnonce,
    reason: "refund",
    idempotencyKey: noegler.refundOnModel(itemId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** Klage-refusion (ejer-ordre 2026-08-20): når ejeren godkender en klage i
 *  admin, får brugeren annonce-prisen tilbage. Idempotent pr. klage-id. */
export async function refunderKlage(
  db: LedgerDb,
  userId: string,
  klageId: string,
): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: kreditter.prisPrAnnonce,
    reason: "refund",
    idempotencyKey: noegler.klage(klageId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** Ejer-ordre 20/8: RESERVÉR kreditterne når genereringen sættes i gang —
 *  1 kredit pr. valgt visning, idempotent pr. (item, visningstype). Kaster
 *  UtilstraekkeligSaldoFejl hvis saldoen ikke rækker (intet er så trukket
 *  ud over de allerede idempotente linjer). */
export async function reserverVisninger(
  db: LedgerDb,
  userId: string,
  itemId: string,
  visningIds: readonly string[],
): Promise<number> {
  let saldo = await db.hentSaldo(userId);
  for (const visningId of visningIds) {
    const resultat = await db.tilfoejKreditter({
      userId,
      delta: -kreditter.prisPrAnnonce,
      reason: "delivery",
      idempotencyKey: noegler.visning(itemId, visningId),
    });
    if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
    saldo = resultat.saldo;
  }
  return saldo;
}

/** Automatisk refusion af ét fejlet billede — idempotent pr. (item, visning) */
export async function refunderVisning(
  db: LedgerDb,
  userId: string,
  itemId: string,
  visningId: string,
): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: kreditter.prisPrAnnonce,
    reason: "refund",
    idempotencyKey: noegler.refundVisning(itemId, visningId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

/** B-8: træk ved vellykket regenerering — reduceret pris, idempotent pr. request */
export async function traekRegenerering(
  db: LedgerDb,
  userId: string,
  requestId: string,
): Promise<number> {
  const resultat = await db.tilfoejKreditter({
    userId,
    delta: -kreditter.prisRegenerering,
    reason: "regen",
    idempotencyKey: noegler.regen(requestId),
  });
  if ("fejl" in resultat) throw new UtilstraekkeligSaldoFejl();
  return resultat.saldo;
}

export async function hentSaldo(db: LedgerDb, userId: string): Promise<number> {
  return db.hentSaldo(userId);
}

/** v3.0: fuld kreditstatus — saldo pr. kilde + tidligste udløb (kreditsiden) */
export async function hentStatus(db: LedgerDb, userId: string): Promise<KreditStatus> {
  return db.hentStatus(userId);
}
