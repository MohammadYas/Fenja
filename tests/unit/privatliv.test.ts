import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";

// GDPR-oplysningspligten er et produktkrav på linje med compliance-rækkefølgen:
// politikken skal blive ved med at passe på koden. Testen fanger de tre ting,
// der i praksis skrider — en modtager der forsvinder ud af listen, en rettighed
// der loves uden at findes, og en frist der ryger ud af teksten.

const alleAfsnit = da.privatliv.afsnit
  .map((a) => `${a.overskrift}\n${a.tekst.join("\n")}`)
  .join("\n\n");

describe("privatlivspolitikken oplyser det, art. 13 kræver", () => {
  it("navngiver alle databehandlere, koden faktisk sender data til", () => {
    for (const behandler of [
      "Supabase",
      "Netlify",
      "Trigger.dev",
      "Stripe",
      "Resend",
      "Google",
    ]) {
      expect(alleAfsnit, `${behandler} mangler i politikken`).toContain(behandler);
    }
  });

  it("oplyser dataansvarlig, kontakt og klageadgang", () => {
    expect(alleAfsnit).toContain("Dataansvarlig");
    expect(alleAfsnit).toContain("visual.studio.tuturials@gmail.com");
    expect(alleAfsnit).toContain("Datatilsynet");
  });

  it("oplyser retsgrundlag pr. formål (art. 6)", () => {
    expect(alleAfsnit).toContain("litra b");
    expect(alleAfsnit).toContain("litra c");
    expect(alleAfsnit).toContain("litra f");
  });

  it("oplyser opbevaringsfrister — både 24 timer og bogføringslovens 5 år", () => {
    expect(alleAfsnit).toContain("24 timer");
    expect(alleAfsnit).toContain("5 år");
  });

  it("oplyser overførsel til tredjelande og grundlaget", () => {
    expect(alleAfsnit).toMatch(/Data Privacy Framework|standardkontraktbestemmelser/);
  });

  it("lover ikke træning eller salg af brugerdata", () => {
    expect(alleAfsnit).toContain("aldrig til træning");
  });
});

describe("rettighederne, politikken lover, findes også i appen", () => {
  const kontoSide = readFileSync(
    join(process.cwd(), "app/(app)/konto/page.tsx"),
    "utf8",
  );

  it("indsigt og portabilitet (art. 15/20) er selvbetjening under Konto", () => {
    expect(kontoSide).toContain("/api/konto/eksport");
    expect(da.konto.data.hent.length).toBeGreaterThan(0);
  });

  it("sletning (art. 17) er selvbetjening samme sted", () => {
    expect(kontoSide).toContain("SletKonto");
    expect(da.konto.sletForklaring).toContain("24 timer");
  });

  it("udtrækket forklarer sig selv og nævner de 5 års bilag (art. 12)", () => {
    const forklaring = da.konto.data.omEksporten.join(" ");
    expect(forklaring).toContain("bogføringsloven");
    expect(forklaring).toContain("Billedlinkene");
  });

  it("svarfristen på en måned står i politikken", () => {
    expect(alleAfsnit).toContain("inden for en måned");
  });
});
