"use client";

// Admin: vælg billedmodel pr. formål (ejer-ordre 23/8). Kataloget kommer fra
// serveren, så listen altid er den samme som pipelinen kan køre. Prisen og
// vandmærket står ved hver model — valget skal kunne træffes uden at slå op
// i dokumentationen.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BilledModel } from "@/lib/config";
import { da } from "@/lib/copy/da";

type Formaal = "preview" | "final";

export function BilledModelValg({
  modeller,
  valg,
}: {
  modeller: readonly BilledModel[];
  valg: Record<Formaal, string>;
}) {
  const [nu, setNu] = useState(valg);
  const [travl, setTravl] = useState(false);
  const [kvittering, setKvittering] = useState<string | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const copy = da.admin.billedmodel;

  const navn = (id: string): string =>
    modeller.find((m) => m.id === id)?.navn ?? id;

  async function gem() {
    setFejl(null);
    setKvittering(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/admin/billedmodel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nu),
      });
      const data = (await svar.json()) as { fejl?: string };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setKvittering(copy.ok(navn(nu.preview), navn(nu.final)));
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-6">
      <p className="max-w-laesbar text-detalje text-tekst/70">{copy.forklaring}</p>

      {(
        [
          ["preview", copy.rens],
          ["final", copy.visualisering],
        ] as const
      ).map(([formaal, titel]) => (
        <fieldset key={formaal} className="flex flex-col gap-2">
          <legend className="font-medium">{titel}</legend>
          {modeller.map((model) => (
            <label
              key={model.id}
              className={`flex min-h-touch cursor-pointer gap-3 rounded-bloed border p-3 ${
                nu[formaal] === model.id
                  ? "border-gran bg-flade"
                  : "border-kant hover:border-koks"
              }`}
            >
              <input
                type="radio"
                name={`billedmodel-${formaal}`}
                value={model.id}
                checked={nu[formaal] === model.id}
                onChange={() => setNu({ ...nu, [formaal]: model.id })}
                className="mt-1"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{model.navn}</span>
                <span className="font-mono text-detalje text-tekst/70">
                  {copy.pris(model.costDkk)}
                </span>
                <span className="text-detalje text-tekst/70">{model.note}</span>
                <span className="text-detalje text-tekst/70">
                  {copy.vandmaerke(model.vandmaerke)}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      ))}

      <p className="max-w-laesbar text-detalje text-tekst/70">{copy.note}</p>

      {fejl ? (
        <p role="alert" className="text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      {kvittering ? (
        <p role="status" className="text-detalje text-gran">
          {kvittering}
        </p>
      ) : null}

      <div>
        <Button type="button" travl={travl} onClick={gem}>
          {travl ? copy.gemmer : copy.knap}
        </Button>
      </div>
    </div>
  );
}
