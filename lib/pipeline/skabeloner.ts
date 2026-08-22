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
import type { VisningsType } from "./visninger";

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
  /** Kategori-specifik regel der gælder ALLE visninger (fx torso dækket ved bukser) */
  regel?: string;
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
    // v3 (ejer-ordre 20/8): bukser vises ALTID forfra, og personen har ALTID
    // en simpel neutral overdel på — aldrig bar overkrop, aldrig bagfra som
    // hovedvinkel (ejer-rapport: billedet viste ryggen af en topløs person)
    version: 3,
    navn: "Bukser & jeans",
    noegleord: ["bukser", "jeans", "chinos", "cargo", "joggers"],
    visninger: [
      "mirror selfie taken from the FRONT: the person faces the mirror directly, the phone is held vertically in front of the face and completely covers it, one hand relaxed at the side — the legs and the fit of the trousers are the focus of the image",
      "standing FRONT-ON facing the camera directly, with one hand in a pocket, framed from the chest down",
      "a natural mid-step walking shot coming TOWARD the camera, framed from the waist down so the leg shape is visible",
    ],
    regel:
      "Lower-body garment: the reference garment covers only the legs, so the person wears a simple, plain, neutral-colored top with it — never shirtless, never in underwear. The main view is ALWAYS the FRONT; a back view may appear only as an extra angle, never as the main photo.",
    fokus:
      "Preserve the exact fit and leg shape, waistband, pockets, buttons, belt loops and stitching; show realistic creases and tension at the hips, knees and ankles.",
  },
  {
    // Egen shorts-skabelon (ejer-rapport 21/8 nat: shorts matchede bukser-
    // skabelonen, hvis regler forbød "shorts" og "bare legs" — modellen
    // forlængede derfor shortsene til lange bukser). Længden er HELE pointen.
    id: "shorts",
    version: 1,
    navn: "Shorts",
    noegleord: ["shorts", "bermuda"],
    visninger: [
      "mirror selfie taken from the FRONT: the person faces the mirror directly, the phone is held vertically in front of the face and completely covers it, one hand relaxed at the side — the shorts and the bare lower legs are the focus of the image",
      "standing FRONT-ON facing the camera directly, one hand in a pocket, framed from the waist down so the full length of the shorts and the lower legs are visible",
      "a natural mid-step walking shot coming TOWARD the camera, framed from the waist down",
    ],
    regel:
      "The garment is SHORTS: it ends at or above the knee, and the lower legs are bare — that is correct and expected. NEVER extend the shorts into long trousers, never add tights or leggings under them. The person wears a simple, plain, neutral-colored top; the main view is ALWAYS the front.",
    fokus:
      "Preserve the EXACT length of the shorts — where the hem ends on the leg is the single most important detail. Preserve waistband, pockets and stitching; show realistic creases at the hips.",
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
  "an attractive adult in their early twenties with short dark hair and a slim, natural build",
  "an attractive adult in their early twenties with light hair worn loose and a slim, natural build",
  "an attractive adult in their early twenties with shoulder-length black curly hair, a deep skin tone and a slim, natural build",
  "an attractive adult in their mid-twenties with light brown hair and a slim, natural build",
] as const;

/**
 * Positur og krop (ejer-ordre 20/8: "personen skal være bygget som hende der
 * — cute og flot krop uden at være for generalisering"). Ordlyden er ejerens
 * egen, dokumenteret virksomme formulering fra forside-serien
 * (scripts/katalog-prompts-data.ts): slank, naturlig, afslappet — ALDRIG
 * posering eller overdrevne proportioner.
 */
const KROP_OG_POSITUR =
  "Appearance follows the seller's own catalogue style: a good-looking adult " +
  "with a clear Scandinavian look — healthy clear skin, well-groomed hair, a " +
  "slim natural build with realistic proportions. Attractive but believable: " +
  "never an exaggerated hourglass figure, never a fitness or model pose, never " +
  "airbrushed or retouched — this is a real person photographed at home, not a " +
  "professional model in a campaign. The posture is relaxed and slightly " +
  "asymmetric with the weight on one leg and one hip a little to the side, the " +
  "free arm hanging loosely with the hand resting against a thigh or tucked " +
  "casually into a front pocket. The person is standing casually, not posing.";

/**
 * Underdelen når referencetøjet er en overdel (ejer-ordre 20/8: "underdele
 * skal være mere skandinaviske og pæne"). Destilleret af de tre bukser i
 * forside-serien: enkle, matte jeans i hvid/creme, lys blågrå eller mørk navy.
 */
