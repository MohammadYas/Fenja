// Preset-arkitekturen (SPEC §9): hvert preset er et typet, versioneret objekt
// der bærer alle fem promptblokke, så en (id, version) altid beskriver hele
// sin prompt. Kompileringen af blokkene sker i kompiler.ts og er deterministisk.

export type PromptBlokke = {
  /** Blok 1 · reference-instruks — prompten må ALDRIG styre tøjets udseende (C-2) */
  referenceInstruks: string;
  /** Blok 2 · person-ankre i divers rotation; valget pr. item er deterministisk (C-6) */
  personAnkre: readonly string[];
  /** Blok 3 · nordisk setting — den eneste blok der adskiller de tre presets */
  setting: string;
  /** Blok 4 · fotostil — Vinted-feedets look, ikke glossy e-com */
  fotostil: string;
  /** Blok 5 · negativ-liste — kan aldrig udelades; kompileren afviser tomme lister */
  negativListe: readonly string[];
};

export type Preset = {
  id: string;
  navn: string;
  /** Bumpes ved enhver blok-ændring — pass-rate måles pr. (id, version) (FR-15) */
  version: number;
  /** Genvej til blokke.setting — bevaret for eksisterende kald */
  setting: string;
  blokke: PromptBlokke;
};
