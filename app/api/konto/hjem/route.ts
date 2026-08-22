import { NextResponse } from "next/server";
import { hjemRotation } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { HJEM, hentHjem, vaelgHjem } from "@/lib/pipeline/skabeloner";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// S31 · sælgerens hjem. Ejer-ordre 22/8: hjemmet er IKKE et frit gavebord —
// man får ét tildelt og kan rotere det HØJST hjemRotation.maks gange. Det
// holder profilerne konsistente (samme sælger = samme sted) og forhindrer,
// at alle bladrer efter "det pæneste hjem", så profilerne ender ens.
//
// SERVEREN bestemmer hvilket hjem man roterer TIL — klienten kan ikke vælge
// frit. Tælleren skrives med service-rollen, så en klient ikke kan nulstille
// den ved selv at skrive på sin profil.
export async function POST() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  }

  const service = opretServiceKlient();
  const { data: profil } = await service
    .from("profiles")
    .select("home_anchor, hjem_rotationer")
    .eq("id", user.id)
    .maybeSingle();

  const brugt = Number((profil?.hjem_rotationer as number | null | undefined) ?? 0);
  if (brugt >= hjemRotation.maks) {
    return NextResponse.json(
      { fejl: da.konto.hjem.opbrugt(hjemRotation.maks) },
      { status: 409 },
    );
  }

  // Næste hjem i rækken efter det nuværende — deterministisk, ikke frit valg
  const nuvaerende =
    hentHjem((profil?.home_anchor as string | null | undefined) ?? null) ??
    vaelgHjem(user.id);
  const nuIndex = HJEM.findIndex((h) => h.id === nuvaerende.id);
  const naeste = HJEM[(nuIndex + 1) % HJEM.length]!;

  const { error } = await service
    .from("profiles")
    .update({ home_anchor: naeste.id, hjem_rotationer: brugt + 1 })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    hjem: { id: naeste.id, navn: da.konto.hjem.navne[naeste.id] ?? naeste.navn },
    tilbage: hjemRotation.maks - (brugt + 1),
  });
}
