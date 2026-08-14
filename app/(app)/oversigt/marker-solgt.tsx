"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

export function MarkerSolgt({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [aaben, setAaben] = useState(false);
  const [pris, setPris] = useState("");
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);

  async function gem(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setTravl(true);
    const svar = await fetch(`/api/items/${itemId}/solgt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salgsprisDkk: Number(pris) }),
    });
    setTravl(false);
    if (!svar.ok) {
      setFejl(da.fejl.generel);
      return;
    }
    router.refresh();
  }

  if (!aaben) {
    return (
      <Button variant="stille" onClick={() => setAaben(true)}>
        {da.oversigt.markerSolgt}
      </Button>
    );
  }

  return (
    <form onSubmit={gem} className="flex items-end gap-2">
      <Field
        label={da.oversigt.salgsprisLabel}
        type="number"
        inputMode="numeric"
        min="0"
        required
        value={pris}
        onChange={(e) => setPris(e.target.value)}
        className="flex-1"
        fejl={fejl ?? undefined}
      />
      <Button type="submit" travl={travl}>
        {da.oversigt.gemSalg}
      </Button>
    </form>
  );
}
