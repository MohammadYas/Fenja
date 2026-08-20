"use client";

import Link from "next/link";
import { useState } from "react";
import { KopierKnap } from "@/components/kopier-knap";
import { da } from "@/lib/copy/da";
import {
  beregnPris,
  bygTitel,
  HOEST_PRESETS,
  KATEGORIER,
  MAERKE_TIERS,
  prisZone,
  SALGSTIPS,
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
  const [egenPris, setEgenPris] = useState<number | null>(null);
  const [maerke, setMaerke] = useState("");
  const [farve, setFarve] = useState("");
  const [stoerrelse, setStoerrelse] = useState("");
  const [tjek, setTjek] = useState<string[]>([]);

  const estimat = beregnPris(kategori, tier, stand);
  const sliderMin = Math.max(5, Math.round((estimat.fraDkk * 0.5) / 5) * 5);
  const sliderMax = Math.round((estimat.tilDkk * 1.6) / 5) * 5;
  const valgtPris = Math.min(
    sliderMax,
    Math.max(sliderMin, egenPris ?? estimat.medianDkk),
  );
  const zone = prisZone(valgtPris, estimat);
  const titel = maerke.trim()
    ? bygTitel({ kategori, maerke, farve, stoerrelse })
    : null;
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
    setEgenPris(null);
  };

  const vaelgManuelt =
    <T,>(saet: (v: T) => void) =>
    (v: T) => {
      saet(v);
      setPresetSoegning(null);
      setEgenPris(null);
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

        {/* Pris-slider: prøv din egen pris mod lejet */}
        <div className="mt-5 border-t border-kant pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <label htmlFor="egen-pris" className="text-detalje font-medium">
              {copy.sliderLabel}
            </label>
            <span className="font-mono text-lead font-bold">
              {copy.sliderVaerdi(valgtPris)}
            </span>
          </div>
          <input
            id="egen-pris"
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={5}
            value={valgtPris}
            onChange={(e) => setEgenPris(Number(e.target.value))}
            className="mt-2 w-full accent-gran"
          />
          <p aria-live="polite" className="mt-1 text-detalje text-tekst/80">
            {copy.zoner[zone]}
          </p>
        </div>

        {/* Titel-generator: gratis smagsprøve på søgbar titel */}
        <div className="mt-5 border-t border-kant pt-4">
          <p className="text-detalje font-medium">{copy.titelTitel}</p>
          <p className="mt-1 text-detalje text-tekst/70">{copy.titelLead}</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="sr-only">{copy.titelMaerke}</span>
              <input
                type="text"
                value={maerke}
                onChange={(e) => setMaerke(e.target.value)}
                placeholder={copy.titelMaerkePladsholder}
                className="w-full rounded-bloed border border-kant bg-baggrund px-3 py-2 text-detalje focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
              />
            </label>
            <label className="block">
              <span className="sr-only">{copy.titelFarve}</span>
              <input
                type="text"
                value={farve}
                onChange={(e) => setFarve(e.target.value)}
                placeholder={copy.titelFarvePladsholder}
                className="w-full rounded-bloed border border-kant bg-baggrund px-3 py-2 text-detalje focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
              />
            </label>
            <label className="block">
              <span className="sr-only">{copy.titelStoerrelse}</span>
              <input
                type="text"
                value={stoerrelse}
                onChange={(e) => setStoerrelse(e.target.value)}
                placeholder={copy.titelStoerrelsePladsholder}
                className="w-full rounded-bloed border border-kant bg-baggrund px-3 py-2 text-detalje focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
              />
            </label>
          </div>
          {titel ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-mono text-basis font-medium">{titel}</p>
              <KopierKnap tekst={titel} label={copy.titelKopier} />
            </div>
          ) : null}
        </div>

        {/* Salgsplan: startpris + nedsættelses-tidslinje + gebyr-fakta */}
        <div className="mt-5 border-t border-kant pt-4">
          <p className="text-detalje font-medium">{copy.planTitel}</p>
          <ol className="mt-2 flex flex-col gap-1.5 text-detalje text-tekst/80">
            {[
              copy.planStart(estimat.tilDkk),
              copy.planUge2(estimat.medianDkk),
              copy.planUge3(estimat.fraDkk),
            ].map((linje, i) => (
              <li key={linje} className="flex gap-2">
                <span aria-hidden="true" className="select-none font-mono text-tekst/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {linje}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-detalje text-tekst/60">{copy.planGebyr}</p>
        </div>

        {/* Kategori-tips */}
        <div className="mt-5 border-t border-kant pt-4">
          <p className="text-detalje font-medium">{copy.tipsTitel}</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-detalje text-tekst/80">
            {SALGSTIPS[kategori].map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden="true" className="text-tekst/40">
                  —
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Foto-tjekliste — spejler appens fire foto-roller */}
        <div className="mt-5 border-t border-kant pt-4">
          <p className="text-detalje font-medium">{copy.tjekTitel}</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {copy.tjekPunkter.map((punkt) => (
              <li key={punkt}>
                <label className="flex min-h-touch cursor-pointer items-center gap-2 text-detalje text-tekst/80">
                  <input
                    type="checkbox"
                    checked={tjek.includes(punkt)}
                    onChange={() =>
                      setTjek((f) =>
                        f.includes(punkt)
                          ? f.filter((p) => p !== punkt)
                          : [...f, punkt],
                      )
                    }
                    className="h-4 w-4 accent-gran"
                  />
                  {punkt}
                </label>
              </li>
            ))}
          </ul>
          {tjek.length === copy.tjekPunkter.length ? (
            <p className="pris-rul mt-2 text-detalje font-medium text-gran">
              {copy.tjekKlar}
            </p>
          ) : null}
        </div>

        {/* Slut-henvisning til Selja (ejer-ordre: værktøjet ender i Selja).
            CTA-teksten bruger brugerens egen vare og tal (plan pkt. 7). */}
        <div className="mt-5 rounded-bloed bg-koks p-4 text-kalk">
          <p className="font-display text-titel font-bold">{copy.seljaTitel}</p>
          <p className="mt-1 text-detalje text-kalk/85">{copy.seljaTekst}</p>
          <Link href="/log-ind" className="knap-link mt-3">
            {copy.seljaDynamisk(
              KATEGORIER.find((k) => k.id === kategori)?.navn ?? "vare",
              estimat.medianDkk,
            )}
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
