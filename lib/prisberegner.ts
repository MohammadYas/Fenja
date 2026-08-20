// Prisberegneren (ejer-ordre 2026-08-20: pristjekkeren med 10 faste søgninger
// var ubrugelig — værktøjet skal give et svar for ENHVER vare). Vejledende
// estimat: basispris pr. kategori × mærke-faktor × stand-faktor, kalibreret
// mod markedshøstens medianer (lib/data/markedspriser.ts). Kalibrerings-
// eksempler (høst 14/8-2026): carhartt jakke 450 kr. ≈ 250×1,8 · adidas
// samba 316 ≈ 180×1,8 · ganni kjole 280 ≈ 150×1,8 · nike sneakers 175 ≈
// 180×1,0 · h&m striktrøje ≈ 120×0,5. Ærlighed: altid mærket "vejledende".

export type Kategori =
  | "striktroeje"
  | "kjole"
  | "jeans"
  | "jakke"
  | "sneakers"
  | "taske";

export type MaerkeTier = "budget" | "mellem" | "premium" | "designer";
export type Stand = "nyMedMaerke" | "somNy" | "god" | "brugt" | "slidt";

export const KATEGORIER: { id: Kategori; navn: string }[] = [
  { id: "striktroeje", navn: "Striktrøje" },
  { id: "kjole", navn: "Kjole" },
  { id: "jeans", navn: "Jeans" },
  { id: "jakke", navn: "Jakke & frakke" },
  { id: "sneakers", navn: "Sneakers" },
  { id: "taske", navn: "Taske" },
];

export const MAERKE_TIERS: { id: MaerkeTier; navn: string; eksempler: string }[] = [
  { id: "budget", navn: "Fast fashion", eksempler: "H&M, Shein, Primark" },
  { id: "mellem", navn: "Mellembrand", eksempler: "Weekday, Monki, Nike, Rains" },
  { id: "premium", navn: "Premium", eksempler: "Ganni, Carhartt, COS, Samba" },
  { id: "designer", navn: "Designer", eksempler: "Acne, Baum, Won Hundred" },
];

export const STANDE: { id: Stand; navn: string }[] = [
  { id: "nyMedMaerke", navn: "Ny med prismærke" },
  { id: "somNy", navn: "Som ny" },
  { id: "god", navn: "God stand" },
  { id: "brugt", navn: "Brugt" },
  { id: "slidt", navn: "Slidt" },
];

const BASIS_DKK: Record<Kategori, number> = {
  striktroeje: 120,
  kjole: 150,
  jeans: 110,
  jakke: 250,
  sneakers: 180,
  taske: 200,
};

const MAERKE_FAKTOR: Record<MaerkeTier, number> = {
  budget: 0.25, // fast fashion går meget lavt brugt (h&m striktrøje: median 30 kr.)
  mellem: 1,
  premium: 1.8,
  designer: 3,
};

const STAND_FAKTOR: Record<Stand, number> = {
  nyMedMaerke: 1.4,
  somNy: 1.15,
  god: 1,
  brugt: 0.75,
  slidt: 0.5,
};

const rundTilFem = (kr: number): number => Math.max(5, Math.round(kr / 5) * 5);

export type PrisEstimat = {
  fraDkk: number;
  tilDkk: number;
  medianDkk: number;
};

/** Vejledende prisestimat — interval er ±30 % omkring det kalibrerede punkt */
export function beregnPris(
  kategori: Kategori,
  tier: MaerkeTier,
  stand: Stand,
): PrisEstimat {
  const punkt = BASIS_DKK[kategori] * MAERKE_FAKTOR[tier] * STAND_FAKTOR[stand];
  return {
    fraDkk: rundTilFem(punkt * 0.7),
    tilDkk: rundTilFem(punkt * 1.3),
    medianDkk: rundTilFem(punkt),
  };
}

/** Zone-feedback til pris-slideren: hvor ligger brugerens pris ift. lejet? */
export type PrisZone = "hurtig" | "balance" | "taalmodig" | "over";

export function prisZone(prisDkk: number, estimat: PrisEstimat): PrisZone {
  if (prisDkk < estimat.fraDkk) return "hurtig";
  if (prisDkk <= estimat.medianDkk) return "balance";
  if (prisDkk <= estimat.tilDkk) return "taalmodig";
  return "over";
}

/** Søgbar Vinted-titel: mærke + type + evt. farve + evt. størrelse (C-krav:
 *  titler skal være søgbare — samme regel som appens annonce-titler) */
export function bygTitel(input: {
  kategori: Kategori;
  maerke: string;
  farve?: string;
  stoerrelse?: string;
}): string {
  const type = KATEGORIER.find((k) => k.id === input.kategori)?.navn ?? "";
  const dele = [
    `${input.maerke.trim()} ${type.toLowerCase()}`.trim(),
    input.farve?.trim() || null,
    input.stoerrelse?.trim() ? `str. ${input.stoerrelse.trim()}` : null,
  ].filter(Boolean);
  return dele.join(" · ");
}

/** Kategori-specifikke salgstips — ærlige, konkrete, ingen løfter */
export const SALGSTIPS: Record<Kategori, string[]> = {
  striktroeje: [
    "Fotografér strikken tæt, så masker og kvalitet kan ses",
    "Mål brystvidden og skriv den i beskrivelsen",
    "Nævn materialet fra vaskemærket — uld sælger bedre end 'strik'",
  ],
  kjole: [
    "Vis kjolen båret eller på bøjle i fuld længde",
    "Skriv længden i cm — 'midi' betyder noget forskelligt for alle",
    "Nævn om stoffet er gennemsigtigt eller kræver underkjole",
  ],
  jeans: [
    "Mål livvidde og indvendig benlængde i cm",
    "Vis pasformen båret — det er den, der sælger jeans",
    "Skriv W/L-størrelsen i titlen, det søger folk på",
  ],
  jakke: [
    "Fotografér i dagslys — mørkt overtøj drukner indenfor",
    "Vis lynlås, knapper og for tæt på",
    "Skriv skulderbredden ved oversized snit",
  ],
  sneakers: [
    "Vis slid på sål og hæl ærligt — det sparer retur-bøvl",
    "Rens dem før fotografering; det kan være 100 kr. værd",
    "Tag et billede af størrelsesmærket indvendigt",
  ],
  taske: [
    "Vis hjørner og hank tæt på — det er dér, slid ses",
    "Tag et billede af indersiden",
    "Mål bredde × højde og skriv det i beskrivelsen",
  ],
};

/** Høst-søgningerne som presets, så toplisterne kan udfylde beregneren */
export const HOEST_PRESETS: Record<
  string,
  { kategori: Kategori; tier: MaerkeTier }
> = {
  "carhartt jakke": { kategori: "jakke", tier: "premium" },
  "levi's 501": { kategori: "jeans", tier: "mellem" },
  "adidas samba": { kategori: "sneakers", tier: "premium" },
  "nike sneakers": { kategori: "sneakers", tier: "mellem" },
  "rains jakke": { kategori: "jakke", tier: "mellem" },
  "ganni kjole": { kategori: "kjole", tier: "premium" },
  // Gestuz går som mellembrand på Vinted (høst-median 140 kr.)
  "gestuz kjole": { kategori: "kjole", tier: "mellem" },
  "cos striktrøje": { kategori: "striktroeje", tier: "premium" },
  "h&m striktrøje": { kategori: "striktroeje", tier: "budget" },
  "weekday jeans": { kategori: "jeans", tier: "mellem" },
};
