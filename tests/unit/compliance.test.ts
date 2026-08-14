import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";

// Compliance-rækkefølgen (FR-6/K2) er et produktkrav håndhævet i kode:
// ægte fotos FØR visualisering FØR tekst FØR checkliste. Testen læser
// resultatsidens kilde, så en omrokering fejler CI.

describe("resultatsiden overholder compliance-rækkefølgen", () => {
  const kilde = readFileSync(
    join(process.cwd(), "app/(app)/items/[id]/page.tsx"),
    "utf8",
  );

  it("sektionerne står i lovpligtig rækkefølge", () => {
    const aegte = kilde.indexOf("aegteFotosTitel");
    const visualisering = kilde.indexOf("visualiseringTitel");
    const tekst = kilde.indexOf("tekstTitel");
    const checkliste = kilde.indexOf("checklisteTitel");

    expect(aegte).toBeGreaterThan(-1);
    expect(visualisering).toBeGreaterThan(aegte);
    expect(tekst).toBeGreaterThan(visualisering);
    expect(checkliste).toBeGreaterThan(tekst);
  });

  it("visualiseringen vises altid med badge", () => {
    expect(kilde).toContain('variant="visualisering"');
    expect(kilde).toContain("visualiseringBadge");
  });

  it("billede 1-instruksen og Vinted-disclaimeren findes i copy", () => {
    expect(da.resultat.aegteFotosInstruks).toContain("billede 1");
    expect(da.resultat.vintedDisclaimer).toContain("Vinteds regler");
  });
});
