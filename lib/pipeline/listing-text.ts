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

export function validerAnnonceTekst(
  tekst: AnnonceTekst,
  input: AnnonceTekstInput,
): string[] {
  const mangler: string[] = [];
  const titel = normalisér(tekst.titel);

  // D-1: søgbar titel — mærke + størrelse skal indgå
  if (!titel.includes(normalisér(input.maerke))) mangler.push("titel mangler mærke");
  if (!titel.includes(normalisér(input.stoerrelse)))
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
  let cost = 0;

  for (let forsoeg = 0; forsoeg < MAKS_FORSOEG; forsoeg++) {
    const tekst = await provider.genererAnnonceTekst(input);
    cost += tekst.costDkk;
    sidsteMangler = validerAnnonceTekst(tekst, input);
    if (sidsteMangler.length === 0) {
      return { ...tekst, costDkk: cost };
    }
  }

  throw new Error(
    `Annoncetekst bestod ikke valideringen efter ${MAKS_FORSOEG} forsøg: ${sidsteMangler.join(", ")}`,
  );
}
