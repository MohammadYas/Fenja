import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { Badge } from "@/components/ui/badge";
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
      <header className="sticky top-0 z-10 border-b border-kant bg-baggrund">
        <div className="mx-auto flex min-h-touch max-w-md items-center justify-between px-4">
          <span className="font-display text-lead font-semibold">{da.site.navn}</span>
          <Badge>{da.nav.saldo(saldo)}</Badge>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4">{children}</div>
      <AppNav />
    </div>
  );
}
