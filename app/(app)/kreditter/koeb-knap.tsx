"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

export function KoebKnap({ pakkeId }: { pakkeId: string }) {
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);

  async function koeb() {
    setFejl(null);
    setTravl(true);
    const svar = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pakkeId }),
    });
    const data = (await svar.json()) as { url?: string; fejl?: string };
    if (!svar.ok || !data.url) {
      setFejl(data.fejl ?? da.fejl.generel);
      setTravl(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={koeb} travl={travl}>
        {da.kreditter.koeb}
      </Button>
      {fejl ? (
        <p role="alert" className="max-w-48 text-right text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
    </div>
  );
}
