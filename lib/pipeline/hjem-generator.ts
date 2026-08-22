// 100 hjem, genereret deterministisk fra byggeklodser (ejer-ordre 22/8:
// "du skal lave 100 hjem"). Før havde vi 5 håndskrevne hjem — med 1000
// sælgere ville 200 dele nøjagtig samme baggrund, og profilerne ville ligne
// hinanden. Nu kombineres by, bolig, spejl, gulv, lys og gade til 100
// entydige hjem, som ALLE er beskrevet i samme sprog og detaljeniveau som
// de oprindelige fem.
//
// Determinisme er ufravigelig (retries skal give samme prompt): intet
// Math.random, ingen dato — kun indeks-aritmetik. Byggeklodsernes længder er
// indbyrdes primiske ift. 100, så kombinationerne ikke gentager sig i mønster.

export type GenereretHjem = {
  id: string;
  navn: string;
  /** Rummet med spejlet — bruges af lys-minimalisme-presettet */
  spejlrum: string;
  /** Stuen — bruges af hyggelig-stue-presettet */
  stue: string;
  /** Udenfor hoveddøren — bruges af gade-presettet */
  gade: string;
};

const BYER = [
  { by: "København", kvarter: "Vesterbro", gadeType: "a cobbled side street with red-brick facades and tall bay windows" },
  { by: "København", kvarter: "Nørrebro", gadeType: "a busy cobbled street with bicycle racks and a café awning" },
  { by: "København", kvarter: "Amager", gadeType: "a wide residential street with 1930s yellow-brick blocks and small front gardens" },
  { by: "Aarhus", kvarter: "Trøjborg", gadeType: "a quiet street of low brick apartment houses with hedges along the pavement" },
  { by: "Aarhus", kvarter: "Åbyhøj", gadeType: "a suburban road with terraced houses, carports and trimmed lawns" },
  { by: "Odense", kvarter: "Hunderupkvarteret", gadeType: "a leafy street with white-rendered villas behind low picket fences" },
  { by: "Aalborg", kvarter: "Vejgaard", gadeType: "a calm residential street with red-brick semi-detached houses and paved drives" },
  { by: "Esbjerg", kvarter: "Rørkjær", gadeType: "a windswept street with painted brick houses and a bicycle leaning on a wall" },
  { by: "Roskilde", kvarter: "Trekroner", gadeType: "a new-build street with pale render, young trees and clean paving stones" },
  { by: "Kolding", kvarter: "Bramdrupdam", gadeType: "a suburban cul-de-sac with brick bungalows and a basketball hoop on a garage" },
] as const;

const BOLIGER = [
  { type: "lejlighed", navn: "lejlighed", rum: "bedroom", detalje: "a bed with pale linen bedding partly in frame" },
  { type: "raekkehus", navn: "rækkehus", rum: "entry hall", detalje: "coat hooks with jackets and shoes lined up by the door" },
  { type: "vaerelse", navn: "værelse", rum: "room", detalje: "a clothes rack with hangers in the corner" },
  { type: "villa", navn: "villa", rum: "landing", detalje: "a low chest of drawers with a stack of folded laundry" },
  { type: "nybyg", navn: "nye lejlighed", rum: "bedroom", detalje: "a plain white wardrobe with one door ajar" },
] as const;

const SPEJLE = [
  "a tall black-framed mirror leaning against the wall",
  "a narrow full-height mirror screwed flat to the wall",
  "an oval mirror with a thin brass frame",
  "a large frameless mirror leaning in the corner",
  "a rectangular mirror with a pale oak frame",
  "a slim floor mirror on a metal stand",
  "an old mirror with a chipped white painted frame",
] as const;

const GULVE = [
  "wide-plank oak floor",
  "herringbone parquet",
  "pale ash laminate",
  "grey-painted floorboards",
  "worn pine boards with visible knots",
  "light vinyl planks",
  "dark stained oak boards",
  "beige wall-to-wall carpet",
  "polished concrete floor",
  "checkered vinyl in cream and grey",
  "narrow beech strip flooring",
] as const;

const LYS = [
  "cool daylight from one tall window",
  "warm afternoon light falling across the floor",
  "flat overcast daylight from a skylight",
  "evening light with a lit bedside lamp",
  "soft morning light with sheer curtains drawn",
  "bright midday light with hard window shadows",
  "dim light with a floor lamp switched on",
  "low winter light with a warm ceiling lamp",
  "muted light from a north-facing window",
] as const;

const STUER = [
  "a beige corner sofa, a small oak side table and a floor lamp with warm light",
  "a dark green sofa, a pine bookshelf and a wool throw over the armrest",
  "a worn brown leather sofa with patina, a monstera in a pot and a rice-paper lamp",
  "a grey two-seater, a round coffee table with magazines and a woven basket",
  "a navy sofa with mismatched cushions, a rattan chair and a low bookshelf",
  "a light beige sofa bed, a folded blanket and a tall standing lamp",
  "a cream sofa, a glass coffee table and framed prints leaning against the wall",
  "a rust-coloured armchair beside a small sofa and a stack of books on the floor",
  "a black leather sofa, a chrome lamp and a jute rug",
  "a soft grey sofa with a sheepskin, a wooden stool and dried flowers in a vase",
  "a patterned vintage sofa, an old TV cabinet and a potted fig tree",
  "a deep blue sofa, a marble-look side table and a linen floor cushion",
  "a two-seater in oatmeal fabric, a low sideboard and a paper lantern",
] as const;

/** 100 hjem — indeks 0-99 giver altid nøjagtig samme hjem */
export function genererHjem(): GenereretHjem[] {
  return Array.from({ length: 100 }, (_, i) => {
    const by = BYER[i % BYER.length]!;
    const bolig = BOLIGER[i % BOLIGER.length]!;
    const spejl = SPEJLE[i % SPEJLE.length]!;
    const gulv = GULVE[i % GULVE.length]!;
    const lys = LYS[i % LYS.length]!;
    const stue = STUER[i % STUER.length]!;
    const nr = String(i + 1).padStart(3, "0");

    return {
      id: `hjem-${nr}`,
      navn: `${by.kvarter}, ${by.by} · ${bolig.navn}`,
      spejlrum: `the seller's ${bolig.rum} — always the same room: ${spejl}, ${gulv}, ${bolig.detalje}, and ${lys}`,
      stue: `the seller's living room — always the same room: ${stue}, ${gulv} and ${lys}`,
      gade: `the street outside the seller's front door in ${by.kvarter}, ${by.by} — always the same spot: ${by.gadeType}, flat everyday daylight`,
    };
  });
}
