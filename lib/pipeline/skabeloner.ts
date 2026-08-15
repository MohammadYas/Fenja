// Kategori-skabeloner + hjem-ankre til on-model-prompten (ejer-princip
// 2026-08-15/16, bygget på ejerens prompt-bibliotek):
//
// 1) KATEGORI: hver tøjkategori (kjole, bukser, jakke, overdel, taske) har sin
//    egen måde at blive vist på — spejl-selfie, ved vinduet, gående — og sit
//    eget troskabs-fokus (fx linning/lommer for bukser, fald/længde for kjoler).
// 2) HJEM: hver sælger får ét fast "hjem", valgt deterministisk af user-id.
//    Alle sælgerens annoncer optages i samme bolig (samme spejl, gulv, lys),
//    så profilen ikke ligner tusind forskellige steder. Presettet vælger
//    hvilket sted i hjemmet (lyst rum / stue / sælgerens egen gade).
// 3) Variationen (positur, beskæring) roterer deterministisk pr. item, så to
//    annoncer fra samme sælger ligner to forskellige fotos fra samme hjem.
//
// PROMPT-SPROG ER ENGELSK (ejer-tuning 2026-08-16): billedmodellerne følger
// engelske instrukser markant bedre — bevist på forside-serien (v3→v4).
// Stilen er destilleret af de bedste kørsler: hurtigt hverdagsfoto, levet-i
// hjem, let uperfekt — aldrig editorial. Se docs/marketing-billeder.md.
//
// C-2 gælder stadig ubetinget: prompten beskriver ALDRIG tøjets udseende —
// referencebilledet styrer. C-6 gælder: aldrig genkendelige personer.
// Alt er deterministisk (ingen Math.random/Date.now) — retries er stabile.

import type { Preset } from "./presets";

export type KategoriSkabelon = {
  id: string;
  version: number;
  navn: string;
  /** Små bogstaver; matches mod itemets fritekst-kategori (B-3) */
  noegleord: readonly string[];
  /** Positur/beskæring — roteres deterministisk pr. item */
  visninger: readonly string[];
  /** Kategori-specifikt troskabs-fokus (supplerer den fælles reference-instruks) */
  fokus: string;
};

export const KATEGORI_SKABELONER: readonly KategoriSkabelon[] = [
  {
    id: "kjole",
    version: 2,
    navn: "Kjole & nederdel",
    noegleord: ["kjole", "nederdel", "dress"],
    visninger: [
      "full-body mirror selfie in the home's tall mirror: the phone is held vertically in front of the face, completely covering it, the other arm hangs naturally, one foot slightly in front of the other, relaxed upright posture",
      "three-quarter view by the home's window, head cropped out of frame above the chin, relaxed upright posture",
      "full body in a natural resting pose, face turned away from the camera",
    ],
    fokus:
      "Preserve the dress's exact length, silhouette, neckline, sleeves and drape; show realistic folds, tension and weight in the fabric falling along the body.",
  },
  {
    id: "bukser",
    version: 2,
    navn: "Bukser & jeans",
    noegleord: ["bukser", "jeans", "chinos", "cargo", "shorts", "joggers"],
    visninger: [
      "mirror selfie with the phone completely covering the face; the legs and the fit of the trousers are the focus of the image",
      "standing with one hand in a pocket, framed from the chest down",
      "a natural mid-step walking shot framed from the waist down so the leg shape is visible",
    ],
    fokus:
      "Preserve the exact fit and leg shape, waistband, pockets, buttons, belt loops and stitching; show realistic creases and tension at the hips, knees and ankles.",
  },
  {
    id: "jakke",
    version: 2,
    navn: "Jakke & overtøj",
    noegleord: ["jakke", "frakke", "overshirt", "blazer", "cardigan", "vest", "overtøj"],
    visninger: [
      "mirror selfie in the home's hallway: the phone covers the face entirely, the jacket is the focus of the image",
      "leaning casually against a wall with hands in pockets, head cropped out of frame",
      "three-quarter view adjusting a cuff or the collar, gaze turned away from the camera",
    ],
    fokus:
      "Preserve the collar, closure, buttons, zipper, pockets, belt and all hardware exactly; show a natural fall over the shoulders and chest and realistic creases at the elbows.",
  },
  {
    id: "overdel",
    version: 2,
    navn: "Overdel",
    noegleord: [
      "trøje", "striktrøje", "sweater", "hoodie", "t-shirt", "tshirt", "top",
      "skjorte", "bluse", "polo",
    ],
    visninger: [
      "mirror selfie framed from the hips up: the phone covers the face, the top is the focus of the image",
      "framed from the shoulders down by the home's window, head out of frame, one hand relaxed in a pocket",
      "sitting casually, cropped above the chin, natural posture",
    ],
    fokus:
      "Preserve the neckline, shoulder construction, sleeve length and hem exactly; any print, graphic or lettering on the garment is reproduced faithfully in placement, scale and colour; any sheer layers or ruching stay physically believable.",
  },
  {
    id: "taske",
    version: 2,
    navn: "Taske",
    noegleord: ["taske", "skuldertaske", "håndtaske", "crossbody", "rygsæk", "bag"],
    visninger: [
      "the bag carried naturally in the hand by the side, framed so the bag is the centre of the image",
      "the bag resting on the forearm in front of the home's mirror, the phone covering the face",
      "the bag worn over the shoulder seen from the side, head out of frame",
    ],
    fokus:
      "Preserve the bag's shape, size, material, hardware, closure, handles and logo placement exactly; NEVER invent a strap or carrying style the bag does not have, and keep hands and clothing from hiding important details.",
  },
  {
    id: "generisk",
    version: 2,
    navn: "Generisk",
    noegleord: [],
    visninger: [
      "a natural relaxed pose with the face hidden by the phone in a mirror or cropped out of frame",
      "three-quarter view by the home's window, head out of frame",
    ],
    fokus:
      "Preserve the garment's fit, proportions and every visible detail exactly.",
  },
] as const;

