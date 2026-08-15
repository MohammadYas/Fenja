// Markedsanalyse på Vinted — fælles typer og RENE funktioner (ingen netværk,
// ingen filsystem her; det bor i hent.ts/analyser.ts/rapport.ts).
// Ejer-værktøj der køres i hånden — aldrig i CI og aldrig fra appen.
//
// Privatliv: sanerItem kopierer KUN whitelistede varefelter. Sælger-objektet
// (user), fotos og alt andet personhenførbart når aldrig disken.

export type Soegning = {
  /** Slug til filnavne og gruppering, fx "ganni-kjole" */
  navn: string;
  /** Fritekst-søgningen mod kataloget */
  soegetekst: string;
  /** Overskrift i rapporten, fx "Kjoler" */
  kategori: string;
};

export type MarkedsItem = {
  id: number;
  titel: string;
  /** Sælgers pris i DKK (uden køberbeskyttelse) */
  prisDkk: number;
  /** Pris inkl. køberbeskyttelse, når feltet findes */
  totalPrisDkk: number | null;
  maerke: string | null;
  stoerrelse: string | null;
  /** Vinteds danske standskala, fx "Ny med prismærke" */
  stand: string | null;
  favoritter: number;
  visninger: number;
  /** Epoch-sekunder for annoncens fotoupload — bedste offentlige alders-proxy */
  oprettetTs: number | null;
  /** Soegning.navn den blev fundet under */
  soegning: string;
  kategori: string;
  /** Epoch-sekunder for høsten */
  hentetTs: number;
};

export type Snapshot = {
  soegning: Soegning;
  side: number;
  hentetTs: number;
  /** Katalogets samlede udbud for søgningen (pagination.total_entries) */
  totaltUdbud: number | null;
  items: MarkedsItem[];
};

export type Gruppestatistik = {
  antal: number;
  medianPris: number;
  p25Pris: number;
  p75Pris: number;
  /** Median af favoritter pr. dag for annoncer ≥ 1 dag gamle; null hvis ingen */
  medianFavoritterPrDag: number | null;
  /** Andel af annoncer i stand "Ny med prismærke" (0–1) */
  andelNyMedPrismaerke: number;
};

function somObjekt(v: unknown): Record<string, unknown> | null {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function somTal(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const tal = Number(v);
    return Number.isFinite(tal) ? tal : null;
  }
  return null;
}

function somTekst(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/**
 * Whitelist-parsning af ét råt katalog-item. Returnerer null hvis id/pris
 * mangler eller valutaen ikke er DKK. Kopierer ALDRIG sælgerfelter.
 */
export function sanerItem(
  raa: unknown,
  soegning: Soegning,
  hentetTs: number,
): MarkedsItem | null {
  const item = somObjekt(raa);
  if (!item) return null;

  const id = somTal(item.id);
  const pris = somObjekt(item.price);
  const prisDkk = pris ? somTal(pris.amount) : null;
  if (id === null || prisDkk === null || prisDkk < 0) return null;
  if (somTekst(pris?.currency_code) !== "DKK") return null;

  const totalPris = somObjekt(item.total_item_price);
  const totalPrisDkk =
    somTekst(totalPris?.currency_code) === "DKK" ? somTal(totalPris?.amount) : null;

  const foto = somObjekt(item.photo);
  const hoej = somObjekt(foto?.high_resolution);

  return {
    id,
    titel: somTekst(item.title) ?? "",
    prisDkk,
    totalPrisDkk,
    maerke: somTekst(item.brand_title),
    stoerrelse: somTekst(item.size_title),
    stand: somTekst(item.status),
    favoritter: somTal(item.favourite_count) ?? 0,
    visninger: somTal(item.view_count) ?? 0,
    oprettetTs: somTal(hoej?.timestamp),
    soegning: soegning.navn,
    kategori: soegning.kategori,
    hentetTs,
  };
}

/** Dubletter (samme annonce set i flere høst) — nyeste observation vinder */
export function dedupPaaId(items: MarkedsItem[]): MarkedsItem[] {
  const prId = new Map<number, MarkedsItem>();
  for (const item of items) {
    const kendt = prId.get(item.id);
    if (!kendt || item.hentetTs > kendt.hentetTs) prId.set(item.id, item);
  }
  return [...prId.values()];
}

/** Kvartil med lineær interpolation; p i [0,1]. null ved tom liste. */
export function kvartil(tal: number[], p: number): number | null {
  if (tal.length === 0) return null;
  const sorteret = [...tal].sort((a, b) => a - b);
  const plads = (sorteret.length - 1) * p;
  const under = Math.floor(plads);
  const over = Math.ceil(plads);
  const nedre = sorteret[under];
  const oevre = sorteret[over];
  if (nedre === undefined || oevre === undefined) return null;
  return nedre + (oevre - nedre) * (plads - under);
}

export function median(tal: number[]): number | null {
  return kvartil(tal, 0.5);
}

/**
 * Efterspørgsels-proxy: favoritter pr. dag siden upload. Kræver at annoncen
 * er mindst ét døgn gammel — ellers null (for støjende).
 */
export function favoritterPrDag(item: MarkedsItem, nuTs: number): number | null {
  if (item.oprettetTs === null) return null;
  const dage = (nuTs - item.oprettetTs) / 86_400;
  if (dage < 1) return null;
  return item.favoritter / dage;
}

// Vinteds DK-streng er i flertal — "Ny med prismærker" (verificeret mod
// kataloget 2026-08-15)
export const STAND_NY_MED_PRISMAERKE = "Ny med prismærker";

export function beregnGruppe(
  items: MarkedsItem[],
  nuTs: number,
): Gruppestatistik | null {
  if (items.length === 0) return null;
  const priser = items.map((i) => i.prisDkk);
  const efterspoergsel = items
    .map((i) => favoritterPrDag(i, nuTs))
    .filter((v): v is number => v !== null);
  const medianPris = median(priser);
  const p25Pris = kvartil(priser, 0.25);
  const p75Pris = kvartil(priser, 0.75);
  if (medianPris === null || p25Pris === null || p75Pris === null) return null;
  return {
    antal: items.length,
    medianPris,
    p25Pris,
    p75Pris,
    medianFavoritterPrDag: median(efterspoergsel),
    andelNyMedPrismaerke:
      items.filter((i) => i.stand === STAND_NY_MED_PRISMAERKE).length / items.length,
  };
}

export function grupperEfter<T>(
  liste: T[],
  noegle: (element: T) => string,
): Map<string, T[]> {
  const grupper = new Map<string, T[]>();
  for (const element of liste) {
    const k = noegle(element);
    const gruppe = grupper.get(k);
    if (gruppe) gruppe.push(element);
    else grupper.set(k, [element]);
  }
  return grupper;
}

/** "550 kr." — heltal, dansk tusindtalspunktum */
export function formaterKr(vaerdi: number): string {
  return `${Math.round(vaerdi).toLocaleString("da-DK")} kr.`;
}

/** Dansk decimaltal med fast antal decimaler, fx 0,42 */
export function formaterTal(vaerdi: number, decimaler: number): string {
  return vaerdi.toLocaleString("da-DK", {
    minimumFractionDigits: decimaler,
    maximumFractionDigits: decimaler,
  });
}
