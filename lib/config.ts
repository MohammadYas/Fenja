// Central konfiguration — justérbare forretningsværdier samlet ét sted.

// Produktets domæne — ÉN kilde til alle domæne-referencer. Ejeren købte
// selja.dk 2026-08-21. Dette er kun fallback'en: i produktion vinder
// NEXT_PUBLIC_SITE_URL, som peger på selja.netlify.app indtil DNS'en for
// selja.dk er lagt om.
export const SELJA_DOMAIN = "selja.dk";

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
  // Pricing v3.0 (ejer-beslutning 2026-08-16): tre pakker med tydelig
  // værdistige — prisen pr. annonce falder fra Prøv (9,80) over Sælger (5,93)
  // til Bunke (4,23). Navnene bor i lib/copy/da.ts (NFR-12).
  // Ejer-ordre 21/8 ("skal have omsætning"): pakkerne er TILBAGE i UI'et som
  // engangskøb for alle — lav indgang uden abonnement. Ny stor pakke "Lager"
  // til reselleren; stykprisen (3,49) holder sig over Pro-årets 3,31, så
  // abonnementet stadig er det bedste valg for faste sælgere.
  pakker: [
    { id: "proev", antal: 5, prisDkk: 49 },
    { id: "saelger", antal: 15, prisDkk: 89 },
    { id: "bunke", antal: 40, prisDkk: 169 },
    { id: "lager", antal: 100, prisDkk: 349 },
  ],
  // Ankeret på /priser — den pakke vi anbefaler (ærlig anbefaling, intet pres)
  anbefaletPakkeId: "saelger",
  // Top-up: impulskøbet — vises KUN for indloggede på kreditsiden når man er
  // løbet tør (aldrig på offentlig /priser). Ejer-ordre 2026-08-16: abonnement
  // er standardvejen; top-up først når saldoen ikke rækker til én hel annonce.
  topUp: { id: "fyld-op", antal: 10, prisDkk: 69 },
  topUpVedSaldoHoejst: 0.5,
  // Alle købte kreditter (pakker, top-up og abonnementskvoter) gælder 12
  // måneder fra købsdatoen; udløbne kreditter bortfalder i saldo-beregningen.
  udloebMdr: 12,
  prisPrAnnonce: 1, // kreditter trukket pr. leveret annonce
  // B-8: regenerering af en enkeltdel (ny visualisering/ny tekst) til
  // reduceret pris. Ejer-justerbar — ½ kredit er startprisen.
  prisRegenerering: 0.5,
} as const;

// Abonnementer (pricing v3.0): månedskvote der brændes før købte kreditter —
// se forbrugsrækkefølgen i lib/credits/ledger.ts. Årsprisen svarer til 10 mdr.
export const abonnementer = {
  // Rollover: ubrugt kvote følger med til næste måned, men den samlede
  // abonnements-saldo er loftet til rolloverLoftFaktor × månedskvoten, så
  // kvoten ikke bliver en ubegrænset opsparing. FORSLAG — ejeren har ikke
  // eksplicit besluttet et loft; flaget i PR'en.
  rolloverLoftFaktor: 2,
  tiers: [
    {
      id: "plus",
      annoncerPrMd: 12,
      prisDkkPrMd: 59,
      prisDkkPrAar: 590,
      // Feature-flags pr. tier — selve favorit-overvågningen er en senere
      // opgave (BACKLOG S35); flagene her er den fulde konfiguration.
      favoritOvervaagning: {
        maksFavoritter: 25 as number | null, // null = uden loft
        opdatering: "daglig" as "daglig" | "realtid",
        prisanbefaling: "statisk" as "statisk" | "dynamisk",
        konkurrentVarsler: false,
        batchPrisredigering: false,
      },
    },
    {
      id: "pro",
      annoncerPrMd: 30,
      prisDkkPrMd: 119,
      prisDkkPrAar: 1190,
      favoritOvervaagning: {
        maksFavoritter: null as number | null,
        opdatering: "realtid" as "daglig" | "realtid",
        prisanbefaling: "dynamisk" as "statisk" | "dynamisk",
        konkurrentVarsler: true,
        batchPrisredigering: true,
      },
    },
  ],
} as const;

