// 100 hjem, genereret deterministisk fra byggeklodser (ejer-ordre 22/8).
//
// KVALITETSKRAV (ejer 22/8: "de skal være så avancerede som dem på forsiden"):
// hver blok er skrevet i SAMME detaljegrad som forside-seriens prompts i
// scripts/katalog-prompts-data.ts — konkret materiale og tekstur, ægte
// slidmærker, navngivet lysretning og hvidbalance, og levet-i rod i kanterne.
// Netop de detaljer er det, der gør billedet troværdigt i stedet for
// AI-glat: et spejl har fingeraftryk, et gulv har ridser, lyset kommer fra
// ÉN navngiven side, og der ligger noget hverdagsligt i kanten af billedet.
//
// Determinisme er ufravigelig (retries skal give samme prompt): intet
// Math.random, ingen dato — kun indeks-aritmetik. Blokkenes længder er
// indbyrdes forskellige og primiske ift. hinanden, så kombinationerne ikke
// falder i mønster hen over de 100 hjem.

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

// 10 byer/kvarterer med hver sin gadekarakter, lys og vejrlig
const BYER = [
  {
    by: "København",
    kvarter: "Vesterbro",
    gade:
      "a narrow cobbled side street of five-storey red-brick apartment houses with tall bay windows and painted ground-floor shopfronts; a couple of city bikes locked to a rack, a lamp post with old sticker residue and a worn granite kerb at the frame edge",
    gadeLys:
      "flat overcast Copenhagen daylight with almost no shadows, slightly cool white balance, damp patches drying on the cobbles",
  },
  {
    by: "København",
    kvarter: "Nørrebro",
    gade:
      "a busy cobbled street with a red-brick facade behind, a green café awning further down, an overfull bicycle rack and a chalked A-board on the pavement; a scuffed doorway with a worn brass handle at the frame edge",
    gadeLys:
      "grey diffuse afternoon light between the buildings, cool neutral white balance, faint warm spill from a shop window",
  },
  {
    by: "København",
    kvarter: "Amager",
    gade:
      "a wide residential street of 1930s yellow-brick blocks with small hedged front gardens, a low iron gate standing half open and a wheelie bin pulled to the kerb; parked cars slightly out of focus further back",
    gadeLys:
      "bright but hazy daylight from an open sky, neutral white balance, long soft shadows across the pavement",
  },
  {
    by: "Aarhus",
    kvarter: "Trøjborg",
    gade:
      "a quiet street of low brick apartment houses with clipped hedges along the pavement, a bicycle with a child seat leaning against a wall and moss between the paving slabs",
    gadeLys:
      "soft north-facing daylight, slightly cool and even, a thin overcast layer with no hard shadows",
  },
  {
    by: "Aarhus",
    kvarter: "Åbyhøj",
    gade:
      "a suburban road with terraced houses, carports and trimmed lawns; a garden hose coiled by a wall, a football left on the grass and a cracked concrete drive with weeds in the joints",
    gadeLys:
      "warm late-afternoon sun from one side, gently warm white balance, soft shadows stretching over the paving",
  },
  {
    by: "Odense",
    kvarter: "Hunderupkvarteret",
    gade:
      "a leafy street of white-rendered villas behind low picket fences, mature trees casting dappled shade, a bicycle with a basket and a chalk drawing faded on the pavement",
    gadeLys:
      "dappled daylight filtered through leaves, neutral-warm white balance, moving patches of light and shade",
  },
  {
    by: "Aalborg",
    kvarter: "Vejgaard",
    gade:
      "a calm residential street of red-brick semi-detached houses with paved drives, a hedge trimmed a little unevenly, a rolled newspaper on a step and a scuffed white front door",
    gadeLys:
      "flat pale daylight from a high overcast sky, cool-neutral white balance, very soft shadows",
  },
  {
    by: "Esbjerg",
    kvarter: "Rørkjær",
    gade:
      "a windswept street of painted brick houses with salt-worn paint at the edges, a bicycle leaning against a wall, a gate latch left open and gravel drifted along the kerb",
    gadeLys:
      "bright coastal light under fast-moving cloud, slightly cool white balance, hair and fabric moving faintly in the wind",
  },
  {
    by: "Roskilde",
    kvarter: "Trekroner",
    gade:
      "a new-build street with pale rendered facades, young staked trees, clean paving stones with visible joints and a folded cardboard box left by a doorway",
    gadeLys:
      "even bright daylight, neutral white balance, crisp but shallow shadows from a light overcast sky",
  },
  {
    by: "Kolding",
    kvarter: "Bramdrupdam",
    gade:
      "a suburban cul-de-sac of brick bungalows with a basketball hoop over a garage door, a chalk line on the tarmac, a hedge and a wheelie bin pushed against the wall",
    gadeLys:
      "soft midday light with thin cloud, neutral white balance, faint shadow under the eaves",
  },
] as const;

