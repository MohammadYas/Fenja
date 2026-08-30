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
  // "Snart tør" (ejer-ordre 22/8): under 3 kreditter vises top-up øverst,
  // så man opdager det FØR man står midt i en annonce uden dækning.
  snartToemUnder: 3,
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

// Billedmodeller (ejer-ordre 2026-08-23: "jeg skal på admin-panelet vælge
// hvilken model brugerne skal have"). Kataloget her er de GODKENDTE modeller;
// selve valget pr. formål bor i databasen og sættes i /admin → Billedmodel
// (lib/admin/billedmodel-valg.ts). Providerne hårdkoder aldrig en model — de
// får den udleveret. Cost-skøn kalibreres mod faktiske regninger (G-1/NFR-11).
//
// Alle fal-modeller i kataloget er edit-endpoints med SAMME inputform
// ({ prompt, image_urls, image_size }) — det er betingelsen for at de kan
// deles om én provider. Tilføjes en model med en anden inputform, skal
// FalImageProvider udvides FØR den lægges her.
export type BilledProviderNavn = "fal" | "gemini";
export type BilledFormaal = "preview" | "final";

export type BilledModel = {
  /** Stabilt id — gemmes i databasen, må aldrig ændres efter valg er truffet */
  id: string;
  navn: string;
  provider: BilledProviderNavn;
  /** Leverandørens model-id: Gemini-modelnavn eller fal-endpoint */
  model: string;
  costDkk: number;
  /** Hvad leverandøren lægger i filen — vises råt i admin, så valget er oplyst */
  vandmaerke: string;
  /** Én linje til admin: hvad modellen er god til */
  note: string;
  /** Model-specifikke felter til fal-kaldet (ud over prompt/image_urls/image_size) */
  ekstraInput?: Record<string, unknown>;
};

export const billedModeller: readonly BilledModel[] = [
  {
    id: "gemini-flash",
    navn: "Nano Banana (Gemini 3.1 Flash Image)",
    provider: "gemini",
    // 20/8: 2.5-generationen nedlægges løbende af Google (2.5-flash gav 404)
    model: "gemini-3.1-flash-image",
    costDkk: 0.28,
    vandmaerke: "SynthID i pixels — kan ikke slås fra",
    note: "Billig og hurtig. Standardvalget til baggrundsrens.",
  },
  {
    id: "gemini-pro",
    navn: "Nano Banana Pro (Gemini 3 Pro Image)",
    provider: "gemini",
    // Preview-endpointet blev udfaset 25/6-2026. Den stabile model er den
    // direkte Pro-erstatning og bevarer samme kvalitetsklasse.
    model: "gemini-3-pro-image",
    costDkk: 0.95,
    vandmaerke: "SynthID i pixels — kan ikke slås fra",
    note: "Den stærkeste Gemini-model til præcise produktbilleder. Standard til levering.",
  },
  {
    id: "flux-2-pro",
    navn: "FLUX.2 [pro]",
    provider: "fal",
    model: "fal-ai/flux-2-pro/edit",
    costDkk: 0.35,
    vandmaerke: "Ingen SynthID. C2PA i metadata — fjernes af metadata-rensen",
    // Målt 23/8 med pipelinens EGEN spejl-prompt: 3/3 godkendt. Ægte
    // spejlbilleder i forsidens stil, farverne rammer, kjolelængden holder.
    // Rest: snoede stropper blev glatte, denim-vasken en anelse dybere.
    note: "Testet 23/8: 3/3 godkendt på spejlbilleder. Den eneste fal-model der leverer.",
    ekstraInput: { output_format: "jpeg" },
  },
  {
    id: "qwen-edit-plus",
    navn: "Qwen Image Edit Plus",
    provider: "fal",
    model: "fal-ai/qwen-image-edit-plus",
    costDkk: 0.3,
    vandmaerke: "Ingen — åbne vægte, fal hoster selv",
    // Målt 23/8, to gange, også med pipelinens rigtige spejl-prompt: 0/3
    // begge gange. Laver ikke spejlbillede, og DIGTER tryk der ikke findes
    // (et solansigt med tekst på cardiganet, heldækkende tegneserietryk på
    // jeansene). Et opdigtet tryk er den værst tænkelige fejl på en
    // genbrugsannonce — køberen får noget helt andet end på billedet.
    note: "FRARÅDES — testet 23/8: 0/3. Laver ikke spejlbillede og digter tryk på tøjet.",
    ekstraInput: { output_format: "jpeg", num_images: 1 },
  },
  {
    id: "seedream-45",
    navn: "Seedream 4.5",
    provider: "fal",
    model: "fal-ai/bytedance/seedream/v4.5/edit",
    costDkk: 0.25,
    vandmaerke: "Ingen SynthID (kinesisk mærkning ligger i metadata og renses væk)",
    // Målt 23/8, to gange. Markant bedre med pipelinens rigtige spejl-prompt
    // — flotte spejlbilleder — men stadig 0/3: cardigan båret på bare ben
    // (bryder "aldrig bare ben"), lige ankeljeans blev vide flared, og den
    // lange kjole blev sat uden på et par jeans, så den læses som top +
    // bukser. Snit og påklædningsregler er dét, den ikke holder.
    note: "FRARÅDES — testet 23/8: 0/3. Pæne billeder, men ændrer snittet og bryder påklædningsreglerne.",
    ekstraInput: { num_images: 1 },
  },
] as const;

