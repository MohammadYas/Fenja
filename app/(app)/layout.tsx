import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ForbindelseFejl } from "@/components/forbindelse-fejl";
import { SpringLink } from "@/components/spring-link";
import { Badge } from "@/components/ui/badge";
import { hentBrugerTilstand } from "@/lib/auth/bruger";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// App-skal: topbar med saldo altid synlig (E-1) + bund-navigation.
// Auth håndhæves både her og i middleware.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await opretServerKlient();
  // To slags "ingen bruger" — samme skelnen som i middleware (ejer-rapport:
  // "kan ikke logge ind"). Et rigtigt nej sender til log ind; et kald der
  // FEJLEDE (timeout hos Netlify→Supabase) må ikke gøre det: brugeren er
  // stadig logget ind, og sendte vi ham på login-væggen, sendte login-siden
  // ham tilbage hertil — ringen, ingen kunne komme ud af.
  const { bruger, fejlede } = await hentBrugerTilstand(supabase);
  if (!bruger) {
    if (fejlede) return <ForbindelseFejl />;
    redirect("/log-ind?besked=session-udloebet");
  }

  const { data: saldoRaekke } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", bruger.id)
    .maybeSingle();
  const saldo = (saldoRaekke?.balance as number | undefined) ?? 0;

  return (
    <div className="min-h-dvh pb-24">
      <SpringLink />
      {/* Topbar med søm-underkant; saldoen altid synlig som stille mærkat (E-1) */}
      <header className="sticky top-0 z-10 bg-baggrund">
        <div className="mx-auto flex min-h-touch max-w-md items-center justify-between px-4 py-1">
          <span className="font-display text-lead font-bold">
            {da.site.navn}
          </span>
          <Badge>{da.nav.saldo(saldo)}</Badge>
        </div>
        <div className="soem-vandret" aria-hidden="true" />
      </header>
      <div className="mx-auto max-w-md px-4" id="indhold">{children}</div>
      <AppNav />
    </div>
  );
}
