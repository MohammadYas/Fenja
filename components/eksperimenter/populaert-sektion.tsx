import { Reveal } from "@/components/reveal";
import { Stempel } from "@/components/ui/stempel";
import { da } from "@/lib/copy/da";
import {
  eksperimentAktiv,
  hentBedsteFund,
  hentPopulaere,
  nyesteHoestDato,
} from "@/lib/eksperimenter";
import { PrisTjek } from "./pris-tjek";

const formaterDato = (iso: string): string =>
  new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Eksperiment-sektionen på forsiden (populaertLigeNu): ærlige markedstal som
// redaktionelle rækker + valgfri "bedste fund"-liste og pristjekker. Hele
// sektionen og hver delfeature kan slås fra centralt i lib/eksperimenter.ts.
export function PopulaertSektion() {
  if (!eksperimentAktiv("populaertLigeNu")) return null;
  const hoestDato = nyesteHoestDato();
  if (!hoestDato) return null;

  const copy = da.eksperimenter;
  const populaere = hentPopulaere(6);
  const bedste = eksperimentAktiv("bedsteFund") ? hentBedsteFund(5) : [];
  const visPrisTjek = eksperimentAktiv("prisTjek");
  const dato = formaterDato(hoestDato);

  return (
    <section className="border-b border-kant" aria-labelledby="populaert-titel">
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

        <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <ol>
              {populaere.map((punkt, i) => (
                <li
                  key={punkt.soegetekst}
                  className="border-t border-kant py-4 first:border-t-0 first:pt-0"
                >
                  <Reveal forsinkelseTrin={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <p className="font-display text-lead font-semibold">
                        {punkt.soegetekst}
                      </p>
                      <p className="font-mono text-detalje text-tekst/70">
                        {copy.antalAnnoncer(punkt.antal)} ·{" "}
                        {copy.median(punkt.medianDkk)}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>

            {bedste.length > 0 ? (
              <div className="mt-10">
                <Reveal>
                  <h3 className="font-display text-titel font-bold">
                    {copy.bedsteFundTitel}
                  </h3>
                  <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
                    {copy.bedsteFundLead}
                  </p>
                </Reveal>
                <ol className="mt-4">
                  {bedste.map((punkt, i) => (
                    <li
                      key={punkt.soegetekst}
                      className="border-t border-kant py-3 first:border-t-0 first:pt-0"
                    >
                      <Reveal forsinkelseTrin={i}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <p className="font-brod font-medium">{punkt.soegetekst}</p>
                          <p className="font-mono text-detalje text-ravDyb">
                            {copy.median(punkt.medianDkk)}
                          </p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          {visPrisTjek ? (
            <Reveal forsinkelseTrin={2}>
              <PrisTjek
                punkter={hentPopulaere(MAKS_PRIS_TJEK).map((m) => ({
                  soegetekst: m.soegetekst,
                  antal: m.antal,
                  p25Dkk: m.p25Dkk,
                  medianDkk: m.medianDkk,
                  p75Dkk: m.p75Dkk,
                }))}
                hoestDato={dato}
              />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// Pristjekkeren får hele høsten (den er lille og committet) — sorteret efter
// aktivitet, så de mest relevante søgninger står øverst i vælgeren.
const MAKS_PRIS_TJEK = 100;