const SKANDINAVISK_BUNDDEL =
  "the person wears simple, well-fitting Scandinavian everyday jeans in plain " +
  "cream-white, pale washed blue-grey or dark navy denim: straight or slim fit " +
  "but never skinny, low-to-mid rise, matte structured denim with a visible " +
  "waistband, belt loops and front pockets, no belt, and natural creases at the " +
  "hips and knees. The jeans are plain and quiet so the reference garment stays " +
  "the focus — no prints, no rips, no logos, no shorts, no leggings, no bare legs";

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
  "The person WEARS exactly the garment from the reference image, naturally on " +
  "the body with arms/legs inside it and the body filling it out — NEVER held " +
  "up in front of the body, NEVER hanging on a hanger, NEVER an empty garment " +
  "floating. Remove any hanger, clips or props from the reference. Preserve the " +
  "garment's print, graphics, colour, material, cut, length and every visible " +
  "detail precisely; invent, remove or 'improve' nothing, and keep visible wear " +
  "and flaws where they are.";

// Ejerens fotostil-princip (2026-08-15/16): autentisk hverdagsfoto, ikke studie.
const FOTOSTIL =
  "Photo style: a completely authentic casual smartphone photo taken quickly for " +
  "a secondhand clothing listing — NOT a professional photoshoot, NOT editorial, " +
  "NOT staged. Slightly imperfect framing and exposure, natural mixed light with " +
  "realistic shadows, mild smartphone sensor noise, small everyday details and " +
  "slight clutter at the edges of the frame, realistic fabric texture with " +
  "natural wrinkles. Indistinguishable from a real photo a private seller took " +
  "at home with their phone.";

// Produkt-visninger (uden person): samme troskabskrav, formuleret om tøjet selv
const PRODUKT_REFERENCE_INSTRUKS =
  "The image shows EXACTLY the garment from the reference image — preserve its " +
  "print, graphics, colour, material, cut, length and every visible detail " +
  "precisely; invent, remove or 'improve' nothing, and keep visible wear and " +
  "flaws where they are. No person appears in the image.";

// Fælles forbud der gælder BEGGE slags visninger.
const FAELLES_NEGATIV =
  "Avoid: any text, logos or watermarks beyond the garment's own; changing the " +
  "garment's fit, length or cut; extra accessories; CGI appearance; " +
  "artificial-looking backgrounds; studio lighting.";

// Kun on-model: bøjle-forbuddet gav floatende spøgelsestøj, da det blev sendt
// med til produkt-visningerne, hvis framing netop KRÆVER bøjle eller gulv
// (ejer-rapport 20/8: "det ene billede ligner at den floater").
const ONMODEL_NEGATIV =
  " Also avoid: face retouching; deformed or extra fingers; duplicated limbs; " +
  "warped anatomy; plastic-looking skin; an exaggerated hourglass figure; a " +
  "fitness or model pose; high heels; a garment on a hanger or held up in " +
  "front of the body; an empty garment not worn by the person; visible hangers, " +
  "clips or props.";

// Kun produkt: her ER tøjet tomt og ubåret — det skal ligge/hænge SOLIDT et
// sted, aldrig svæve frit i luften.
const PRODUKT_NEGATIV =
  " The garment is empty and unworn — that is correct and intended. But it must " +
  "rest physically on something real: flat on the floor or bed, or hanging on a " +
  "hanger that is clearly visible and supported. Never let the garment float or " +
  "hover in mid-air, never fill it out with an invisible body or ghost " +
  "mannequin, and never show a person or any body part.";

/** Deterministisk visning pr. item, så retries er stabile */
export function vaelgVisning(skabelon: KategoriSkabelon, itemId: string): string {
  return skabelon.visninger[stabilHash(itemId) % skabelon.visninger.length]!;
}

/** Deterministisk person-anker pr. item (C-6, engelsk udgave) */
export function vaelgPersonAnkerEngelsk(itemId: string): string {
  return PERSON_ANKRE[stabilHash(itemId) % PERSON_ANKRE.length]!;
}

// Onboarding (ejer-ordre 20/8): sælgerens eget valg af køn + hårfarve vinder
// over rotationen, så personen på billederne er konsistent med sælgeren.
const HAAR_ENGELSK: Record<string, string> = {
  sort: "black",
  brunt: "brown",
  blondt: "blonde",
  roedt: "red",
  graat: "grey",
  moerkt: "dark",
};

