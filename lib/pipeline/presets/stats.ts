// Pass-rate-statistik pr. (preset-version, provider) (C-5/FR-15): hver
// troskabs-vurdering registreres som en kørsel, og preset_stats holder
// aggregatet (runs, passes, avg_fidelity). Bag interface med mock, så Gate 1-scriptet og tests kører
// uden nøgler (C-7-princippet). Supabase-varianten kaldes kun fra server/
// scripts med service-nøgle — skrive-vejen i DB er en security definer-funktion
// med tilbagekaldt execute for klient-roller (se preset_stats-migrationen).

import type { SupabaseClient } from "@supabase/supabase-js";

// Provider-dimensionen (Gate 1-trekampen): pass-rate måles pr.
// (preset, version, provider). Udeladt provider = 'fal' — bagudkompatibelt
// med eksisterende kald og rækker.
export const STANDARD_STATS_PROVIDER = "fal";

export type PresetKoersel = {
  presetId: string;
  version: number;
  /** Billedprovideren bag kørslen; udeladt = 'fal' */
  provider?: string;
  /** Bestod troskabs-tjekket (score ≥ tærsklen, C-3/K1)? */
  bestaaet: boolean;
  fidelityScore: number;
};

export type PresetStatRaekke = {
  presetId: string;
  version: number;
  provider: string;
  runs: number;
  passes: number;
  /** Gennemsnitlig troskabs-score (3 decimaler); null før første kørsel */
  avgFidelity: number | null;
};

export interface PresetStatsStore {
  registrerKoersel(koersel: PresetKoersel): Promise<void>;
  hentStatistik(): Promise<PresetStatRaekke[]>;
}

export function passRate(raekke: PresetStatRaekke): number | null {
  return raekke.runs === 0 ? null : raekke.passes / raekke.runs;
}

/** Samme inkrementelle gennemsnit som registrer_preset_koersel i DB */
function nytGennemsnit(
  avg: number | null,
  runs: number,
  score: number,
): number {
  return Math.round((((avg ?? 0) * runs + score) / (runs + 1)) * 1000) / 1000;
}

export class MockPresetStatsStore implements PresetStatsStore {
  private raekker = new Map<string, PresetStatRaekke>();

  async registrerKoersel(koersel: PresetKoersel): Promise<void> {
    const provider = koersel.provider ?? STANDARD_STATS_PROVIDER;
    const noegle = `${koersel.presetId}@v${koersel.version}#${provider}`;
    const raekke = this.raekker.get(noegle) ?? {
      presetId: koersel.presetId,
      version: koersel.version,
      provider,
      runs: 0,
      passes: 0,
      avgFidelity: null,
    };
    this.raekker.set(noegle, {
      ...raekke,
      runs: raekke.runs + 1,
      passes: raekke.passes + (koersel.bestaaet ? 1 : 0),
      avgFidelity: nytGennemsnit(
        raekke.avgFidelity,
        raekke.runs,
        koersel.fidelityScore,
      ),
    });
  }

  async hentStatistik(): Promise<PresetStatRaekke[]> {
    return [...this.raekker.values()].sort(
      (a, b) =>
        a.presetId.localeCompare(b.presetId) ||
        a.version - b.version ||
        a.provider.localeCompare(b.provider),
    );
  }
}

export class SupabasePresetStatsStore implements PresetStatsStore {
  constructor(private klient: SupabaseClient) {}

  async registrerKoersel(koersel: PresetKoersel): Promise<void> {
    const { error } = await this.klient.rpc("registrer_preset_koersel", {
      p_preset_id: koersel.presetId,
      p_version: koersel.version,
      p_bestaaet: koersel.bestaaet,
      p_fidelity: koersel.fidelityScore,
      p_provider: koersel.provider ?? STANDARD_STATS_PROVIDER,
    });
    if (error) {
      throw new Error(`Kunne ikke registrere preset-kørsel: ${error.message}`);
    }
  }

  async hentStatistik(): Promise<PresetStatRaekke[]> {
    const { data, error } = await this.klient
      .from("preset_stats")
      .select("preset_id, version, provider, runs, passes, avg_fidelity")
      .order("preset_id")
      .order("version")
      .order("provider");
    if (error) {
      throw new Error(`Kunne ikke hente preset-statistik: ${error.message}`);
    }
    return (data ?? []).map((r) => ({
      presetId: r.preset_id as string,
      version: r.version as number,
      provider: r.provider as string,
      runs: r.runs as number,
      passes: r.passes as number,
      avgFidelity:
        r.avg_fidelity === null ? null : Number(r.avg_fidelity as number),
    }));
  }
}
