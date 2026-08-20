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