export function bygPersonAnker(args: {
  itemId: string;
  koen?: string | null;
  haarFarve?: string | null;
}): string {
  if (args.koen !== "mand" && args.koen !== "kvinde") {
    return vaelgPersonAnkerEngelsk(args.itemId);
  }
  const krop =
    args.koen === "mand"
      ? "an attractive adult Scandinavian man in his early twenties with a slim, naturally athletic build and clear, well-groomed features"
      : "an attractive adult Scandinavian woman in her early twenties with a slim, natural build and clear, well-groomed features";
  const haar = args.haarFarve ? HAAR_ENGELSK[args.haarFarve] : undefined;
  return `${krop}${haar ? ` and ${haar} hair worn naturally` : ""}`;
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
  /** Brugerens valgte visningstype (ejer-ordre 20/8); uden = deterministisk framing */
  visning?: VisningsType;
  /** Onboarding (20/8): sælgerens køn/hår vinder over person-rotationen */
  koen?: string | null;
  haarFarve?: string | null;
}): string {
  const skabelon = vaelgSkabelon(args.kategori);
  const sted = args.userId
    ? hentHjemSted(vaelgHjemMedValg(args.userId, args.hjemAnker), args.preset)
    : args.preset.setting;

  // Produkt-visninger (gulv/bøjle/nærbillede): ingen person i billedet —
  // reference-troskaben og fotostilen er de samme som on-model (C-2 gælder)
  if (args.visning && args.visning.slags === "produkt") {
    return [
      PRODUKT_REFERENCE_INSTRUKS,
      `Framing: ${args.visning.framing}.`,
      `Location: ${sted}.`,
      skabelon.fokus,
      FOTOSTIL,
      FAELLES_NEGATIV + PRODUKT_NEGATIV,
    ].join(" ");
  }

// On-model: brugerens spejl-valg tager skabelonens spejl-framing (indeks 0 —
// alle skabeloner har spejlbilledet først); uden valg roteres deterministisk
const framing =
  args.visning?.slags === "onmodel"
    ? skabelon.visninger[0]!
    : vaelgVisning(skabelon, args.itemId);

return [
  REFERENCE_INSTRUKS,
  `The person is ${bygPersonAnker({ itemId: args.itemId, koen: args.koen, haarFarve: args.haarFarve })} — an anonymous person, never a recognizable or real person; the face is always hidden by the phone or cropped out of frame.`,
  // Ejer-ordre 20/8: TØJET bestemmer huden. En croptop SKAL vise mave — at
  // dække den til ville vise et andet stykke tøj end det, der sælges. Den
  // neutrale top gælder KUN, når referencetøjet slet ikke dækker overkroppen
  // (fx et par bukser) — så er alternativet en bar overkrop.
  "How much skin shows is decided ENTIRELY by the garment itself: show it exactly as it is, and never lengthen, extend or cover it up. If the reference garment is a crop top, a short top or has a deep or open neckline, the bare midriff, waist or neckline MUST be visible exactly as the garment leaves it. Only when the reference garment does not cover the torso at all (for example trousers or a skirt) does the person wear a simple, plain, neutral-colored top with it — the person is never shirtless and never in underwear.",
  // Ejer-rapport 20/8: en top blev vist som en kort kjole på bare ben. Det
  // sælger et andet produkt, end sælgeren har.
  "The reference garment keeps its exact type and length: a top stays a top and NEVER becomes a dress or tunic; its hem ends exactly where it ends in the reference image.",
  // Ejer-ordre 20/8: underdelen skal være skandinavisk og pæn — samme stil som
  // forside-serien, aldrig bare ben.
  `Whatever the reference garment does not cover, the person is dressed for in a quiet, tasteful way: if the reference garment is an upper-body garment, ${SKANDINAVISK_BUNDDEL}.`,
  KROP_OG_POSITUR,
  `Framing: ${framing}.`,
  skabelon.regel,
  `Location: ${sted}.`,
  skabelon.fokus,
  FOTOSTIL,
  FAELLES_NEGATIV + ONMODEL_NEGATIV,
]
  .filter((del): del is string => Boolean(del))
  .join(" ");
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
  visning?: VisningsType;
}): string {
  const tags = [
    `${args.preset.id}@v${args.preset.version}`,
    skabelonVersionsTag(vaelgSkabelon(args.kategori)),
  ];
  if (args.userId) {
    tags.push(hjemVersionsTag(vaelgHjemMedValg(args.userId, args.hjemAnker)));
  }
  if (args.visning) {
    tags.push(`${args.visning.id}@v${args.visning.version}`);
  }
  return tags.join(" ");
}
