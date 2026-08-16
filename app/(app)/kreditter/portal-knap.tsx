"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// Adgang til Stripes kundeportal: skift kort, fakturaer og opsigelse.
// Nem opsigelse er et krav (forbrugerbeskyttelse) — knappen gemmes aldrig væk.
export function PortalKnap({ className = "" }: { className?: string }) {
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);

  async function aabn() {
    setFejl(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await svar.json()) as { url?: string; fejl?: string };
      if (!svar.ok || !data.url) {
        setFejl(data.fejl ?? da.fejl.generel);
        setTravl(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setFejl(da.fejl.generel);
      setTravl(false);
    }
  }

  return (
    <div className={className}>
      <Button variant="sekundaer" onClick={aabn} travl={travl}>
        {da.kreditter.abonnementAdministrer}
      </Button>
      <p className="mt-1 text-detalje text-tekst/70">
        {da.kreditter.abonnementAdministrerHjaelp}
      </p>
      {fejl ? (
        <p role="alert" className="mt-1 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
    </div>
  );
}
