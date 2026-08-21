// "Ugens Salgsplan"-digest (abonnent-fordel, 21/8): hver mandag morgen får
// alle aktive abonnenter deres Smart Salgsplan på mail — samme rene
// beregning som oversigten (lib/salg/smart-plan.ts), bare leveret i stedet
// for at vente på et besøg. Sandheden om hvem der abonnerer bor hos Stripe
// (samme princip som lib/betaling/abonnement.ts); mails er best-effort pr.
// modtager, så én fejlet adresse aldrig vælter resten af udsendelsen.

import { schedules } from "@trigger.dev/sdk";
import Stripe from "stripe";
import { site } from "@/lib/config";
import { bedstMuligt, sendSalgsplan } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { bygSalgsplan, type PlanInputItem } from "@/lib/salg/smart-plan";
import { opretServiceKlient } from "@/lib/supabase/service";

export const salgsplanDigest = schedules.task({
  id: "salgsplan-digest",
  // Mandag 06:00 UTC = 07:00/08:00 dansk tid — planen ligger klar til morgenkaffen
  cron: "0 6 * * 1",
  run: async () => {
    const noegle = process.env.STRIPE_SECRET_KEY;
    if (!noegle) return { sendt: 0, sprunget: "ingen Stripe-nøgle" };

    // 1) Aktive abonnenters e-mails fra Stripe (checkout sætter customer_email)
    const stripe = new Stripe(noegle);
    const emails = new Set<string>();
    for await (const abonnement of stripe.subscriptions.list({
      status: "active",
      expand: ["data.customer"],
      limit: 100,
    })) {
      const kunde = abonnement.customer;
      const email =
        typeof kunde === "object" && !kunde.deleted ? kunde.email : null;
      if (email) emails.add(email.toLowerCase());
    }
    if (emails.size === 0) return { sendt: 0, abonnenter: 0 };

    // 2) Match mod profiler og byg hver brugers plan
    const service = opretServiceKlient();
    const { data: profiler } = await service
      .from("profiles")
      .select("id, email")
      .in("email", [...emails]);

    const afsender = hentEmailAfsender();
    let sendt = 0;
    for (const profil of profiler ?? []) {
      const { data: items } = await service
        .from("items")
        .select(
          "id, titel, brand, category, status, leveret_at, pris_til_dkk, generations(id)",
        )
        .eq("user_id", profil.id);

      const input: PlanInputItem[] = (items ?? []).map((item) => ({
        id: item.id as string,
        titel:
          (item.titel as string | null) ??
          `${(item.brand as string | null) ?? ""} ${(item.category as string | null) ?? ""}`.trim(),
        maerke: (item.brand as string | null) ?? "",
        kategori: (item.category as string | null) ?? "",
        status: item.status === "failed" ? "draft" : (item.status as PlanInputItem["status"]),
        leveretAt: item.leveret_at as string | null,
        prisTilDkk: item.pris_til_dkk as number | null,
        paaVej:
          item.status === "draft" &&
          !item.leveret_at &&
          ((item.generations as { id: string }[] | null) ?? []).length > 0,
      }));

      const punkter = bygSalgsplan(input);
      if (punkter.length === 0) continue; // intet at råde om → ingen støjmail

      await bedstMuligt(async () => {
        await sendSalgsplan(afsender, {
          til: profil.email as string,
          punkter,
          oversigtUrl: `${site.baseUrl}/oversigt`,
        });
        sendt += 1;
      });
    }

    return { sendt, abonnenter: emails.size };
  },
});
