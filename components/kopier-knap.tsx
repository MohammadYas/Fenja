"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// Ét-tryks kopiering pr. element (B-5/FR-9) med kort bekræftelse.
export function KopierKnap({ tekst, label }: { tekst: string; label?: string }) {
  const [kopieret, setKopieret] = useState(false);

  async function kopier() {
    await navigator.clipboard.writeText(tekst);
    setKopieret(true);
    setTimeout(() => setKopieret(false), 2000);
  }

  return (
    <Button variant="sekundaer" onClick={kopier} aria-live="polite">
      {kopieret ? da.resultat.kopieret : (label ?? da.resultat.kopier)}
    </Button>
  );
}
