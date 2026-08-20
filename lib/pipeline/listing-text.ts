// Annoncetekst (D-1..D-4) med kodet validering — ikke kun prompt:
// fejl fra fejl-feltet SKAL fremgå af beskrivelsen (D-2), og titlen skal
// være søgbar (mærke + størrelse). Fejler valideringen: én retry, derefter hård fejl.

import type { AnnonceTekst, AnnonceTekstInput, TextProvider } from "@/lib/providers/text";

const MAKS_FORSOEG = 2;

function normalisér(tekst: string): string {
  return tekst.toLowerCase().replace(/\s+/g, " ").trim();
}

/** D-2: mindst halvdelen af fejl-beskrivelsens betydningsbærende ord skal optræde */
export function fejlErNaevnt(beskrivelse: string, fejlBeskrivelse: string): boolean {
  const b = normalisér(beskrivelse);
  const ord = normalisér(fejlBeskrivelse)
    .split(" ")
    .filter((o) => o.length > 3);
  if (ord.length === 0) return b.includes(normalisér(fejlBeskrivelse));
  const fundet = ord.filter((o) => b.includes(o));
  return fundet.length >= Math.ceil(ord.length / 2);
}

/**
 * D-1: størrelsen tæller som nævnt, når ÉN af Vinted-formatets komponenter
 * står i titlen som helt ord — "M / 38 / 10" matcher "str. M" eller "38",
 * "EU 48 | W32" matcher "W32". (Fundet 20/8: kravet om hele strengen ordret
 * væltede ALLE rigtige tekst-kørsler med de nye Vinted-størrelser.)
 * "Én størrelse" behøver ikke stå i titlen.
 */
export function stoerrelseErNaevnt(titel: string, stoerrelse: string): boolean {
  const s = normalisér(stoerrelse);
  if (!s || s === "én størrelse" || s === "en størrelse") return true;
  const t = normalisér(titel);
  if (t.includes(s)) return true;
  return s
    .split(/[/|]/)
    .map((del) => del.trim())
    .filter(Boolean)
    .some((del) => {
      const escaped = del.replace(/[.*+?^${}()[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-zæøå0-9])${escaped}($|[^a-zæøå0-9])`).test(t);
    });
}

export function validerAnnonceTekst(
  tekst: AnnonceTekst,
  input: AnnonceTekstInput,
): string[] {
  const mangler: string[] = [];
  const titel = normalisér(tekst.titel);

  // D-1: søgbar titel — mærke + størrelse skal indgå
  if (!titel.includes(normalisér(input.maerke))) mangler.push("titel mangler mærke");
  if (!stoerrelseErNaevnt(tekst.titel, input.stoerrelse))
    mangler.push("titel mangler størrelse");

  // D-2: oplyste fejl skal fremgå af beskrivelsen — håndhævet, ikke valgfrit
  if (input.fejlBeskrivelse && !fejlErNaevnt(tekst.beskrivelse, input.fejlBeskrivelse)) {
    mangler.push("beskrivelsen nævner ikke de oplyste fejl");
  }

  // D-4: prisforslag skal være et fornuftigt interval med begrundelse
  if (
    !(tekst.prisforslagDkk.fra > 0) ||
    tekst.prisforslagDkk.til < tekst.prisforslagDkk.fra
  ) {
    mangler.push("ugyldigt prisinterval");
  }
  if (!tekst.prisBegrundelse.trim()) mangler.push("prisbegrundelse mangler");

  return mangler;
}

export async function genererValideretAnnonceTekst(
  provider: TextProvider,
  input: AnnonceTekstInput,
): Promise<AnnonceTekst> {
  let sidsteMangler: string[] = [];
  let sidsteTekst: AnnonceTekst | null = null;
  let cost = 0;

  for (let forsoeg = 0; forsoeg < MAKS_FORSOEG; forsoeg++) {
    const tekst = await provider.genererAnnonceTekst(input);
    cost += tekst.costDkk;
    sidsteTekst = tekst;
    sidsteMangler = validerAnnonceTekst(tekst, input);
    if (sidsteMangler.length === 0) {
      return { ...tekst, costDkk: cost };
    }
  }

  // Robusthed (20/8): mangler KUN titel-elementer, repareres titlen mekanisk
  // i stedet for at vælte hele leverancen — D-1 opfyldes bogstaveligt, og
  // brugeren mister aldrig billeder + beskrivelse på en titel-detalje.
  if (
    sidsteTekst &&
    sidsteMangler.every((m) => m.startsWith("titel mangler"))
  ) {
    const dele = [sidsteTekst.titel.trim()];
    if (sidsteMangler.includes("titel mangler mærke")) dele.unshift(input.maerke);
    if (sidsteMangler.includes("titel mangler størrelse"))
      dele.push(`str. ${input.stoerrelse}`);
    return { ...sidsteTekst, titel: dele.join(" · "), costDkk: cost };
  }

  throw new Error(
    `Annoncetekst bestod ikke valideringen efter ${MAKS_FORSOEG} forsøg: ${sidsteMangler.join(", ")}`,
  );
}