export const GENERISK_SKABELON_ID = "generisk";

/** Match itemets fritekst-kategori (B-3) mod en skabelon; generisk som fallback */
export function vaelgSkabelon(kategori: string | null | undefined): KategoriSkabelon {
  const tekst = (kategori ?? "").toLowerCase();
  const fundet = KATEGORI_SKABELONER.find(
    (s) => s.id !== GENERISK_SKABELON_ID && s.noegleord.some((ord) => tekst.includes(ord)),
  );
  return fundet ?? KATEGORI_SKABELONER.find((s) => s.id === GENERISK_SKABELON_ID)!;
}

// ---------------------------------------------------------------------------
// Person-ankre (C-6): neutral, divers rotation — engelsk udgave af presets-
// modulets ankre; valget pr. item er deterministisk, så retries er stabile.

const PERSON_ANKRE = [
  "an adult with short dark hair and a neutral appearance",
  "an adult with light hair tied up and a neutral appearance",
  "an adult with shoulder-length black curly hair and a deep skin tone",
  "an adult with greying hair and a neutral appearance",
] as const;

// ---------------------------------------------------------------------------
// Hjem-ankre: ét fast hjem pr. sælger (deterministisk af user-id).
// `steder` er nøglet på preset-id, så presettet vælger sted I hjemmet —
// aldrig et nyt hjem. Detaljerne pr. hjem er bevidst konkrete og genkendelige
// (samme spejl, samme gulv, samme lampe), så serien hænger visuelt sammen.

export type Hjem = {
  id: string;
  version: number;
  navn: string;
  steder: Readonly<Record<string, string>>;
};

