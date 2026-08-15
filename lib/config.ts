// Central konfiguration — justérbare forretningsværdier samlet ét sted.

export const kreditter = {
  gratisVedSignup: 3, // E-1
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
