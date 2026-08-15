import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SpringLink } from "@/components/spring-link";
import { Prislap } from "@/components/ui/prislap";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// App-skal: topbar med saldo altid synlig (E-1) + bund-navigation.
// Auth håndhæves både her og i middleware.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/log-ind");

  const { data: saldoRaekke } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  const saldo = (saldoRaekke?.balance as number | undefined) ?? 0;

  return (
    <div className="min-h-dvh pb-24">
      <SpringLink />
      {/* Topbar med søm-underkant; saldoen som lille prislap (REDESIGN §3.2) */}
      <header className="sticky top-0 z-10 bg-baggrund">
        <div className="mx-auto flex min-h-touch max-w-md items-center justify-between px-4 py-1">
          <span className="font-display text-lead font-bold uppercase">
            {da.site.navn}
          </span>
          <Prislap taet>
            <span className="font-mono text-detalje font-medium">
              {da.nav.saldo(saldo)}
            </span>
          </Prislap>
        </div>
        <div className="soem-vandret" aria-hidden="true" />
      </header>
      <div className="mx-auto max-w-md px-4" id="indhold">{children}</div>
      <AppNav />
    </div>
  );
}
