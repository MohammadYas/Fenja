import { NextResponse, type NextRequest } from "next/server";
import {
  STANDARD_TRIAL_INDSTILLINGER,
  gemTrialIndstillinger,
  hentTrialIndstillinger,
} from "@/lib/admin/trial-indstillinger";
import { erAdmin } from "@/lib/auth/admin";
import { da } from "@/lib/copy/da";
import { laesOgValider } from "@/lib/sikkerhed/validering";
import { opretServerKlient } from "@/lib/supabase/server";

// Admin: trial-driften (ejer-ordre 25/8) — toggle + dagligt budgetloft, gemt
// i `indstillinger` og læst FRISKT af /api/prov ved hvert forsøg: et "luk
// trialen nu" virker øjeblikkeligt, uden deploy. Alle andre får 404 (samme
// mønster som billedmodel-ruten).
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
  return NextResponse.json({
    indstillinger: (await hentTrialIndstillinger()) ?? STANDARD_TRIAL_INDSTILLINGER,
  });
}

export async function POST(request: NextRequest) {
  const email = await hentAdminEmail();
  if (!email) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  const laest = await laesOgValider<{ aktiv?: boolean; dagligtBudgetDkk?: number }>(
    request,
    {
      aktiv: { slags: "boolsk", valgfri: true },
      dagligtBudgetDkk: { slags: "tal", min: 0, maks: 10_000, valgfri: true },
    },
  );
  if (!laest.ok) {
    return NextResponse.json({ fejl: da.admin.trial.fejlUgyldig }, { status: 400 });
  }

  const nuvaerende = (await hentTrialIndstillinger()) ?? STANDARD_TRIAL_INDSTILLINGER;
  const valg = {
    aktiv: laest.data.aktiv ?? nuvaerende.aktiv,
    dagligtBudgetDkk: laest.data.dagligtBudgetDkk ?? nuvaerende.dagligtBudgetDkk,
  };

  try {
    await gemTrialIndstillinger(valg, email);
  } catch {
    return NextResponse.json({ fejl: da.admin.trial.fejlGem }, { status: 500 });
  }
  return NextResponse.json({ ok: true, indstillinger: valg });
}
