"use client";

import Link from "next/link";
import { useState } from "react";
import { da } from "@/lib/copy/da";
import {
  beregnPris,
  HOEST_PRESETS,
  KATEGORIER,
  MAERKE_TIERS,
  STANDE,
  type Kategori,
  type MaerkeTier,
  type Stand,
} from "@/lib/prisberegner";
// Et punkt fra markedshøsten (tidligere pris-tjek.tsx, som beregneren afløste)
export type PrisTjekPunkt = {
  soegetekst: string;
  antal: number;
  p25Dkk: number;
  medianDkk: number;
  p75Dkk: number;
};

// Prisberegneren (2. redesign 2026-08-20, ejer-ordre: de 10 faste søgninger
// var stadig ubrugelige — værktøjet skal svare på ENHVER vare). Tre valg →
// vejledende prisleje, kalibreret mod markedshøstens ægte medianer
// (lib/prisberegner.ts, kalibrerings-test i tests/unit/prisberegner.test.ts).
// Toplisterne er presets: tryk på en søgning → beregneren stilles ind, og
// beregnerens bud kan sammenlignes direkte med den ægte median.
function Chips<T extends string>({
  label,
  valg,
  valgt,
  onVaelg,
}: {
  label: string;
  valg: { id: T; navn: string; eksempler?: string }[];
  valgt: T;
  onVaelg: (id: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-4">
      <p className="text-detalje font-medium">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {valg.map((v) => {
          const aktiv = v.id === valgt;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={aktiv}
              onClick={() => onVaelg(v.id)}
              className={`min-h-touch rounded-bloed border px-3 py-1.5 text-detalje transition-colors duration-150 ease-out focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks ${
                aktiv
                  ? "border-gran bg-gran text-kalk"
                  : "border-kant bg-baggrund text-tekst/80 hover:border-koks/40"
              }`}
            >
              {v.navn}
              {v.eksempler ? (
                <span
                  className={`ml-1.5 hidden text-[0.85em] sm:inline ${aktiv ? "text-kalk/70" : "text-tekst/50"}`}
                >
                  {v.eksempler}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Markedstjek({
  punkter,
  bedste,
  hoestDato,
}: {
  punkter: PrisTjekPunkt[];
  bedste: PrisTjekPunkt[];
  hoestDato: string;
}) {
  const copy = da.eksperimenter;
  const [kategori, setKategori] = useState<Kategori>("striktroeje");
  const [tier, setTier] = useState<MaerkeTier>("mellem");
  const [stand, setStand] = useState<Stand>("god");
  const [presetSoegning, setPresetSoegning] = useState<string | null>(null);

  const estimat = beregnPris(kategori, tier, stand);
  const presetPunkt = presetSoegning
    ? punkter.find((p) => p.soegetekst === presetSoegning)
    : undefined;

  const brugPreset = (soegetekst: string) => {
    const preset = HOEST_PRESETS[soegetekst];
    if (!preset) return;
    setKategori(preset.kategori);
    setTier(preset.tier);
    setStand("god");
    setPresetSoegning(soegetekst);
  };

  const vaelgManuelt =
    <T,>(saet: (v: T) => void) =>
    (v: T) => {
      saet(v);
      setPresetSoegning(null);
    };

  const populaere = [...punkter].sort((a, b) => b.antal - a.antal).slice(0, 6);

  return (
    <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[1.2fr_1fr]">
      {/* Helten: prisberegneren */}
      <div className="rounded-bloed border border-kant bg-flade p-5 md:p-6">
        <p className="font-display text-titel font-bold">{copy.prisTjekTitel}</p>
        <p className="mt-1 text-detalje text-tekst/70">{copy.prisTjekLead}</p>

        <Chips
          label={copy.kategoriLabel}
          valg={KATEGORIER}
          valgt={kategori}
          onVaelg={vaelgManuelt(setKategori)}
        />
        <Chips
          label={copy.maerkeLabel}
          valg={MAERKE_TIERS}
          valgt={tier}
          onVaelg={vaelgManuelt(setTier)}
        />
        <Chips
          label={copy.standLabel}
          valg={STANDE}
          valgt={stand}
          onVaelg={vaelgManuelt(setStand)}
        />

        {/* key-skiftet genstarter pris-rul, så det nye leje ruller ind */}
        <div
          key={`${kategori}-${tier}-${stand}`}
          className="pris-rul mt-6"
          aria-live="polite"
        >
          <p className="font-mono text-hero font-bold leading-none">
            {copy.prisTjekInterval(estimat.fraDkk, estimat.tilDkk)}
          </p>
          <p className="mt-1 font-mono text-detalje text-tekst/70">
            {copy.prisTjekIntervalNote}
            {presetPunkt
              ? ` · ægte median for "${presetPunkt.soegetekst}": ${presetPunkt.medianDkk} kr.`
              : ""}
          </p>
          <ul className="mt-4 flex flex-col gap-1.5 text-detalje text-tekst/80">
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-tekst/40">
                —
              </span>
              {copy.hurtigtSalg(estimat.fraDkk)}
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-tekst/40">
                —
              </span>
              {copy.taalmodig(estimat.tilDkk)}
            </li>
          </ul>
        </div>
        <p className="mt-3 text-detalje text-tekst/60">
          {copy.beregnerKilde(hoestDato)}
        </p>

        <div className="mt-5 border-t border-kant pt-4">
          <p className="text-detalje text-tekst/70">{copy.ctaNote}</p>
          <Link
            href="/log-ind"
            className="soem-link mt-2 inline-flex min-h-touch items-center font-medium text-primaer"
          >
            {copy.cta} →
          </Link>
        </div>
      </div>

      {/* Toplister som presets ind i beregneren */}
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="font-display text-titel font-bold">
            {copy.populaertTitel}
          </h3>
          <p className="mt-1 text-detalje text-tekst/70">{copy.presetNote}</p>
          <ol className="mt-3">
            {populaere.map((punkt) => (
              <li key={punkt.soegetekst} className="border-t border-kant first:border-t-0">
                <button
                  type="button"
                  onClick={() => brugPreset(punkt.soegetekst)}
                  className="group flex min-h-touch w-full flex-wrap items-baseline justify-between gap-x-4 py-2.5 text-left focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
                >
                  <span className="font-brod font-medium group-hover:text-gran">
                    {punkt.soegetekst}
                  </span>
                  <span className="font-mono text-detalje text-tekst/70">
                    {copy.antalAnnoncer(punkt.antal)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {bedste.length > 0 ? (
          <div>
            <h3 className="font-display text-titel font-bold">
              {copy.bedsteFundTitel}
            </h3>
            <p className="mt-1 text-detalje text-tekst/70">{copy.bedsteFundLead}</p>
            <ol className="mt-3">
              {bedste.map((punkt) => (
                <li key={punkt.soegetekst} className="border-t border-kant first:border-t-0">
                  <button
                    type="button"
                    onClick={() => brugPreset(punkt.soegetekst)}
                    className="group flex min-h-touch w-full flex-wrap items-baseline justify-between gap-x-4 py-2.5 text-left focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
                  >
                    <span className="font-brod font-medium group-hover:text-gran">
                      {punkt.soegetekst}
                    </span>
                    <span className="font-mono text-detalje text-ravDyb">
                      {copy.median(punkt.medianDkk)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}
