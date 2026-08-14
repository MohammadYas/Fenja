"use client";

import { useEffect, useRef, useState } from "react";
import { bevaegelse } from "@/lib/design/tokens";

// Tal tæller op over 400 ms (REDESIGN §2.5) — saldo og statistik. Respekterer
// prefers-reduced-motion: så vises sluttallet med det samme.
export function Taeller({ til }: { til: number }) {
  const [vist, setVist] = useState(0);
  const startet = useRef(false);

  useEffect(() => {
    if (startet.current) return;
    startet.current = true;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVist(til);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tik = (nu: number) => {
      const andel = Math.min((nu - start) / bevaegelse.taeller, 1);
      setVist(Math.round(til * andel));
      if (andel < 1) raf = requestAnimationFrame(tik);
    };
    raf = requestAnimationFrame(tik);
    return () => cancelAnimationFrame(raf);
  }, [til]);

  return <>{vist.toLocaleString("da-DK")}</>;
}
