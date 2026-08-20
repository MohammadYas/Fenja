import { NextResponse, type NextRequest } from "next/server";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const KOEN = ["mand", "kvinde"] as const;
const HAAR = ["sort", "brunt", "blondt", "roedt", "graat", "moerkt"] as const;

// Onboarding (ejer-ordre 2026-08-20): køn + hårfarve gemmes på profilen og
// styrer personen på alle genererede billeder fremover.
export async function POST(request: NextRequest) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const krop = (await request.json()) as { koen?: string; haarFarve?: string };
  if (!KOEN.includes(krop.koen as (typeof KOEN)[number])) {
    return NextResponse.json({ fejl: "ugyldigt valg" }, { status: 400 });
  }
  const haar = HAAR.includes(krop.haarFarve as (typeof HAAR)[number])
    ? krop.haarFarve
    : null;

  const service = opretServiceKlient();
  const { error } = await service
    .from("profiles")
    .update({ koen: krop.koen, haar_farve: haar })
    .eq("id", user.id);
  if (error) {
    // Migration 20260820110000 ikke kørt endnu — sig det ærligt
    return NextResponse.json(
      { fejl: /koen|haar_farve|column/i.test(error.message) ? da.onboarding.fejlMigration : error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
