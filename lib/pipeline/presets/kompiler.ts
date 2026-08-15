// Deterministisk prompt-kompilering: samme (preset, itemId) giver ALTID samme
// prompt — ingen Math.random/Date.now, så retries, tests og pass-rate-målinger
// pr. version er stabile. Kompileren håndhæver også invarianterne: person-
// rammen (anonym, aldrig genkendelig, C-6) er hardcodet her og kan ikke
// redigeres pr. preset, og negativ-listen kan aldrig udelades.

import { PERSON_ANKRE } from "./definitioner";
import type { Preset } from "./typer";

function rotationsIndeks(noegle: string, laengde: number): number {
  let hash = 0;
  for (const tegn of noegle) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return Math.abs(hash) % laengde;
}

/** Deterministisk person-rotation pr. item (C-6) */
export function vaelgPersonAnker(
  itemId: string,
  ankre: readonly string[] = PERSON_ANKRE,
): string {
  if (ankre.length === 0) {
    throw new Error("Person-rotation kræver mindst ét anker (C-6)");
  }
  return ankre[rotationsIndeks(itemId, ankre.length)]!;
}

/** De fem blokke kompileret i SPEC §9-rækkefølge — kaster ved ugyldigt preset */
export function kompilerPromptBlokke(
  preset: Preset,
  itemId: string,
): readonly [string, string, string, string, string] {
  const { referenceInstruks, personAnkre, setting, fotostil, negativListe } =
    preset.blokke;
  if (!referenceInstruks.trim() || !setting.trim() || !fotostil.trim()) {
    throw new Error(
      `Preset ${presetVersionsTag(preset)} mangler en promptblok — kompilering afvist`,
    );
  }
  // Negativ-listen kan aldrig udelades (SPEC §9 blok 5) — et preset uden er ugyldigt
  if (negativListe.length === 0 || negativListe.some((punkt) => !punkt.trim())) {
    throw new Error(
      `Preset ${presetVersionsTag(preset)} mangler negativ-liste — kompilering afvist`,
    );
  }
  return [
    // 1. Reference-instruks — prompten må ALDRIG styre tøjets udseende (C-2)
    referenceInstruks,
    // 2. Person-anker (divers rotation, aldrig genkendelige personer)
    `Personen er ${vaelgPersonAnker(itemId, personAnkre)} — en anonym person, ikke en genkendelig eller virkelig person, i naturlig afslappet positur.`,
    // 3. Nordisk setting (preset-blokken)
    `Setting: ${setting}.`,
    // 4. Fotostil — matcher Vinted-feedets look, ikke glossy e-com
    `Fotostil: ${fotostil}.`,
    // 5. Negativ-liste
    `Undgå: ${negativListe.join(", ")}.`,
  ];
}

export function bygOnModelPrompt(preset: Preset, itemId: string): string {
  return kompilerPromptBlokke(preset, itemId).join(" ");
}

/** Versions-tag i samme format som generations.prompt_version: "id@vN" */
export function presetVersionsTag(preset: Preset): string {
  return `${preset.id}@v${preset.version}`;
}