export const HJEM: readonly Hjem[] = [
  {
    id: "vesterbro-lejlighed",
    version: 2,
    navn: "Vesterbro-lejlighed",
    steder: {
      "lys-minimalisme":
        "the seller's bedroom — always the same room: a tall black-framed mirror leaning against the wall, wide-plank oak floor, a white panel door, a lit bedside lamp with warm light, and a bed with pale linen bedding partly in frame",
      "hyggelig-stue":
        "the seller's living room — always the same room: a beige corner sofa, a small oak side table, a floor lamp with warm light, a radiator under the window and linen curtains",
      "koebenhavnsk-gade":
        "the street outside the seller's front door — always the same spot: a cobbled side street with red-brick facades, a parked bicycle and a green front door, flat overcast daylight",
    },
  },
  {
    id: "aarhus-raekkehus",
    version: 2,
    navn: "Aarhus-rækkehus",
    steder: {
      "lys-minimalisme":
        "the seller's entry hall — always the same spot: a narrow full-height wall mirror, pale ash floor, coat hooks with jackets, shoes by the door and cool daylight from a skylight",
      "hyggelig-stue":
        "the seller's living room — always the same room: a dark green sofa, a pine bookshelf, a wool throw over the armrest and a large window with white glazing bars",
      "koebenhavnsk-gade":
        "the pavement outside the seller's terraced house — always the same spot: yellow-brick row houses, low privet hedges and a paved path, soft afternoon light",
    },
  },
  {
    id: "noerrebro-vaerelse",
    version: 2,
    navn: "Nørrebro-værelse",
    steder: {
      "lys-minimalisme":
        "the seller's room — always the same room: an oval mirror on a white wall, herringbone parquet, a clothes rack with hangers in the corner and daylight from one tall window",
      "hyggelig-stue":
        "the seller's shared living room — always the same room: a worn brown leather sofa with patina, a monstera in a pot, a reclaimed-wood coffee table and a rice-paper lamp",
      "koebenhavnsk-gade":
        "the street below the seller's flat — always the same spot: a busy cobbled street with a bicycle rack, a red-brick facade and a café awning in the background, overcast light",
    },
  },
  {
    id: "odense-villa",
    version: 2,
    navn: "Odense-villa",
    steder: {
      "lys-minimalisme":
        "the seller's guest room — always the same room: a rectangular mirror on a light grey wall, white-painted floorboards, a wicker chair in the corner and soft light through thin curtains",
      "hyggelig-stue":
        "the seller's living room — always the same room: a light corner sofa with knitted cushions, a wood-burning stove in the background, an oak floor with a jute rug and warm lamps",
      "koebenhavnsk-gade":
        "the driveway outside the seller's house — always the same spot: a red-brick villa with white windows, a gravel driveway and a tall beech hedge, even daylight",
    },
  },
  {
    id: "aalborg-nybyg",
    version: 2,
    navn: "Aalborg-nybyg",
    steder: {
      "lys-minimalisme":
        "the seller's walk-in corner — always the same spot: a wide mirror with a thin brass frame, polished concrete floor, white wardrobe doors and built-in spotlights mixed with daylight",
      "hyggelig-stue":
        "the seller's living room — always the same room: a grey-blue sofa, a black steel coffee table, floor-to-ceiling windows and a single large floor plant",
      "koebenhavnsk-gade":
        "the square outside the seller's apartment block — always the same spot: a newly built block in pale brick, a bench, young trees in planting pits and clear cool daylight",
    },
  },
] as const;

