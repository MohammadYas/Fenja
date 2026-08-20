"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { da } from "@/lib/copy/da";

// Slet-knap med DOBBELT bekræftelse (ejer-ordre 20/8): første tryk åbner en
// bekræftelse, og først det andet tryk ("Slet permanent") sletter. Ingen
// annonce kan ryge ved et uheldigt klik.
export function SletKnap({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [trin, setTrin] = useState<"skjult" | "bekraeft" | "sletter">("skjult");
  const [fejl, setFejl] = useState(false);

  async function slet() {
    setTrin("sletter");
    try {
      const svar = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!svar.ok) {
        setFejl(true);
        setTrin("skjult");
        return;
      }
      router.refresh();
    } catch {
      setFejl(true);
      setTrin("skjult");
    }
  }

  if (trin === "bekraeft") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-stram border border-fejl bg-flade px-3 py-2">
        <p className="font-mono text-detalje text-fejl">{da.oversigt.sletBekraeft}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={slet}
            className="min-h-touch rounded-stram border border-fejl px-3 font-mono text-detalje font-bold text-fejl transition active:scale-[0.98]"
          >
            {da.oversigt.sletPermanent}
          </button>
          <button
            type="button"
            onClick={() => setTrin("skjult")}
            className="min-h-touch text-detalje text-tekst/70 underline underline-offset-4"
          >
            {da.oversigt.sletFortryd}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setTrin("bekraeft")}
        className="min-h-touch text-detalje text-tekst/50 underline underline-offset-4 transition hover:text-fejl"
      >
        {da.oversigt.sletKnap}
      </button>
      {fejl ? (
        <p role="alert" className="mt-1 text-detalje text-fejl">
          {da.fejl.generel}
        </p>
      ) : null}
    </div>
  );
}
