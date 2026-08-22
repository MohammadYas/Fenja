import { describe, expect, it } from "vitest";
import { HJEM, vaelgHjem, vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason } from "@/lib/salg/saeson";

// Shorts-skabelonen (21/8 nat): shorts matchede bukser-skabelonen, hvis
// regler forbød shorts og bare ben — modellen forlængede dem til lange
// bukser. Nu har shorts sin egen skabelon, hvor længden er hovedreglen.
describe("shorts-skabelonen", () => {
  it("wizard-kategorien Shorts rammer sin egen skabelon, ikke bukser", () => {
    expect(vaelgSkabelon("Shorts").id).toBe("shorts");
    expect(vaelgSkabelon("bermuda shorts").id).toBe("shorts");
    expect(vaelgSkabelon("Bukser").id).toBe("bukser");
    expect(vaelgSkabelon("Jeans").id).toBe("bukser");
  });

  it("reglen kræver den korte længde og forbyder forlængelse", () => {
    const skabelon = vaelgSkabelon("Shorts");
    expect(skabelon.regel).toMatch(/NEVER extend/i);
    expect(skabelon.fokus).toMatch(/EXACT length/i);
  });

  it("shorts er i sæson om sommeren, ikke om vinteren", () => {
    expect(erHoesason("shorts", 6)).toBe(true);
    expect(erHoesason("shorts", 12)).toBe(false);
  });
});

// Ejer-bekymring 21/8 nat: "Selja vælger"-hjemmet SKAL sprede brugerne, så
// alle ikke ender med samme baggrund på deres annoncer.
describe("hjem-fordelingen spreder brugerne", () => {
  it("1000 brugere spreder sig bredt over hjemmene — ingen dominans", () => {
    // Ejer-spørgsmål 22/8: "kan 1000 have forskellige baggrunde?" Med 105 hjem
    // er svaret ja i praksis: ingen enkelt baggrund må dominere.
    const taelling = new Map<string, number>();
    for (let i = 0; i < 1000; i++) {
      const userId = `bruger-${i}-${(i * 2654435761).toString(16)}`;
      const hjem = vaelgHjem(userId);
      taelling.set(hjem.id, (taelling.get(hjem.id) ?? 0) + 1);
    }
    // Mindst halvdelen af alle hjem er i brug…
    expect(taelling.size).toBeGreaterThanOrEqual(Math.floor(HJEM.length / 2));
    // …og intet hjem tager mere end 5 % af brugerne
    for (const [, antal] of taelling) {
      expect(antal).toBeLessThan(50);
    }
  });

  it("samme bruger får ALTID samme hjem (deterministisk)", () => {
    for (const id of ["a", "b-123", "0b4af5f0-ff6e-4531-8142-6fc16609587b"]) {
      expect(vaelgHjem(id).id).toBe(vaelgHjem(id).id);
    }
  });
});
