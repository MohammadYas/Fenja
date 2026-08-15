"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stempel } from "@/components/ui/stempel";
import { da } from "@/lib/copy/da";

// Ét-tryks kopiering pr. element (B-5/FR-9). Bekræftelsen stemples på som et
// håndstempel (REDESIGN §3.4) — kort, tydelig, uden cirkus.
export function KopierKnap({ tekst, label }: { tekst: string; label?: string }) {
  const [kopieret, setKopieret] = useState(false);

  async function kopier() {
    await navigator.clipboard.writeText(tekst);
    setKopieret(true);
    setTimeout(() => setKopieret(false), 2000);
  }

  return (
    <span className="inline-flex items-center gap-3" aria-live="polite">
      <Button variant="sekundaer" onClick={kopier}>
        {label ?? da.resultat.kopier}
      </Button>
      {kopieret ? <Stempel>{da.resultat.kopieret}</Stempel> : null}
    </span>
  );
}