// 5 boligtyper: hvilket rum spejlet står i, og hvad der ligger i kanten
const BOLIGER = [
  {
    navn: "lejlighed",
    rum: "bedroom",
    rod:
      "a bed with crumpled sand-coloured linen bedding partly in frame, a bedside table with a glass of water, a paperback and a charger cable trailing down",
  },
  {
    navn: "rækkehus",
    rum: "entry hall",
    rod:
      "coat hooks with a couple of jackets and a tote bag, three pairs of shoes standing unevenly by the door, a small key tray on a narrow sideboard and a doormat with tracked-in grit",
  },
  {
    navn: "værelse",
    rum: "room",
    rod:
      "a clothes rail in the corner with a few garments pushed to one side on mismatched hangers, a laundry basket half full and a stack of books used as a side table",
  },
  {
    navn: "villa",
    rum: "landing",
    rod:
      "a low chest of drawers with a folded stack of laundry, a framed print leaning against the wall instead of hung, and a radiator with a towel over it",
  },
  {
    navn: "nye lejlighed",
    rum: "bedroom",
    rod:
      "a plain white wardrobe with one door left ajar showing hangers, a cardboard box not yet unpacked in the corner and a floor lamp with its cable visible",
  },
] as const;

// 7 spejle — hvert med sin ramme OG sin ægte defekt (anti-AI-detaljen)
const SPEJLE = [
  "a tall black-framed mirror leaning against the wall at a slight angle, a couple of faint fingerprint smudges near the middle of the glass",
  "a narrow full-height mirror screwed flat to the wall, the frame chipped at one lower corner",
  "an oval mirror with a thin brass frame that has darkened unevenly with age",
  "a large frameless mirror leaning in the corner, one edge slightly dusty",
  "a rectangular mirror with a pale oak frame and a small water mark low on the glass",
  "a slim floor mirror on a matte black metal stand, tilted a few degrees back",
  "an older mirror with a chipped white painted frame and two small age spots near the edge",
] as const;

// 11 gulve med tekstur og slid
const GULVE = [
  "wide-plank oak flooring with visible grain and a few pale scuffs near the doorway",
  "herringbone parquet with darkened joints and a worn path where people walk",
  "pale ash laminate with a faint scratch running toward the wall",
  "grey-painted floorboards with the paint thinned at the edges of the planks",
  "worn pine boards with visible knots and gaps between them",
  "light vinyl planks with a slightly uneven seam near the wall",
  "dark stained oak boards showing fine dust in the low light",
  "beige wall-to-wall carpet, flattened along the main walking line",
  "polished concrete with faint trowel marks and a hairline crack",
  "checkered vinyl in cream and grey, curling very slightly at one corner",
  "narrow beech strip flooring with sunlight-faded boards near the window",
] as const;

