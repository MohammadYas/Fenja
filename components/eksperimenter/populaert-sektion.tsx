import { Reveal } from "@/components/reveal";
import { Stempel } from "@/components/ui/stempel";
import { da } from "@/lib/copy/da";
import {
  eksperimentAktiv,
  hentBedsteFund,
  hentPopulaere,
  nyesteHoestDato,
} from "@/lib/eksperimenter";
import { Markedstjek } from "./markedstjek";

const formaterDato = (iso: string): string =>
  new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Eksperiment-sektionen på forsiden (populaertLigeNu) — REDESIGNET 2026-08-20
// (ejer-ordre: skal være et brugbart gratis værktøj, ikke døde lister).
// Pristjekkeren er helten; toplisterne er klikbare genveje ind i den. Alt er
// ærlige høstdata med synlig dato. Hele sektionen kan stadig slås fra
// centralt i lib/eksperimenter.ts.
export function PopulaertSektion() {
  if (!eksperimentAktiv("populaertLigeNu")) return null;
  const hoestDato = nyesteHoestDato();
  if (!hoestDato) return null;

  const copy = da.eksperimenter;
  const bedste = eksperimentAktiv("bedsteFund") ? hentBedsteFund(5) : [];
  const dato = formaterDato(hoestDato);
  const punkter = hentPopulaere(MAKS_PRIS_TJEK).map((m) => ({
    soegetekst: m.soegetekst,
    antal: m.antal,
    p25Dkk: m.p25Dkk,
    medianDkk: m.medianDkk,
    p75Dkk: m.p75Dkk,
  }));

  return (
    <section
      id="pristjek"
      className="border-b border-kant"
      aria-labelledby="populaert-titel"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <Reveal>
          <p>
            <Stempel>{copy.stempel}</Stempel>
          </p>
          <h2
            id="populaert-titel"
            className="mt-3 font-display text-display font-bold"
          >
            {copy.titel}
          </h2>
          <p className="mt-3 max-w-laesbar text-tekst/80">{copy.lead(dato)}</p>
        </Reveal>
        <Markedstjek
          punkter={punkter}
          bedste={bedste.map((m) => ({
            soegetekst: m.soegetekst,
            antal: m.antal,
            p25Dkk: m.p25Dkk,
            medianDkk: m.medianDkk,
            p75Dkk: m.p75Dkk,
          }))}
          hoestDato={dato}
        />
      </div>
    </section>
  );
}

// Pristjekkeren får hele høsten (den er lille og committet) — sorteret efter
// aktivitet, så de mest relevante søgninger står øverst blandt chipsene.
const MAKS_PRIS_TJEK = 100;
