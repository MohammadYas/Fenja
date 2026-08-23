import { NextResponse, type NextRequest } from "next/server";
import { gemModelValg, hentModelValg } from "@/lib/admin/billedmodel-valg";
import { erAdmin } from "@/lib/auth/admin";
import { billedModeller, hentBilledModel, type BilledFormaal } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// Admin: vælg hvilken billedmodel brugerne kører på (ejer-ordre 23/8).
// Valget gemmes i `indstillinger` og slår igennem uden deploy. Kun id'er fra
// kataloget accepteres — admin kan ikke skrive et vilkårligt model-navn ind
// og dermed sende ukendte endpoints ud i pipelinen. Alle andre får 404.
const FORMAAL: readonly BilledFormaal[] = ["preview", "final"];

async function hentAdminEmail(): Promise<string | null> {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return erAdmin(user?.email) ? (user?.email ?? null) : null;
}

export async function GET() {
  if (!(await hentAdminEmail())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }
  return NextResponse.json({ modeller: billedModeller, valg: await hentModelValg() });
}

export async function POST(request: NextRequest) {
  const email = await hentAdminEmail();
  if (!email) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  const krop = (await request.json()) as { preview?: string; final?: string };
  const nuvaerende = await hentModelValg();
  const valg = { ...nuvaerende };
  for (const formaal of FORMAAL) {
    const id = krop[formaal];
    if (id === undefined) continue;
    if (!hentBilledModel(id)) {
      return NextResponse.json(
        { fejl: da.admin.billedmodel.fejlUkendtModel },
        { status: 400 },
      );
    }
    valg[formaal] = id;
  }

  try {
    await gemModelValg(valg, email);
  } catch {
    // Typisk årsag: migration 20260823100000 er ikke kørt i Supabase endnu
    return NextResponse.json(
      { fejl: da.admin.billedmodel.fejlGem },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, valg });
}
