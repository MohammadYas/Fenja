// Planlagt Netlify-funktion (27/8): ét venligt skub til brugere der tilmeldte
// sig og aldrig lagde noget op. Begge ægte brugere faldt præcis dér.
//
// BEVIDST VALG AF PLATFORM: jobbet kunne have været en Trigger.dev-schedule
// som de øvrige i trigger/, men INTET Trigger.dev-job er deployet — og et
// udeployet job parkeres i PENDING_VERSION og kører i stedet aldrig, uden at
// noget siger fra (prod-hændelsen 26/8). Netlify kører planen med sitets egne
// nøgler og kræver ingen ekstra adgang, så nudgen virker fra første deploy.
// Planen står i netlify.toml under [functions."aktivering-nudge"].
//
// Bundtes af "byg:funktioner" i package.json til
// netlify/functions/aktivering-nudge.mjs.

import { koerAktiveringsNudge, NUDGE_EFTER_MS } from "@/lib/aktivering/nudge";
import { SupabaseNudgeDb } from "@/lib/aktivering/supabase";
import { site } from "@/lib/config";
import { sendAktiveringsNudge } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { opretServiceKlient } from "@/lib/supabase/service";

const aktiveringNudge = async (): Promise<Response> => {
  // Uden Resend-nøgle mockes afsendelsen lydløst. Så ville stemplet blive
  // sat for brugere, der ALDRIG fik en mail — og de kan aldrig nudges igen.
  // Derfor: hellere ingenting end et stempel uden en mail bag.
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { sendt: 0, sprunget: 0, fejlet: 0, note: "RESEND_API_KEY mangler — nudgen er sprunget over" },
      { status: 200 },
    );
  }

  const afsender = hentEmailAfsender();
  const startUrl = new URL("/nyt-item", site.baseUrl).toString();

  const resultat = await koerAktiveringsNudge(
    new SupabaseNudgeDb(opretServiceKlient()),
    async (kandidat) => {
      await sendAktiveringsNudge(afsender, { til: kandidat.email, startUrl });
    },
  );

  // Svaret havner i Netlifys funktionslog — det er dét, der gør en tavs
  // plan aflæselig udefra, uden adgang til databasen.
  console.log(
    `aktivering-nudge: sendt=${resultat.sendt} sprunget=${resultat.sprunget} fejlet=${resultat.fejlet} (vindue ${NUDGE_EFTER_MS / 3_600_000} t)`,
  );
  return Response.json(resultat, { status: 200 });
};

export default aktiveringNudge;
