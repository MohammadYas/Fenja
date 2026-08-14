// Preset-/promptsystem (SPEC §9): faste blokke — reference-instruks, person-anker,
// nordisk setting, fotostil, negativ-liste. Versioneret med pass-rate i DB (FR-15).

export type Preset = {
  id: string;
  navn: string;
  version: number;
  /** Kun setting-blokken varierer pr. preset — resten er fælles regler */
  setting: string;
};

// Person-anker: neutral, divers rotation, aldrig genkendelige personer (C-6).
// Rotationen vælges deterministisk ud fra item-id, så retries er stabile.
const PERSON_ANKRE = [
  "en voksen person med kort mørkt hår og neutral fremtoning",
  "en voksen person med opsat lyst hår og neutral fremtoning",
  "en voksen person med mellemlangt sort krøllet hår og mørk hudtone",
  "en voksen person med gråsprængt hår og neutral fremtoning",
] as const;

export const PRESETS: readonly Preset[] = [
  {
    id: "lys-minimalisme",
    navn: "Lys minimalisme",
    version: 1,
    setting:
      "en lys minimalistisk lejlighed med hvide vægge, lyst trægulv og blødt gråvejrslys fra et stort vindue",
  },
  {
    id: "koebenhavnsk-gade",
    navn: "Københavnsk gade",
    version: 1,
    setting:
      "en københavnsk brostensgade med parkerede cykler, ældre byhuse og dæmpet overskyet dagslys, dæmpet farvepalette",
  },
  {
    id: "hyggelig-stue",
    navn: "Hyggelig stue",
    version: 1,
    setting:
      "en hyggelig stue med bogreol, en tændt gulvlampe med varmt lys, uldplaid over et armlæn og rolige jordfarver",
  },
] as const;

export const STANDARD_PRESET_ID: string = PRESETS[0]!.id;

export function hentPreset(id: string): Preset {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Ukendt preset: ${id}`);
  return preset;
}

/** Deterministisk person-rotation pr. item (C-6) */
export function vaelgPersonAnker(itemId: string): string {
  let hash = 0;
  for (const tegn of itemId) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return PERSON_ANKRE[Math.abs(hash) % PERSON_ANKRE.length]!;
}

export function bygOnModelPrompt(preset: Preset, itemId: string): string {
  return [
    // 1. Reference-instruks — prompten må ALDRIG styre tøjets udseende (C-2)
    "Personen bærer PRÆCIS beklædningen fra referencebilledet — bevar print, grafik, farve, snit og længde nøjagtigt; opfind eller 'forbedr' intet, og bevar synligt slid og fejl hvor de er.",
    // 2. Person-anker (divers rotation, aldrig genkendelige personer)
    `Personen er ${vaelgPersonAnker(itemId)} — en anonym person, ikke en genkendelig eller virkelig person, i naturlig afslappet positur.`,
    // 3. Nordisk setting (preset-blokken)
    `Setting: ${preset.setting}.`,
    // 4. Fotostil — matcher Vinted-feedets look, ikke glossy e-com
    "Fotostil: naturligt lys, realistisk telefonkamera-æstetik, let dybdeskarphed, ingen studieopstilling.",
    // 5. Negativ-liste
    "Undgå: tekst eller logoer ud over tøjets egne, ansigtsforskønnelse, ændring af tøjets pasform, ekstra accessories på tøjet.",
  ].join(" ");
}