export type AbonnementsTier = (typeof abonnementer.tiers)[number];

// Stripe-pris-id'er for abonnementerne — TESTMODE-PLADSHOLDERE. Ejeren
// opretter priserne i Stripe testmode (HANDOFF §6.5) og sætter de rigtige
// id'er her eller via env. Pakker og top-up bruger inline price_data og
// behøver ingen id'er. ALDRIG rigtige nøgler/id'er committet.
export const stripePriser = {
  plusMd: process.env.STRIPE_PRICE_PLUS_MD ?? "price_test_plus_md",
  plusAar: process.env.STRIPE_PRICE_PLUS_AAR ?? "price_test_plus_aar",
  proMd: process.env.STRIPE_PRICE_PRO_MD ?? "price_test_pro_md",
  proAar: process.env.STRIPE_PRICE_PRO_AAR ?? "price_test_pro_aar",
} as const;

// B2B-henvendelser (UGC-annoncer/hjemmesider) — skift til domæne-mail når
// domænet er registreret (HANDOFF §6.7).
export const kontakt = {
  email: "visual.studio.tuturials@gmail.com",
} as const;

// Billedprovider pr. formål. EJER-BESLUTNING 2026-08-19: kun Gemini — fal
// bruges ikke (koden ligger stadig i lib/providers/fal.ts, men er ude af
// valg og failover). Gemini-model-id'er og cost-skøn bor her som config —
// providerne hårdkoder aldrig modeller. Cost-skøn kalibreres i S12 (G-1/NFR-11).
export type BilledProviderNavn = "fal" | "gemini";
export type BilledFormaal = "preview" | "final";

export const billedProvidere: {
  valg: Record<BilledFormaal, BilledProviderNavn>;
  gemini: Record<BilledFormaal, { model: string; costDkk: number }>;
} = {
  valg: {
    preview: "gemini",
    final: "gemini",
  },
  gemini: {
    // 20/8: 2.5-generationen nedlægges løbende af Google (2.5-flash gav 404)
    // — preview kører nu på den stabile 3.1-flash-image. Bruges til
    // baggrundsrens (økonomi: 0,28 vs. 0,95 kr. — ejer-ordre 20/8).
    preview: { model: "gemini-3.1-flash-image", costDkk: 0.28 },
    final: { model: "gemini-3-pro-image-preview", costDkk: 0.95 }, // Nano Banana Pro
  },
};

// Vagthund på AI-omkostningen pr. komplet annonce (NFR-11: budget ≤ 2 kr.).
// Overstiger det rullende gennemsnit tærsklen i vinduet, varsles ejeren på
// kontakt-adressen (IKKE en hårdkodet domæne-mail — domænet er ikke
// registreret endnu). Selve varslingen kobles på admin-siden (G-1) senere.
export const aiCostWatch = {
  taerskelDkkPrAnnonce: 3,
  vinduesDage: 14,
  alertEmail: kontakt.email,
} as const;

// Preview-tilstand (ejer-beslutning 2026-08-16): 3 gratis previews pr. konto,
// estimeret kostpris 0,60 kr. pr. preview, globalt dagligt budget 50 kr.
// Kun konfigurationen her — selve preview-flowet er en senere opgave.
export const preview = {
  gratisPrKonto: 3,
  costEstimatDkk: 0.6,
  dagligtBudgetDkk: 50,
} as const;

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

// Bundle-bygger (kun Pro, 21/8 nat): pakkepris = samlet værdi minus rabat
export const bundle = {
  maksItems: 4,
  rabatPct: 12,
} as const;

export const vinted = {
  // Vinteds danske standskala 1:1 (ejer-ordre 2026-08-20; aflæst fra
  // vinted.dk samme dag) — labels må ikke omformuleres
  standskala: [
    "Ny med prismærker",
    "Ny uden prismærker",
    "Meget god",
    "God",
    "Tilfredsstillende",
  ] as const,
} as const;
