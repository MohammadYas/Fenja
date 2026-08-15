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
// C-2 gælder stadig ubetinget: prompten beskriver ALDRIG tøjets udseende —
// referencebilledet styrer. C-6 gælder: aldrig genkendelige personer.
// Alt er deterministisk (ingen Math.random/Date.now) — retries er stabile.

import type { Preset } from "./presets";
import { vaelgPersonAnker } from "./presets";

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
    version: 1,
    navn: "Kjole & nederdel",
    noegleord: ["kjole", "nederdel", "dress"],
    visninger: [
      "helfigur i spejl-selfie foran hjemmets høje spejl: telefonen holdes lodret foran ansigtet og dækker det, den anden arm hænger naturligt, den ene fod let foran den anden",
      "trekvart figur ved hjemmets vindue, hovedet beskåret ud af billedet over hagen, afslappet oprejst holdning",
      "helfigur i naturlig hvilende positur, ansigtet bortvendt fra kameraet",
    ],
    fokus:
      "Bevar kjolens præcise længde, silhuet, udskæring, ærmer og stoffald; vis realistiske folder, træk og tyngde i stoffet ned langs kroppen.",
  },
  {
    id: "bukser",
    version: 1,
    navn: "Bukser & jeans",
    noegleord: ["bukser", "jeans", "chinos", "cargo", "shorts", "joggers"],
    visninger: [
      "spejl-selfie hvor telefonen dækker ansigtet; benene og buksernes pasform er billedets fokus",
      "stående med den ene hånd i lommen, beskåret fra brystet og ned",
      "et skridt i naturlig gang, beskåret fra taljen og ned, så benformen ses",
    ],
    fokus:
      "Bevar buksernes pasform og benform, linning, lommer, knapper, bæltestropper og syninger; vis realistiske folder og stræk ved hofter, knæ og ankler.",
  },
  {
    id: "jakke",
    version: 1,
    navn: "Jakke & overtøj",
    noegleord: ["jakke", "frakke", "overshirt", "blazer", "cardigan", "vest", "overtøj"],
    visninger: [
      "spejl-selfie i hjemmets entré: telefonen dækker ansigtet, jakken er billedets fokus",
      "stående lænet let mod en væg, hænder i lommerne, hovedet beskåret ud af billedet",
      "trekvart figur der retter på manchetten eller kraven, blikket væk fra kameraet",
    ],
    fokus:
      "Bevar krave, lukning, knapper, lynlås, lommer, bælte og alt hardware præcist; vis naturligt fald over skuldre og bryst og realistiske folder ved albuerne.",
  },
  {
    id: "overdel",
    version: 1,
    navn: "Overdel",
    noegleord: [
      "trøje", "striktrøje", "sweater", "hoodie", "t-shirt", "tshirt", "top",
      "skjorte", "bluse", "polo",
    ],
    visninger: [
      "spejl-selfie fra hoften og op: telefonen dækker ansigtet, overdelen er billedets fokus",
      "fra skuldrene og ned ved hjemmets vindue, hovedet uden for billedet, én hånd afslappet i lommen",
      "siddende afslappet, beskåret over hagen, naturlig holdning",
    ],
    fokus:
      "Bevar halsudskæring, skulderkonstruktion, ærmelængde og kant præcist; print, grafik og tekst på tøjet gengives nøjagtigt i placering, skala og farve; eventuelle transparente lag eller rynkninger bevares fysisk troværdigt.",
  },
  {
    id: "taske",
    version: 1,
    navn: "Taske",
    noegleord: ["taske", "skuldertaske", "håndtaske", "crossbody", "rygsæk", "bag"],
    visninger: [
      "tasken båret naturligt i hånden langs siden, beskåret så tasken er i centrum",
      "tasken hvilende på underarmen foran hjemmets spejl, telefonen dækker ansigtet",
      "tasken over skulderen set fra siden, hovedet uden for billedet",
    ],
    fokus:
      "Bevar taskens form, størrelse, materiale, hardware, lukning, hanke og logo-placering præcist; opfind ALDRIG en rem eller bæremåde, tasken ikke har, og lad ikke hænder eller tøj skjule vigtige detaljer.",
  },
  {
    id: "generisk",
    version: 1,
    navn: "Generisk",
    noegleord: [],
    visninger: [
      "naturlig afslappet positur, ansigtet skjult af telefonen i et spejl eller beskåret ud af billedet",
      "trekvart figur ved hjemmets vindue, hovedet uden for billedet",
    ],
    fokus:
      "Bevar beklædningens pasform, proportioner og alle synlige detaljer præcist.",
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
    version: 1,
    navn: "Vesterbro-lejlighed",
    steder: {
      "lys-minimalisme":
        "sælgerens soveværelse — altid det samme: et højt spejl med sort ramme lænet mod væggen, egetræsgulv med brede planker, hvid paneldør, en tændt sengelampe med varmt lys og en seng med lyst hørsengetøj delvist i billedet",
      "hyggelig-stue":
        "sælgerens stue — altid den samme: en beige hjørnesofa, et lille egetræsbord, en gulvlampe med varmt lys, en radiator under vinduet og hør-gardiner",
      "koebenhavnsk-gade":
        "gaden foran sælgerens opgang — altid den samme: en brostensbelagt sidegade med røde murstensfacader, en parkeret cykel og en grøn hoveddør, fladt gråvejrslys",
    },
  },
  {
    id: "aarhus-raekkehus",
    version: 1,
    navn: "Aarhus-rækkehus",
    steder: {
      "lys-minimalisme":
        "sælgerens entré — altid den samme: et smalt spejl i fuld højde på væggen, lyst asketræsgulv, knager med jakker, sko ved døren og køligt dagslys fra et ovenlysvindue",
      "hyggelig-stue":
        "sælgerens stue — altid den samme: en mørkegrøn sofa, en boghylde i fyrretræ, et uldplaid over armlænet og et stort vindue med hvide sprosser",
      "koebenhavnsk-gade":
        "fortovet foran sælgerens rækkehus — altid det samme: gule murstensrækkehuse, lave ligusterhække og en flisebelagt sti, blødt eftermiddagslys",
    },
  },
  {
    id: "noerrebro-vaerelse",
    version: 1,
    navn: "Nørrebro-værelse",
    steder: {
      "lys-minimalisme":
        "sælgerens værelse — altid det samme: et ovalt spejl på en hvid væg, sildebensparket, et klædestativ med bøjler i hjørnet og dagslys fra ét højt vindue",
      "hyggelig-stue":
        "sælgerens fælles stue — altid den samme: en brun lædersofa med patina, en monstera i krukke, et sofabord i genbrugstræ og en rispapirlampe",
      "koebenhavnsk-gade":
        "gaden under sælgerens lejlighed — altid den samme: en travl brostensgade med cykelstativ, en rød murstensfacade og en kaffebar-markise i baggrunden, overskyet lys",
    },
  },
  {
    id: "odense-villa",
    version: 1,
    navn: "Odense-villa",
    steder: {
      "lys-minimalisme":
        "sælgerens gæsteværelse — altid det samme: et rektangulært spejl på en lysegrå væg, hvidmalede gulvbrædder, en kurvestol i hjørnet og blødt lys gennem tynde gardiner",
      "hyggelig-stue":
        "sælgerens stue — altid den samme: en lys hjørnesofa med strikpuder, en brændeovn i baggrunden, et egetræsgulv med et jutetæppe og varme lamper",
      "koebenhavnsk-gade":
        "indkørslen foran sælgerens villa — altid den samme: en rødstensvilla med hvide vinduer, grusindkørsel og en høj bøgehæk, jævnt dagslys",
    },
  },
  {
    id: "aalborg-nybyg",
    version: 1,
    navn: "Aalborg-nybyg",
    steder: {
      "lys-minimalisme":
        "sælgerens walk-in-hjørne — altid det samme: et bredt spejl med tynd messingramme, betongulv med gulvvarme-look, hvide garderobeskabe og indbygget spotbelysning blandet med dagslys",
      "hyggelig-stue":
        "sælgerens stue — altid den samme: en gråblå sofa, et sort stålsofabord, store vinduespartier fra gulv til loft og en enkelt stor gulvplante",
      "koebenhavnsk-gade":
        "pladsen foran sælgerens boligblok — altid den samme: en nybygget karré i lyse mursten, en bænk, unge træer i plantehuller og klart køligt dagslys",
    },
  },
] as const;

