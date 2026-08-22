"use client";

// Cookieløs besøgs-måler (21/8 nat): ét beacon pr. sidevisning med sti,
// henvisning og UTM — ingen cookies, intet storage, ingen identitet. Bor i
// rod-layoutet, så ALLE sider tælles (admin/API frasorteres i API-ruten).

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function Maaler() {
  const sti = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    if (!sti) return;
    const krop = JSON.stringify({
      sti,
      referrer: document.referrer || null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
    });
    // sendBeacon overlever navigation; fetch som fallback
    if (!navigator.sendBeacon?.("/api/besoeg", new Blob([krop], { type: "application/json" }))) {
      void fetch("/api/besoeg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: krop,
        keepalive: true,
      }).catch(() => undefined);
    }
    // Kun ved sti-skift — query-ændringer (fx wizard-trin) er samme side
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sti]);

  return null;
}

export function BesoegsMaaler() {
  // useSearchParams kræver Suspense i app-router
  return (
    <Suspense fallback={null}>
      <Maaler />
    </Suspense>
  );
}
