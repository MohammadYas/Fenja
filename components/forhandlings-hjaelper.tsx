"use client";

// Forhandlings-hjælper (abonnent-fordel, 21/8 nat): skriv køberens bud, få
// tre klar-til-at-sende svar — accept, modbud og venlig afvisning — med
// kopiér-knap på hvert. Bor på item-siden for abonnenter.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

type Svar = { slags: string; tekst: string; prisDkk?: number };

export function ForhandlingsHjaelper({ itemId }: { itemId: string }) {
  const [bud, setBud] = useState("");
  const [vurdering, setVurdering] = useState<string | null>(null);
  const [svar, setSvar] = useState<Svar[]>([]);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [kopieret, setKopieret] = useState<number | null>(null);
  const copy = da.forhandling;

  async function hent(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setTravl(true);
    try {
      const res = await fetch(`/api/items/${itemId}/forhandling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budDkk: Number(bud) }),
      });
      const data = (await res.json()) as {
        vurdering?: string;
        svar?: Svar[];
        fejl?: string;
      };
      if (!res.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setVurdering(data.vurdering ?? null);
      setSvar(data.svar ?? []);
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  async function kopier(tekst: string, i: number) {
    try {
      await navigator.clipboard.writeText(tekst);
      setKopieret(i);
      setTimeout(() => setKopieret(null), 2000);
    } catch {
      // clipboard blokeret — brugeren kan markere selv
    }
  }

  return (
    <div>
      <form onSubmit={hent} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-medium">{copy.budLabel}</span>
          <input
            type="number"
            required
            min={1}
            max={100000}
            inputMode="numeric"
            value={bud}
            onChange={(e) => setBud(e.target.value)}
            className="w-36 rounded-bloed border border-kant bg-baggrund px-3 py-2 font-mono text-basis focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
          />
        </label>
        <Button type="submit" travl={travl}>
          {copy.knap}
        </Button>
      </form>
      {fejl ? (
        <p role="alert" className="mt-2 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      {vurdering ? (
        <p className="mt-4 max-w-laesbar text-detalje text-tekst/80">{vurdering}</p>
      ) : null}
      {svar.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-3">
          {svar.map((s, i) => (
            <li key={i} className="rounded-bloed border border-kant bg-flade p-3">
              <p className="font-mono text-detalje font-bold uppercase tracking-wide text-gran">
                {copy.slags[s.slags] ?? s.slags}
                {s.prisDkk != null ? ` · ${s.prisDkk} kr.` : ""}
              </p>
              <p className="mt-1 max-w-laesbar">{s.tekst}</p>
              <button
                type="button"
                onClick={() => void kopier(s.tekst, i)}
                className="mt-2 inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-3 text-detalje font-medium transition hover:bg-koks hover:text-kalk"
              >
                {kopieret === i ? copy.kopieret : copy.kopierKnap}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
