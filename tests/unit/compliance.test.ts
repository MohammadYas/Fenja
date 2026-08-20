import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";

// Resultatsidens rækkefølge (ejer-ordre 2026-08-20): de rensede fotos vises
// IKKE længere (de er kun input til modellen) — rækkefølgen er nu:
// visualisering FØR tekst FØR checkliste. Testen læser resultatsidens kilde,
// så en omrokering fejler CI.

describe("resultatsiden overholder ejerens rækkefølge", () => {
  const kilde = readFileSync(
    join(process.cwd(), "app/(app)/items/[id]/page.tsx"),
    "utf8",
  );

  it("rense-sektionen er væk og visualisering står først", () => {
    const visualisering = kilde.indexOf("visualiseringTitel");
    const tekst = kilde.indexOf("tekstTitel");
    const checkliste = kilde.indexOf("checklisteTitel");

    expect(kilde).not.toContain("aegteFotosTitel");
    expect(kilde).not.toContain("item_photos");
    expect(visualisering).toBeGreaterThan(-1);
    expect(tekst).toBeGreaterThan(visualisering);
    expect(checkliste).toBeGreaterThan(tekst);
  });

  it("visualiseringen vises altid med badge", () => {
    expect(kilde).toContain('variant="visualisering"');
    expect(kilde).toContain("visualiseringBadge");
  });

  it("billede 1-instruksen og Vinted-disclaimeren findes i copy", () => {
    expect(da.resultat.checkliste.join(" ")).toContain("billede 1");
    expect(da.resultat.vintedDisclaimer).toContain("Vinteds regler");
  });
});
