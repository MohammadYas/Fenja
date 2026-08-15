// De 3 nordiske launch-presets (C-5) som versionerede objekter. Kun setting-
// blokken varierer — reference-instruks, person-ankre, fotostil og negativ-
// liste er fælles regler, men bæres af hvert preset, så én (id, version)
// altid beskriver hele sin prompt. Ændres en blok, bumpes version.

import type { Preset, PromptBlokke } from "./typer";

// Person-ankre: neutrale, diverse, aldrig genkendelige personer (C-6).
// Rotationen vælges deterministisk ud fra item-id (kompiler.ts), så retries er stabile.
export const PERSON_ANKRE = [
  "en voksen person med kort mørkt hår og neutral fremtoning",
  "en voksen person med opsat lyst hår og neutral fremtoning",
  "en voksen person med mellemlangt sort krøllet hår og mørk hudtone",
  "en voksen person med gråsprængt hår og neutral fremtoning",
] as const;

const FAELLES_BLOKKE: Omit<PromptBlokke, "setting"> = {
  referenceInstruks:
    "Personen bærer PRÆCIS beklædningen fra referencebilledet — bevar print, grafik, farve, snit og længde nøjagtigt; opfind eller 'forbedr' intet, og bevar synligt slid og fejl hvor de er.",
  personAnkre: PERSON_ANKRE,
  fotostil:
    "naturligt lys, realistisk telefonkamera-æstetik, let dybdeskarphed, ingen studieopstilling",
  negativListe: [
    "tekst eller logoer ud over tøjets egne",
    "ansigtsforskønnelse",
    "ændring af tøjets pasform",
    "ekstra accessories på tøjet",
  ],
};

function definerPreset(def: {
  id: string;
  navn: string;
  version: number;
  setting: string;
}): Preset {
  return { ...def, blokke: { ...FAELLES_BLOKKE, setting: def.setting } };
}

export const PRESETS: readonly Preset[] = [
  definerPreset({
    id: "lys-minimalisme",
    navn: "Lys minimalisme",
    version: 1,
    setting:
      "en lys minimalistisk lejlighed med hvide vægge, lyst trægulv og blødt gråvejrslys fra et stort vindue",
  }),
  definerPreset({
    id: "koebenhavnsk-gade",
    navn: "Københavnsk gade",
    version: 1,
    setting:
      "en københavnsk brostensgade med parkerede cykler, ældre byhuse og dæmpet overskyet dagslys, dæmpet farvepalette",
  }),
  definerPreset({
    id: "hyggelig-stue",
    navn: "Hyggelig stue",
    version: 1,
    setting:
      "en hyggelig stue med bogreol, en tændt gulvlampe med varmt lys, uldplaid over et armlæn og rolige jordfarver",
  }),
] as const;

export const STANDARD_PRESET_ID: string = PRESETS[0]!.id;

export function hentPreset(id: string): Preset {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Ukendt preset: ${id}`);
  return preset;
}
