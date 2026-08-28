import { ProevIgenKnap } from "@/components/proev-igen-knap";
import { da } from "@/lib/copy/da";

// Serveren kunne ikke NÅ Supabase (timeout/netværk). Brugeren er ikke logget
// ud, og må derfor ikke sendes på login-væggen: det så ud som om man var
// smidt ud, og log ind sendte én lige tilbage igen. Samme skærm bruges af
// app-skallen og af de sider, der selv slår brugeren op — ellers kunne en
// sides omdirigering vinde over skallens ærlige besked.
export function ForbindelseFejl() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-kaempe font-bold">
        {da.fejlsider.forbindelseTitel}
      </h1>
      <p className="mt-4 max-w-laesbar text-tekst/80">
        {da.fejlsider.forbindelseTekst}
      </p>
      <p className="mt-8">
        <ProevIgenKnap />
      </p>
    </main>
  );
}