function stabilHash(tekst: string): number {
  let hash = 0;
  for (const tegn of tekst) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

const HJEM_EFTER_ID = new Map(HJEM.map((h) => [h.id, h]));

/** Slå et hjem op på id; undefined ved ukendt/tomt id */
export function hentHjem(id: string | null | undefined): Hjem | undefined {
  return id ? HJEM_EFTER_ID.get(id) : undefined;
}

/** Deterministisk: samme sælger → altid samme hjem (på tværs af items og retries) */
export function vaelgHjem(userId: string): Hjem {
  return HJEM[stabilHash(userId) % HJEM.length]!;
}

/**
 * Sælgerens hjem (S31): et gyldigt selvvalgt hjem vinder over det
 * deterministiske. Ukendt/tomt valg falder tilbage til user-id-hashen, så
 * "samme sælger → samme bolig" fortsat gælder for alle uden et aktivt valg —
 * og et forældet hjem-id (fjernet fra HJEM) aldrig vælter en kørsel.
 */
export function vaelgHjemMedValg(userId: string, valgtHjemId?: string | null): Hjem {
  return hentHjem(valgtHjemId) ?? vaelgHjem(userId);
}

/** Sted i sælgerens hjem for et preset; presettets egen setting som fallback */
export function hentHjemSted(hjem: Hjem, preset: Preset): string {
  return hjem.steder[preset.id] ?? preset.setting;
}

/** Versions-tag i generations.prompt_version-formatet: "id@vN" (FR-15) */
export function skabelonVersionsTag(skabelon: KategoriSkabelon): string {
  return `${skabelon.id}@v${skabelon.version}`;
}

/** Versions-tag i generations.prompt_version-formatet: "id@vN" (FR-15) */
export function hjemVersionsTag(hjem: Hjem): string {
  return `${hjem.id}@v${hjem.version}`;
}

// ---------------------------------------------------------------------------
// Promptbygning: fælles blokke + kategori + hjem. Rækkefølgen afspejler
// prioriteten — troskab mod referencen først, æstetik sidst.

const REFERENCE_INSTRUKS =
  "The person wears EXACTLY the garment from the reference image — preserve its " +
  "print, graphics, colour, material, cut, length and every visible detail " +
  "precisely; invent, remove or 'improve' nothing, and keep visible wear and " +
  "flaws where they are.";

// Ejerens fotostil-princip (2026-08-15/16): autentisk hverdagsfoto, ikke studie.
const FOTOSTIL =
  "Photo style: a completely authentic casual smartphone photo taken quickly for " +
  "a secondhand clothing listing — NOT a professional photoshoot, NOT editorial, " +
  "NOT staged. Slightly imperfect framing and exposure, natural mixed light with " +
  "realistic shadows, mild smartphone sensor noise, small everyday details and " +
  "slight clutter at the edges of the frame, realistic fabric texture with " +
  "natural wrinkles. Indistinguishable from a real photo a private seller took " +
  "at home with their phone.";

const NEGATIV_LISTE =
  "Avoid: any text, logos or watermarks beyond the garment's own; face " +
  "retouching; changing the garment's fit; extra accessories; deformed or extra " +
  "fingers; duplicated limbs; warped anatomy; plastic-looking skin; CGI " +
  "appearance; artificial-looking backgrounds; studio lighting.";

/** Deterministisk visning pr. item, så retries er stabile */
export function vaelgVisning(skabelon: KategoriSkabelon, itemId: string): string {
  return skabelon.visninger[stabilHash(itemId) % skabelon.visninger.length]!;
}

/** Deterministisk person-anker pr. item (C-6, engelsk udgave) */
export function vaelgPersonAnkerEngelsk(itemId: string): string {
  return PERSON_ANKRE[stabilHash(itemId) % PERSON_ANKRE.length]!;
}

/**
 * Den fulde on-model-prompt (engelsk): reference-instruks → person + visning →
 * sted (sælgerens hjem når userId kendes; et selvvalgt hjem overtrumfer det
 * deterministiske, S31) → kategori-fokus → fotostil → negativ-liste. Uden
 * userId/kategori: preset-setting + generisk skabelon.
 */
export function bygOnModelPromptMedSkabelon(args: {
  preset: Preset;
  itemId: string;
  userId?: string;
  kategori?: string | null;
  /** Sælgerens selvvalgte hjem-id (S31); ukendt/tomt → det deterministiske */
  hjemAnker?: string | null;
}): string {
  const skabelon = vaelgSkabelon(args.kategori);
  const sted = args.userId
    ? hentHjemSted(vaelgHjemMedValg(args.userId, args.hjemAnker), args.preset)
    : args.preset.setting;

  return [
    REFERENCE_INSTRUKS,
    `The person is ${vaelgPersonAnkerEngelsk(args.itemId)} — an anonymous person, never a recognizable or real person; the face is always hidden by the phone or cropped out of frame.`,
    `Framing: ${vaelgVisning(skabelon, args.itemId)}.`,
    `Location: ${sted}.`,
    skabelon.fokus,
    FOTOSTIL,
    NEGATIV_LISTE,
  ].join(" ");
}

/**
 * Sammensat prompt-version til generations.prompt_version (FR-15): preset,
 * kategori-skabelon og hjem — hver med sit versionsnummer — så pass-rate kan
 * måles pr. version af hver dimension. Taggene beskriver præcis den prompt der
 * blev kørt: samme deterministiske valg (skabelon fra kategori, hjem fra
 * userId + evt. selvvalg) som selve prompten. Uden userId er der intet hjem
 * (preset-settingen bruges), og hjem-tagget udelades.
 */
export function byggPromptVersion(args: {
  preset: Preset;
  kategori?: string | null;
  userId?: string;
  hjemAnker?: string | null;
}): string {
  const tags = [
    `${args.preset.id}@v${args.preset.version}`,
    skabelonVersionsTag(vaelgSkabelon(args.kategori)),
  ];
  if (args.userId) {
    tags.push(hjemVersionsTag(vaelgHjemMedValg(args.userId, args.hjemAnker)));
  }
  return tags.join(" ");
}