// 9 lyssætninger — retning, kilde, hvidbalance, skygger, aldrig blitz
const LYS = [
  "cool daylight from a single tall window on one side, soft directional shadows, no flash",
  "warm afternoon light falling in a slanted patch across the floor, gently warm white balance, no flash",
  "flat overcast light from a skylight above, almost shadowless and slightly cool, no flash",
  "evening light with a bedside lamp switched on — genuine mixed home white balance, warm pools and cool corners, no flash",
  "soft morning light through sheer curtains, diffuse and even with faint shadows, no flash",
  "bright midday light with hard window shadows cast across the floor, neutral white balance, no flash",
  "dim light with only a floor lamp on, warm and uneven with deep soft shadows, no flash",
  "low winter light from outside mixed with a warm ceiling lamp, uneven and slightly yellow indoors, no flash",
  "muted light from a north-facing window, cool and very even, quiet shadows, no flash",
] as const;

// 13 stuer — møbler med materiale, patina og hverdagsrod
const STUER = [
  "a beige corner sofa with the seat cushions slightly pressed down, a small oak side table with a mug and a coaster ring, and a floor lamp switched on",
  "a dark green sofa with a wool throw thrown over one armrest, a pine bookshelf with unevenly stacked books and a couple of magazines on the floor",
  "a worn brown leather sofa with genuine patina and creases, a monstera in a clay pot with one leaf browning, and a rice-paper lamp",
  "a grey two-seater, a round coffee table with a stack of magazines and a woven basket holding folded blankets",
  "a navy sofa with mismatched cushions, a rattan chair with a jacket slung over the back and a low bookshelf with an open book face-down",
  "a light beige sofa bed with a folded blanket at one end, a tall standing lamp and a phone charger cable running to the wall",
  "a cream sofa, a glass coffee table with fingerprints on it and two framed prints leaning unhung against the wall",
  "a rust-coloured armchair beside a small sofa, a stack of books on the floor and a half-burnt candle on the windowsill",
  "a black leather sofa with a slightly sunken corner, a chrome lamp and a jute rug with a curled edge",
  "a soft grey sofa with a sheepskin over the back, a wooden stool used as a side table and dried flowers in a chipped vase",
  "a patterned vintage sofa with faded fabric on the armrests, an old TV cabinet and a potted fig tree dropping a leaf",
  "a deep blue sofa with a crumpled throw, a marble-look side table with a water ring and a linen floor cushion",
  "a two-seater in oatmeal fabric with visible weave texture, a low sideboard with post and keys on it and a paper lantern",
] as const;

const ANTAL_HJEM = 100;

/** 100 hjem — indeks 0-99 giver altid nøjagtig samme hjem */
export function genererHjem(): GenereretHjem[] {
  return Array.from({ length: ANTAL_HJEM }, (_, i) => {
    // Forskellige skridtlængder pr. blok, så kombinationerne ikke gentager
    // sig i takt hen over de 100 hjem
    const by = BYER[i % BYER.length]!;
    const bolig = BOLIGER[i % BOLIGER.length]!;
    const spejl = SPEJLE[(i * 3) % SPEJLE.length]!;
    const gulv = GULVE[(i * 7) % GULVE.length]!;
    const lys = LYS[(i * 5) % LYS.length]!;
    const stue = STUER[(i * 11) % STUER.length]!;
    const nr = String(i + 1).padStart(3, "0");

    return {
      id: `hjem-${nr}`,
      navn: `${by.kvarter}, ${by.by} · ${bolig.navn}`,
      spejlrum:
        `the seller's own ${bolig.rum} — ALWAYS this exact room in every photo: ` +
        `${spejl}; ${gulv}; ${bolig.rod}. ${lys}. Genuinely lived-in, never staged and never a showroom`,
      stue:
        `the seller's own living room — ALWAYS this exact room in every photo: ` +
        `${stue}; ${gulv}. ${lys}. Everyday clutter at the edges of the frame, lived-in and never styled for a photoshoot`,
      gade:
        `the street immediately outside the seller's own front door in ${by.kvarter}, ${by.by} — ` +
        `ALWAYS this exact spot: ${by.gade}. ${by.gadeLys}. An ordinary everyday street, not a location scouted for a shoot`,
    };
  });
}