/** Fallback når databasen ikke er nået (migration mangler, opslag fejler) */
export const standardBilledModel: Record<BilledFormaal, string> = {
  preview: "gemini-flash",
  final: "gemini-pro",
};

export function hentBilledModel(id: string | null | undefined): BilledModel | null {
  if (!id) return null;
  return billedModeller.find((m) => m.id === id) ?? null;
}

/** Aldrig null: ukendt/slettet id falder tilbage til standarden for formålet */
export function billedModelEllerStandard(
  id: string | null | undefined,
  formaal: BilledFormaal,
): BilledModel {
  return (
    hentBilledModel(id) ??
    hentBilledModel(standardBilledModel[formaal]) ??
    billedModeller[0]!
  );
}

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

// Trialens tidsbudget hænger sammen: kørslen må bruge TIMEOUT, må senest
// STARTE ved kø-deadlinen, og klienten venter summen + margin — så kan et
// resultat, der når at starte, altid nå frem, før klienten giver op.
const TRIAL_TIMEOUT_MS = 60_000;
const TRIAL_KOE_DEADLINE_MS = 180_000;

// Gratis prøve uden konto (ejer-ordre 2026-08-25). ALT her er server-side —
// intet af det kan ændres via request-parametre. Undtagelsen fra 15/8-reglen
// om "ingen gratis annoncer": én prøve pr. person bag captcha, IP-, cookie-
// og fingerprint-værn samt et budgetloft, ejeren styrer i admin uden deploy.
export const trial = {
  // Billedstilen er hårdkodet til "liggende" (gulv/flat-lay) — de øvrige
  // stilarter vises kun som låst upsell og kan ALDRIG trigges anonymt
  visningId: "gulv",
  // Billigste godkendte model der leverer (gemini-flash 0,28 kr.); mangler
  // Gemini-nøglen falder vi tilbage til den billigste fal-model med nøgle
  billedModelId: "gemini-flash",
  billedModelReserveId: "flux-2-pro",
  maksUploadBytes: 8_000_000,
  // Nedskalering FØR provider-kaldet — halverer typisk billedomkostningen
  maksInputKantPx: 1568,
  // Anonyme får kun den vandmærkede udgave i reduceret opløsning
  maksOutputKantPx: 1024,
  // Én kørsel, ingen automatiske retries; hænger den, fejler den ærligt
  timeoutMs: TRIAL_TIMEOUT_MS,
  // Kø-deadline: er kørslen ikke STARTET inden for dette vindue (målt fra
  // rækkens oprettelse), opgives den uden provider-kald — den besøgende er
  // væk, og et sent COMPLETED ville både koste penge for et resultat ingen
  // ser og låse IP'en urimeligt i 7 dage (prod-hændelse 26/8)
  koeDeadlineMs: TRIAL_KOE_DEADLINE_MS,
  // Klientens samlede ventetid: kø-deadline + kørselsloft + margin — en
  // kørsel der når at starte, kan altså ALTID nå frem inden klienten giver
  // op. Sidste status-tjek sker FØR der vises en fejl (prov-klient.tsx).
  klientVenteMs: TRIAL_KOE_DEADLINE_MS + TRIAL_TIMEOUT_MS + 30_000,
  // Vinduet for cookie-værnet. Kun COMPLETED trials tæller — en fejlet prøve
  // låser ikke, så den besøgende har ét ærligt forsøg mere.
  // Navnet er historisk: IP'en blokerer IKKE længere (ejer-ordre 27/8,
  // CGNAT ramte fremmede på samme mastenet) — se lib/trial/vaern.ts.
  ipVinduesDage: 7,
  // Spike-beskyttelse pr. time; det PRIMÆRE værn er budgetloftet i admin.
  // 30 (26/8, før 10): linket deles aktivt til mange på én gang, og en bølge
  // af ægte besøgende må ikke afvises — budgetloftet begrænser stadig døgnet
  maksPrTime: Number(process.env.TRIAL_HOURLY_CAP ?? 30),
  // Default for admin-indstillingen "dagligt budgetloft for trials"
  standardDagligtBudgetDkk: 200,
  // Konservativt skøn pr. trial (analyse 0,02 + billede 0,28 + tekst 0,03)
  // til budget-tællingen FØR kørslen; den faktiske sum logges efter
  costEstimatDkk: 0.35,
  cookieNavn: "selja_proev",
  cookieDage: 30,
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

// Hjemmet på billederne (ejer-ordre 22/8): man får ét tildelt og kan
// rotere det et begrænset antal gange — det er ikke et frit gavebord.
// Formålet er konsistens: samme sælger = samme sted på alle annoncer.
export const hjemRotation = {
  maks: 3,
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
