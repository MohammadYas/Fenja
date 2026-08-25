// Det anonyme resultat-udsnit — rene funktioner (testbare uden I/O).
//
// VIGTIGT (ejer-krav 2 i det funktionelle flow): de sidste 40 % af
// beskrivelsen forlader ALDRIG serveren. En CSS-blur over den fulde tekst kan
// læses direkte i DOM'en — derfor klippes teksten her, og klienten viser kun
// en visuel sløring oven på pladsholder-linjer.

export const SYNLIG_ANDEL = 0.6;

export type DelvisBeskrivelse = {
  /** De første ~60 % — klippet ved et ordskel, så snittet ikke ser ødelagt ud */
  synlig: string;
  /** Antal skjulte tegn — styrer hvor mange pladsholder-linjer klienten tegner */
  skjulteTegn: number;
};

export function delvisBeskrivelse(
  beskrivelse: string,
  andel: number = SYNLIG_ANDEL,
): DelvisBeskrivelse {
  const tekst = beskrivelse.trim();
  const graense = Math.floor(tekst.length * andel);
  if (graense >= tekst.length) return { synlig: tekst, skjulteTegn: 0 };
  // Klip ved sidste ordskel før grænsen — aldrig midt i et ord
  const ordskel = tekst.lastIndexOf(" ", graense);
  const snit = ordskel > graense / 2 ? ordskel : graense;
  return {
    synlig: tekst.slice(0, snit).trimEnd(),
    skjulteTegn: tekst.length - snit,
  };
}

/** Søgeord: de første par stykker vises, resten tælles kun */
export function delvisSoegeord(
  soegeord: string[],
  maksSynlige = 3,
): { synlige: string[]; skjulte: number } {
  // Tomme ord filtreres — modellen kan levere huller, og de skal aldrig vises
  const rene = soegeord.map((o) => o.trim()).filter(Boolean);
  return {
    synlige: rene.slice(0, maksSynlige),
    skjulte: Math.max(0, rene.length - maksSynlige),
  };
}
