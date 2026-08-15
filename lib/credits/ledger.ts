// Kredit-ledger (E-1..E-5): hver bevægelse er en linje, saldoen er summen.
// Al skrivning går gennem SQL-funktionen tilfoej_kreditter (transaktionel,
// idempotent — se migration 20260814130000). Dette lag ejer idempotency-nøglerne,
// så dubletter fra webhooks/jobs aldrig koster dobbelt (E-4).

import { kreditter } from "@/lib/config";

export type LedgerAarsag = "signup" | "purchase" | "delivery" | "refund" | "regen";

// Tyndt db-interface så logikken kan testes uden Supabase (NFR-5)
export interface LedgerDb {
  tilfoejKreditter(params: {
    userId: string;
    delta: number;
    reason: LedgerAarsag;
    idempotencyKey: string;
    stripeRef?: string;
  }): Promise<{ saldo: number } | { fejl: "utilstraekkelig_saldo" }>;
  hentSaldo(userId: string): Promise<number>;
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
  levering: (itemId: string) => `levering:${itemId}`,
  refundOnModel: (itemId: string) => `refund-onmodel:${itemId}`,
  // B-8: nøglen er requestId (mintet af API-routen), så genkørsler af samme
  // regenerering aldrig koster dobbelt
  regen: (requestId: string) => `regen:${requestId}`,
} as const;

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

/** E-2: køb via Stripe — idempotent pr. Stripe-event, dubletter er no-ops */
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
