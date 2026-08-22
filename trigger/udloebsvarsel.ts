// Udløbsvarsel på kreditter (ejer-ordre 22/8, omsætnings-audit punkt 3):
// kreditter udløber efter 12 måneder, og der fandtes ingen advarsel. En
// bruger, der mister kreditter uden varsel, kommer ikke tilbage.
//
// Kører dagligt: finder alle med kreditter der udløber inden for VARSEL_DAGE,
// sender ÉN mail, og stempler profilen så samme udløb aldrig varsles to
// gange. Best-effort pr. modtager — én fejlet mail stopper ikke resten.

import { schedules } from "@trigger.dev/sdk";
import { site } from "@/lib/config";
import { bedstMuligt, sendUdloebsvarsel } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { opretServiceKlient } from "@/lib/supabase/service";

export const VARSEL_DAGE = 30;
/** Samme udløb varsles kun én gang — stemplet nulstilles ved nye køb */
const GENVARSEL_EFTER_DAGE = 60;

export const udloebsvarsel = schedules.task({
  id: "udloebsvarsel",
  // Hver dag kl. 07 UTC — inden de fleste åbner appen
  cron: "0 7 * * *",
  run: async () => {
    const service = opretServiceKlient();
    const nu = Date.now();
    const graense = new Date(nu + VARSEL_DAGE * 86_400_000).toISOString();

    // Kreditter der udløber inden for vinduet og stadig har værdi tilbage
    const { data: raekker } = await service
      .from("credit_ledger")
      .select("user_id, delta, expires_at")
      .gt("delta", 0)
      .not("expires_at", "is", null)
      .lte("expires_at", graense)
      .gte("expires_at", new Date(nu).toISOString());
    if (!raekker || raekker.length === 0) return { sendt: 0 };

    // Læg sammen pr. bruger, og hold styr på den tidligste udløbsdato
    const prBruger = new Map<string, { antal: number; foerste: string }>();
    for (const r of raekker as { user_id: string; delta: number; expires_at: string }[]) {
      const nuvaerende = prBruger.get(r.user_id);
      const antal = Number(r.delta);
      if (!nuvaerende) {
        prBruger.set(r.user_id, { antal, foerste: r.expires_at });
      } else {
        nuvaerende.antal += antal;
        if (r.expires_at < nuvaerende.foerste) nuvaerende.foerste = r.expires_at;
      }
    }

    const { data: profiler } = await service
      .from("profiles")
      .select("id, email, udloeb_varslet_at")
      .in("id", [...prBruger.keys()]);

    const afsender = hentEmailAfsender();
    let sendt = 0;
    for (const profil of (profiler ?? []) as {
      id: string;
      email: string | null;
      udloeb_varslet_at: string | null;
    }[]) {
      const info = prBruger.get(profil.id);
      if (!info || !profil.email) continue;
      // Allerede varslet for nylig? Så lad være at støje igen.
      if (
        profil.udloeb_varslet_at &&
        nu - new Date(profil.udloeb_varslet_at).getTime() <
          GENVARSEL_EFTER_DAGE * 86_400_000
      ) {
        continue;
      }
      // Har brugeren reelt saldo tilbage? Udløbne/brugte kreditter varsles ikke.
      const { data: saldoRaekke } = await service
        .from("credit_balances")
        .select("balance")
        .eq("user_id", profil.id)
        .maybeSingle();
      const saldo = Number((saldoRaekke?.balance as number | undefined) ?? 0);
      if (saldo <= 0) continue;

      await bedstMuligt(async () => {
        await sendUdloebsvarsel(afsender, {
          til: profil.email as string,
          antal: Math.min(info.antal, saldo),
          dato: new Date(info.foerste).toLocaleDateString("da-DK", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          kreditUrl: `${site.baseUrl}/kreditter`,
        });
        await service
          .from("profiles")
          .update({ udloeb_varslet_at: new Date(nu).toISOString() })
          .eq("id", profil.id);
        sendt += 1;
      });
    }

    return { sendt, kandidater: prBruger.size };
  },
});
