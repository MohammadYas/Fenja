// Fase B (Tillæg B + §9-princippet): 8-bloks UGC-promptsystemet som typet,
// deterministisk compiler — struktureret input → færdig promptstreng til
// Seedance-klassens modeller. Blokkene står ALTID i samme rækkefølge:
//   1. stil-anker  2. karakter-anker  3. lokation  4. action beats
//   5. dialog (ordgrænse pr. varighed)  6. audio-instruks
//   7. negativ-liste (fast, kan kun udvides)  8. teknik
// Versioneret (promptVersion i output), så pass-rate kan måles pr. version
// (FR-15) — samme princip som billedsidens presets i lib/pipeline/presets.ts.

import type { VideoFormat } from "./provider";

export const PROMPT_VERSION = 1;

/** Seedance 2.0-klipgrænser (Tillæg B): 4–15 sekunder */
export const MIN_VARIGHED_SEK = 4;
export const MAX_VARIGHED_SEK = 15;

/** Naturligt dansk UGC-taletempo ≈ 2 ord/sekund — loftet for lipsynket dialog */
export const ORD_PR_SEKUND = 2;

/** Fast negativ-liste — er med i HVER kompileret prompt og kan aldrig fravælges */
export const FAST_NEGATIV_LISTE: readonly string[] = [
  "indbrændte undertekster eller tekst-overlays",
  "vandmærker og logoer ud over produktets egne",
  "poleret reklame-æstetik og studielys",
  "genkendelige eller virkelige personer",
  "ekstra fingre, deforme hænder, unaturlig hud",
  "at produktet skifter udseende undervejs i klippet",
] as const;

export type ReferenceRolle = "karakter" | "produkt" | "lokation";

export type PromptReference = {
  /** Hvad billedet er reference for — styrer hvilken blok der peger på det */
  rolle: ReferenceRolle;
  /** Nummereres @image1… i inputrækkefølge, som Seedance forventer */
  url: string;
};

export type PromptInput = {
  /** Blok 1 · stil-anker: den bærende UGC-æstetik, fx "håndholdt selfie-video" */
  stilAnker: string;
  /** Blok 2 · karakter-anker: hvem taler (evt. @image-reference sættes automatisk) */
  karakter: string;
  /** Blok 3 · lokation */
  lokation: string;
  /** Blok 4 · action beats i rækkefølge — mindst ét */
  actionBeats: string[];
  /** Blok 5 · dialog (native lipsync) — ordgrænsen afhænger af varigheden */
  dialog: string;
  /** Blok 6 · audio-instruks ud over dialogen, fx reallyd/rumtone */
  audio: string;
  /** Blok 8 · ekstra teknik-krav ud over format/varighed — valgfrit */
  teknik?: string;
  /** Udvider den faste negativ-liste (blok 7) — kan aldrig erstatte den */
  ekstraNegativer?: string[];
  varighedSek: number;
  format: VideoFormat;
  /** Referencebilleder i @image1…-rækkefølge; tom liste ved t2v */
  referencer: PromptReference[];
};

export type KompileretPrompt = {
  promptVersion: number;
  /** De 8 blokke i fast rækkefølge */
  blokke: string[];
  /** Blokkene samlet til én promptstreng */
  prompt: string;
  ordIDialog: number;
  maxOrd: number;
};

/** Ordloft for lipsynket dialog ved en given klipvarighed */
export function maxOrdForVarighed(varighedSek: number): number {
  return Math.floor(varighedSek * ORD_PR_SEKUND);
}

export function taelOrd(tekst: string): number {
  return tekst
    .trim()
    .split(/\s+/)
    .filter((ord) => ord.length > 0).length;
}

function referenceTag(
  referencer: PromptReference[],
  rolle: ReferenceRolle,
): string | null {
  const index = referencer.findIndex((reference) => reference.rolle === rolle);
  return index === -1 ? null : `@image${index + 1}`;
}

export function kompilerPrompt(input: PromptInput): KompileretPrompt {
  if (
    !Number.isInteger(input.varighedSek) ||
    input.varighedSek < MIN_VARIGHED_SEK ||
    input.varighedSek > MAX_VARIGHED_SEK
  ) {
    throw new Error(
      `Ugyldig varighed: ${input.varighedSek} — Seedance-klip er hele sekunder mellem ${MIN_VARIGHED_SEK} og ${MAX_VARIGHED_SEK}`,
    );
  }
  if (input.actionBeats.length === 0) {
    throw new Error("Mindst ét action beat er påkrævet (blok 4)");
  }
  if (taelOrd(input.dialog) === 0) {
    throw new Error("Dialogen må ikke være tom (blok 5) — UGC-klippet bæres af tale");
  }

  const ordIDialog = taelOrd(input.dialog);
  const maxOrd = maxOrdForVarighed(input.varighedSek);
  if (ordIDialog > maxOrd) {
    throw new Error(
      `Dialogen er for lang: ${ordIDialog} ord, men ${input.varighedSek} s giver plads til højst ${maxOrd} ord i naturligt taletempo`,
    );
  }

  const karakterTag = referenceTag(input.referencer, "karakter");
  const produktTag = referenceTag(input.referencer, "produkt");
  const lokationTag = referenceTag(input.referencer, "lokation");

  const beats = input.actionBeats
    .map((beat, index) => `${index + 1}) ${beat}`)
    .join(" ");
  const negativer = [...FAST_NEGATIV_LISTE, ...(input.ekstraNegativer ?? [])];
  const manifest = input.referencer
    .map((reference, index) => `@image${index + 1} = ${reference.rolle}`)
    .join(", ");

  const blokke: string[] = [
    // 1. Stil-anker — telefonkamera-realisme er fast grund, ikke til forhandling
    `Stil: ${input.stilAnker} — håndholdt telefonkamera-realisme som ægte UGC, ikke poleret reklamefilm.`,
    // 2. Karakter-anker — altid anonym person, aldrig en genkendelig/virkelig
    karakterTag
      ? `Karakter: PRÆCIS personen fra ${karakterTag} — ${input.karakter}; bevar ansigt, hår og fremtoning uændret gennem hele klippet. Aldrig en genkendelig eller virkelig person.`
      : `Karakter: ${input.karakter} — en anonym person, aldrig en genkendelig eller virkelig person.`,
    // 3. Lokation
    lokationTag
      ? `Lokation: ${input.lokation} — matcher rummet i ${lokationTag}.`
      : `Lokation: ${input.lokation}.`,
    // 4. Action beats (+ produkt-reference når den findes)
    produktTag
      ? `Handling: ${beats} Produktet er PRÆCIS varen fra ${produktTag} — bevar udseende, farver og logo uændret.`
      : `Handling: ${beats}`,
    // 5. Dialog — lipsynket, dansk, inden for ordloftet
    `Dialog (dansk, native lipsync): "${input.dialog}"`,
    // 6. Audio-instruks
    `Audio: ${input.audio} — al tale er på dansk i naturligt taletempo, rumklang matcher lokationen.`,
    // 7. Negativ-liste — den faste liste er altid med
    `Undgå: ${negativer.join("; ")}.`,
    // 8. Teknik
    [
      `Teknik: ${input.format}, ${input.varighedSek} sekunder, ét ubrudt klip med native lipsynket audio.`,
      input.teknik,
      manifest ? `Referencer: ${manifest}.` : null,
    ]
      .filter((del): del is string => Boolean(del))
      .join(" "),
  ];

  return {
    promptVersion: PROMPT_VERSION,
    blokke,
    prompt: blokke.join("\n\n"),
    ordIDialog,
    maxOrd,
  };
}
