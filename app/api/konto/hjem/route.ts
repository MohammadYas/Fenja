import { NextResponse } from "next/server";
import { hentHjem } from "@/lib/pipeline/skabeloner";
import { opretServerKlient } from "@/lib/supabase/server";

// S31 · gem sælgerens selvvalgte hjem. Tom værdi (null) = ryd valget → det
// deterministiske hjem bruges igen. Et ukendt id afvises, så kun gyldige hjem
// kan låses. Skrivningen sker som den indloggede bruger (RLS: egen profil).
export async function POST(request: Request) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  }

  let krop: { hjem?: unknown };
  try {
    krop = await request.json();
  } catch {
    return NextResponse.json({ fejl: "ugyldig anmodning" }, { status: 400 });
  }

  const raa = krop.hjem;
  // null/"" rydder valget; ellers skal id'et matche et kendt hjem
  const valg = raa == null || raa === "" ? null : String(raa);
  if (valg !== null && !hentHjem(valg)) {
    return NextResponse.json({ fejl: "ukendt hjem" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ home_anchor: valg })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, hjem: valg });
}
