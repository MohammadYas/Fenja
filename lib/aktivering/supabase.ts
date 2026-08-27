import "server-only";

// Supabase-siden af aktiverings-nudgen. Holdt adskilt fra nudge.ts, så
// udvælgelsen og rækkefølgen kan testes uden database (NFR-5).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NudgeDb, NudgeKandidat } from "./nudge";

export class SupabaseNudgeDb implements NudgeDb {
  constructor(private klient: SupabaseClient) {}

  /**
   * Profiler der er modne til en nudge: oprettet før skæringen, aldrig
   * nudget, og UDEN et eneste item.
   *
   * "Uden items" kan ikke udtrykkes som et join i PostgREST, så der hentes
   * et overskud af kandidater, og de der HAR items sorteres fra bagefter.
   * Overskuddet er bevidst rigeligt: på denne datamængde er det ét ekstra
   * indekseret opslag, og loftet i nudge.ts holder afsendelsen i skak.
   */
  async hentKandidater(foerIso: string, maks: number): Promise<NudgeKandidat[]> {
    const { data: profiler, error } = await this.klient
      .from("profiles")
      .select("id, email, created_at")
      .is("aktivering_nudget_at", null)
      .lt("created_at", foerIso)
      .order("created_at", { ascending: true })
      .limit(maks * 4);
    if (error || !profiler || profiler.length === 0) return [];

    const ider = profiler.map((p) => p.id as string);
    const { data: medItems, error: itemFejl } = await this.klient
      .from("items")
      .select("user_id")
      .in("user_id", ider);
    // Kan "har items" ikke afgøres, sendes der INTET: en nudge til en bruger
    // der allerede er i gang, er værre end en nudge der kommer et døgn senere.
    if (itemFejl) return [];

    const harItems = new Set((medItems ?? []).map((r) => r.user_id as string));
    return profiler
      .filter((p) => !harItems.has(p.id as string) && typeof p.email === "string" && p.email)
      .slice(0, maks)
      .map((p) => ({ id: p.id as string, email: p.email as string }));
  }

  /** Kapløbs-værn: kun den kørsel der faktisk sætter stemplet, får lov at sende */
  async stempelNudget(userId: string, naarIso: string): Promise<boolean> {
    const { data } = await this.klient
      .from("profiles")
      .update({ aktivering_nudget_at: naarIso })
      .eq("id", userId)
      .is("aktivering_nudget_at", null)
      .select("id")
      .maybeSingle();
    return Boolean(data);
  }
}

/** Antal brugere der lige nu venter på en nudge — vises i /admin */
export async function antalAfventerNudge(
  klient: SupabaseClient,
  foerIso: string,
): Promise<number | null> {
  const db = new SupabaseNudgeDb(klient);
  try {
    const kandidater = await db.hentKandidater(foerIso, 200);
    return kandidater.length;
  } catch {
    return null;
  }
}
