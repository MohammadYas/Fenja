// Central konfiguration — justérbare forretningsværdier samlet ét sted.

// Produktets domæne — ÉN kilde til alle domæne-referencer. PLACEHOLDER indtil
// ejeren bekræfter det købte domæne; i produktion sættes NEXT_PUBLIC_SITE_URL,
// ellers skiftes kun denne ene linje.
export const SELJA_DOMAIN = "selja.studio";

// Sidens offentlige base-URL. Bruges hvor der ikke findes en request-origin
// (Trigger.dev-jobs, transaktionsmails) til at bygge absolutte links. Samme
// kilde og fallback som app/robots.ts og sitemap'et.
export const site = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SELJA_DOMAIN}`,
} as const;

export const kreditter = {
  // E-1 slået fra (ejer-beslutning 2026-08-15): gratis annoncer inviterer
  // misbrug via nye konti/devices — alle annoncer kræver købte kreditter.
  gratisVedSignup: 0,
  // Startpriser jf. E-2 — kan justeres her
  pakker: [
    { id: "pakke-10", antal: 10, prisDkk: 29 },
    { id: "pakke-30", antal: 30, prisDkk: 69 },
  ],
  prisPrAnnonce: 1, // kreditter trukket pr. leveret annonce
  // B-8: regenerering af en enkeltdel (ny visualisering/ny tekst) til
  // reduceret pris. Ejer-justerbar — ½ kredit er startprisen.
  prisRegenerering: 0.5,
} as const;

// B2B-henvendelser (UGC-annoncer/hjemmesider) — skift til domæne-mail når
// domænet er registreret (HANDOFF §6.7).
export const kontakt = {
  email: "visual.studio.tuturials@gmail.com",
} as const;

// Billedprovider pr. formål — Gate 1-trekampens vinder aktiveres her med ÉN
// linje, uden kodeændring. fal fjernes ALDRIG: den er failover (opgave-krav).
// Gemini-model-id'er og cost-skøn bor her som config — providerne hårdkoder
// aldrig modeller. Cost-skøn kalibreres i S12 mod faktiske priser (G-1/NFR-11).
export type BilledProviderNavn = "fal" | "gemini";
export type BilledFormaal = "preview" | "final";

export const billedProvidere: {
  valg: Record<BilledFormaal, BilledProviderNavn>;
  gemini: Record<BilledFormaal, { model: string; costDkk: number }>;
} = {
  valg: {
    preview: "fal",
    final: "fal",
  },
  gemini: {
    preview: { model: "gemini-2.5-flash-image", costDkk: 0.28 }, // Nano Banana
    final: { model: "gemini-3-pro-image-preview", costDkk: 0.95 }, // Nano Banana Pro
  },
};

export const pipeline = {
  troskabsTaerskel: 0.7, // K1 — kalibreres i S12 mod rigtige providers
  onModelForsoeg: 2, // 1 retry med strammere reference (C-3)
  strammereReferenceVaegt: 0.85,
  normalReferenceVaegt: 0.65,
  antalOnModelBilleder: 1,
} as const;

export const upload = {
  maksFotoBytes: 1_500_000, // B-2: ≤ 1,5 MB pr. foto efter komprimering
  maksKantPx: 2048,
  roller: ["full", "back", "label", "defect"] as const,
  paakraevedeRoller: ["full"] as const,
} as const;

export const misbrugsvaern = {
  maksAnnoncerPrBrugerPrDag: 15, // E-5 rate limit
  // B-8: loft pr. item — originalen + op til 3 regenereringer pr. delaftype
  maksGenereringerPrDel: 4,
  // Globalt dagligt loft i kr. — kill-switch når nået; kan overstyres med env
  dagligtBudgetloftDkk: Number(process.env.DAILY_BUDGET_CAP_DKK ?? 200),
} as const;

export const vinted = {
  standskala: [
    "Ny med prismærke",
    "Ny uden prismærke",
    "Rigtig god",
    "God",
    "Tilfredsstillende",
  ] as const,
} as const;
