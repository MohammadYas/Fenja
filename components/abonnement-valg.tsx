"use client";

import { useState } from "react";
import Link from "next/link";
import { abonnementer } from "@/lib/config";
import { da } from "@/lib/copy/da";

type Periode = "md" | "aar";

// Abonnementsvælgeren (S36, ejer-ordre 2026-08-16: abonnement er standard-
// vejen). Én komponent til begge flader: på /priser (tone "gran", uden køb —
// CTA sender til log-ind) og på kreditsiden (tone "lys", køb via Stripe
// Checkout). Md./år-skiftet er den ene autoriserede mikro-animation: tommelen
// glider (150 ms ease-out), og prisen ruller ind (pris-rul i globals.css) —
// begge dele bag prefers-reduced-motion.
export function AbonnementValg({
  koebAktiv,
  tone = "lys",
  className = "",
}: {
  /** true på kreditsiden (logget ind): køb via Stripe Checkout */
  koebAktiv: boolean;
  tone?: "gran" | "lys";
  className?: string;
}) {
  const [periode, setPeriode] = useState<Periode>("md");
  const [travlTier, setTravlTier] = useState<string | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const copy = da.priserSide.abonnement;
  const moerk = tone === "gran";

  async function koeb(tierId: string) {
    setFejl(null);
    setTravlTier(tierId);
    try {
      const svar = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonnement: tierId, periode }),
      });
      const data = (await svar.json()) as { url?: string; fejl?: string };
      if (!svar.ok || !data.url) {
        setFejl(data.fejl ?? da.fejl.generel);
        setTravlTier(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setFejl(da.fejl.generel);
      setTravlTier(null);
    }
  }

  // Tonebestemte klasser — gran-blokken bruger kalk-tekst og kalk-hairlines
  const raekkeKant = moerk ? "border-kalk/20" : "border-kant";
  const daempet = moerk ? "text-kalk/70" : "text-tekst/70";
  const fremhaevet = moerk ? "text-hoer" : "text-gran";

  return (
    <div className={className}>
      {/* Md./år-skifte: glidende tommel — begge tilstande er altid læsbare */}
      <div
        role="radiogroup"
        aria-label={copy.vaelgPeriode}
        className={`relative inline-grid grid-cols-2 rounded-bloed border p-1 ${moerk ? "border-kalk/30" : "border-kant"}`}
      >
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-bloed transition-transform motion-reduce:transition-none ${moerk ? "bg-kalk" : "bg-koks"} ${periode === "aar" ? "translate-x-full" : ""}`}
        />
        {(
          [
            ["md", copy.periodeMd],
            ["aar", copy.periodeAar],
          ] as const
        ).map(([vaerdi, tekst]) => (
          <button
            key={vaerdi}
            type="button"
            role="radio"
            aria-checked={periode === vaerdi}
            onClick={() => setPeriode(vaerdi)}
            className={`relative z-10 min-h-touch rounded-bloed px-5 font-mono text-detalje font-medium transition-colors ${
              periode === vaerdi
                ? moerk
                  ? "text-koks"
                  : "text-kalk"
                : `${daempet} ${moerk ? "hover:text-kalk" : "hover:text-koks"}`
            }`}
          >
            {tekst}
          </button>
        ))}
      </div>

      {/* Tiers som redaktionelle prisrækker — samme motiv som resten af v6 */}
      <div className={`mt-6 max-w-2xl border-t ${raekkeKant}`}>
        {abonnementer.tiers.map((tier) => {
          const navn = copy.navne[tier.id] ?? tier.id;
          const funktioner = copy.funktioner[tier.id] ?? [];
          const pris = periode === "aar" ? tier.prisDkkPrAar : tier.prisDkkPrMd;
          // Stykprisen SKAL følge den valgte periode. Den regnede altid på
          // månedsprisen, så årsplanen viste den dyrere månedspris og skjulte
          // hele rabatten — netop det argument, årsplanen sælger på.
          const prisPrAnnonce = (
            periode === "aar"
              ? tier.prisDkkPrAar / (tier.annoncerPrMd * 12)
              : tier.prisDkkPrMd / tier.annoncerPrMd
          )
            .toFixed(2)
            .replace(".", ",");
          return (
            // Fast to-kolonne-gitter i stedet for flex-wrap: prisen er
            // bredere som årspris ("1190 kr."), og wrappet fik hele
            // pris-kolonnen til at falde ned under navnet, så rækken skiftede
            // udseende alt efter periode. Gitteret ligger fast.
            <div
              key={tier.id}
              className={`grid grid-cols-1 items-baseline gap-x-6 gap-y-4 border-b py-6 sm:grid-cols-[minmax(0,1fr)_auto] ${raekkeKant}`}
            >
              <div className="max-w-xs">
                <p className="font-display text-titel font-semibold">
                  {navn}
                </p>
                <p className={`mt-1 font-mono text-detalje ${daempet}`}>
                  {copy.annoncerPrMd(tier.annoncerPrMd)}
                </p>
                {tier.id === "pro" ? (
                  <p className={`mt-1 font-mono text-detalje ${fremhaevet}`}>
                    {copy.lavestePris}
                  </p>
                ) : null}
              </div>
              <div className="text-left sm:text-right">
                <p className="overflow-hidden font-mono text-hero font-bold leading-none">
                  {/* key-skiftet genstarter pris-rul, så tallet ruller ind */}
                  <span key={periode} className="pris-rul inline-block">
                    {pris} kr.
                  </span>
                </p>
                <p className={`mt-1 font-mono text-detalje ${daempet}`}>
                  {periode === "aar" ? copy.periodeAarNote : copy.prMd}
                </p>
                <p className={`mt-1 font-mono text-detalje ${daempet}`}>
                  {da.kreditter.prisPrStk(prisPrAnnonce)}
                </p>
                <div className="mt-3">
                  {koebAktiv ? (
                    <button
                      type="button"
                      onClick={() => koeb(tier.id)}
                      disabled={travlTier !== null}
                      aria-busy={travlTier === tier.id || undefined}
                      className={`inline-flex min-h-touch cursor-pointer items-center justify-center rounded-bloed px-5 font-brod text-basis font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                        moerk
                          ? "bg-kalk text-koks hover:bg-hoer"
                          : "bg-primaer text-primaer-tekst hover:bg-koks"
                      }`}
                    >
                      {copy.koebKnap(navn)}
                    </button>
                  ) : (
                    <Link
                      href="/log-ind?videre=/kreditter"
                      className={`inline-flex min-h-touch items-center justify-center rounded-bloed px-5 font-brod text-basis font-medium transition active:scale-[0.98] ${
                        moerk
                          ? "bg-kalk text-koks hover:bg-hoer"
                          : "bg-primaer text-primaer-tekst hover:bg-koks"
                      }`}
                    >
                      {copy.koebKnap(navn)}
                    </Link>
                  )}
                </div>
              </div>
              {/* Funktioner pr. tier — konkrete, ingen marketing-luft */}
              <ul className={`text-detalje sm:col-span-2 ${daempet}`}>
                {funktioner.map((punkt) => (
                  <li key={punkt} className="mt-1">
                    {punkt}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className={`mt-4 text-detalje ${daempet}`}>
        {copy.faellesTitel}: {copy.faelles.join(" · ")}
      </p>
      <p className={`mt-1 text-detalje ${daempet}`}>{copy.opsigelse}</p>
      {fejl ? (
        <p role="alert" className="mt-3 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
    </div>
  );
}
