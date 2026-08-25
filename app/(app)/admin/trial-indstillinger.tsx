"use client";

// Admin: trial-driften (ejer-ordre 25/8) — toggle "Gratis trial aktiv" og
// dagligt budgetloft. Gemmes i databasen og læses FRISKT ved hvert trial-
// forsøg, så et "luk nu" virker øjeblikkeligt uden deploy.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

export function TrialIndstillinger({
  startAktiv,
  startBudgetDkk,
}: {
  startAktiv: boolean;
  startBudgetDkk: number;
}) {
  const [aktiv, setAktiv] = useState(startAktiv);
  const [budget, setBudget] = useState(String(startBudgetDkk));
  const [travl, setTravl] = useState(false);
  const [kvittering, setKvittering] = useState<string | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const copy = da.admin.trial;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setKvittering(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/admin/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktiv, dagligtBudgetDkk: Number(budget) }),
      });
      const data = (await svar.json()) as {
        indstillinger?: { aktiv: boolean; dagligtBudgetDkk: number };
        fejl?: string;
      };
      if (!svar.ok || !data.indstillinger) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setKvittering(copy.ok(data.indstillinger.aktiv, data.indstillinger.dagligtBudgetDkk));
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4">
      <label className="flex min-h-touch cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={aktiv}
          onChange={(e) => setAktiv(e.target.checked)}
          className="size-5 accent-primaer"
        />
        <span className="font-medium">{copy.aktivLabel}</span>
      </label>
      <Field
        label={copy.budgetLabel}
        type="number"
        required
        min={0}
        max={10_000}
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
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
        <Button type="submit" travl={travl}>
          {copy.knap}
        </Button>
      </div>
    </form>
  );
}
