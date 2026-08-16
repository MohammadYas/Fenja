// Preset-/promptsystemet (SPEC §9) samlet ét sted: typede, versionerede
// presets (definitioner), deterministisk kompilering af de fem promptblokke
// (kompiler) og pass-rate-statistik pr. version (stats, C-5/FR-15).
// Den offentlige API fra det tidligere presets.ts er bevaret uændret.

export type { Preset, PromptBlokke } from "./typer";
export { PRESETS, STANDARD_PRESET_ID, hentPreset } from "./definitioner";
export {
  bygOnModelPrompt,
  kompilerPromptBlokke,
  presetVersionsTag,
  vaelgPersonAnker,
} from "./kompiler";
export type {
  PresetKoersel,
  PresetStatRaekke,
  PresetStatsStore,
} from "./stats";
export {
  MockPresetStatsStore,
  STANDARD_STATS_PROVIDER,
  SupabasePresetStatsStore,
  passRate,
} from "./stats";