function stabilHash(tekst: string): number {
  let hash = 0;
  for (const tegn of tekst) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

/** Deterministisk: samme sælger → altid samme hjem (på tværs af items og retries) */
export function vaelgHjem(userId: string): Hjem {
  return HJEM[stabilHash(userId) % HJEM.length]!;
}

/** Sted i sælgerens hjem for et preset; presettets egen setting som fallback */
export function hentHjemSted(hjem: Hjem, preset: Preset): string {
  return hjem.steder[preset.id] ?? preset.setting;
}

// ---------------------------------------------------------------------------
// Promptbygning: fælles blokke + kategori + hjem. Rækkefølgen afspejler
// prioriteten — troskab mod referencen først, æstetik sidst.

const REFERENCE_INSTRUKS =
  "Personen bærer PRÆCIS beklædningen fra referencebilledet — bevar print, grafik, " +
  "farve, materiale, snit, længde og alle synlige detaljer nøjagtigt; opfind, " +
  "fjern eller 'forbedr' intet, og bevar synligt slid og fejl hvor de er.";

// Ejerens fotostil-princip (2026-08-15): autentisk hverdagsfoto, ikke studie.
const FOTOSTIL =
  "Fotostil: et ægte, hurtigt taget smartphonefoto til en genbrugsannonce — let " +
  "uperfekt beskæring og eksponering, naturligt blandet lys med realistiske " +
  "skygger, mild sensorstøj, levet-i hjem med små hverdagsdetaljer; ALDRIG " +
  "studieopstilling, editorial-look eller AI-glans.";

const NEGATIV_LISTE =
  "Undgå: tekst, logoer eller vandmærker ud over tøjets egne; ansigtsforskønnelse; " +
  "ændring af tøjets pasform; ekstra accessories; deforme eller ekstra fingre; " +
  "duplikerede lemmer; forvrænget anatomi; plastikagtig hud; CGI-udseende; " +
  "kunstige baggrunde.";

/** Deterministisk visning pr. item, så retries er stabile */
export function vaelgVisning(skabelon: KategoriSkabelon, itemId: string): string {
  return skabelon.visninger[stabilHash(itemId) % skabelon.visninger.length]!;
}

/**
 * Den fulde on-model-prompt: reference-instruks → person + visning → sted
 * (sælgerens faste hjem når userId kendes) → kategori-fokus → fotostil →
 * negativ-liste. Uden userId/kategori: preset-setting + generisk skabelon.
 */
export function bygOnModelPromptMedSkabelon(args: {
  preset: Preset;
  itemId: string;
  userId?: string;
  kategori?: string | null;
}): string {
  const skabelon = vaelgSkabelon(args.kategori);
  const sted = args.userId
    ? hentHjemSted(vaelgHjem(args.userId), args.preset)
    : args.preset.setting;

  return [
    REFERENCE_INSTRUKS,
    `Personen er ${vaelgPersonAnker(args.itemId)} — en anonym person, ikke en genkendelig eller virkelig person; ansigtet er altid skjult af telefonen eller beskåret ud af billedet.`,
    `Visning: ${vaelgVisning(skabelon, args.itemId)}.`,
    `Sted: ${sted}.`,
    skabelon.fokus,
    FOTOSTIL,
    NEGATIV_LISTE,
  ].join(" ");
}
