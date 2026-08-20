import { NextResponse } from "next/server";
import { opretServerKlient } from "@/lib/supabase/server";

// Log ud (ejer-ordre 2026-08-20: skal være nemt fra Konto). POST, så et
// link-preview eller en crawler aldrig kan logge brugeren ud ved et uheld.
export async function POST() {
  const supabase = await opretServerKlient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
