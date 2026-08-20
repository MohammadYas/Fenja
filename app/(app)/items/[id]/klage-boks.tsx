"use client";

import { useState } from "react";
import { da } from "@/lib/copy/da";

// Klage-boksen på resultatsiden (ejer-ordre 2026-08-20): er brugeren utilfreds
// med det genererede billede, kan de anmode om deres kredit tilbage. Klagen
// lander i admin-panelet, hvor ejeren afgør den. Én klage pr. annonce.
export function KlageBoks({
  itemId,
  eksisterendeStatus,
}: {
  itemId: string;
  /** 'aaben' | 'godkendt' | 'afvist' — eller null hvis ingen klage findes */
  eksisterendeStatus: string | null;
}) {
  const copy = da.klage;
  const [aaben, setAaben] = useState(false);
  const [begrundelse, setBegrundelse] = useState("");
  const [status, setStatus] = useState(eksisterendeStatus);
  const [sender, setSender] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);

  if (status) {
    return (
      <p className="text-detalje text-tekst/70">
        {status === "aaben"
          ? copy.statusAaben
          : status === "godkendt"
            ? copy.statusGodkendt
            : copy.statusAfvist}
      </p>
    );
  }

  if (!aaben) {
    // Ejer-ordre 20/8: klage-CTA'en skal være mere livlig — gran-knap med pil
    return (
      <button
        type="button"
        onClick={() => setAaben(true)}
        className="mt-4 inline-flex min-h-touch items-center gap-2 rounded-bloed bg-gran px-5 font-brod text-basis font-medium text-kalk transition hover:bg-primaer active:scale-[0.98]"
      >
        {copy.knap}
        <span aria-hidden="true">→</span>
      </button>
    );
  }

  const send = async () => {
    setSender(true);
    setFejl(null);
    try {
      const svar = await fetch(`/api/items/${itemId}/klage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ begrundelse }),
      });
      if (svar.status === 409) {
        setStatus("aaben");
        return;
      }
      if (!svar.ok) {
        const data = (await svar.json()) as { fejl?: string };
        setFejl(data.fejl ?? copy.fejl);
        return;
      }
      setStatus("aaben");
    } catch {
      setFejl(copy.fejl);
    } finally {
      setSender(false);
    }
  };

  // Livlig gran-blok (ejer-ordre 20/8) — samme udtryk som marketing-blokkene
  return (
    <div className="rounded-bloed bg-gran p-5 text-kalk">
      <p className="font-display text-lead font-semibold text-hoer">{copy.titel}</p>
      <p className="mt-1 max-w-laesbar text-detalje text-kalk/80">{copy.forklaring}</p>
      <label className="mt-3 block">
        <span className="sr-only">{copy.titel}</span>
        <textarea
          value={begrundelse}
          onChange={(e) => setBegrundelse(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={copy.pladsholder}
          className="w-full rounded-bloed border border-kalk/30 bg-kalk/10 px-3 py-2 text-detalje text-kalk placeholder:text-kalk/50 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-kalk"
        />
      </label>
      {fejl ? <p className="mt-2 text-detalje text-rav">{fejl}</p> : null}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={send}
          disabled={sender || begrundelse.trim().length < 10}
          className="knap-link knap-link-lys disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sender ? copy.senderKnap : copy.sendKnap}
        </button>
        <button
          type="button"
          onClick={() => setAaben(false)}
          className="min-h-touch text-detalje text-kalk/70 underline underline-offset-4"
        >
          {copy.fortryd}
        </button>
      </div>
    </div>
  );
}
