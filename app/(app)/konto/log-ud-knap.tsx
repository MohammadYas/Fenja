"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// Synlig log ud-knap på Konto (ejer-ordre 2026-08-20: skal være nemt).
export function LogUdKnap() {
  const [travl, setTravl] = useState(false);

  const logUd = async () => {
    setTravl(true);
    try {
      await fetch("/api/auth/log-ud", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <Button variant="sekundaer" onClick={logUd} disabled={travl}>
      {da.nav.logUd}
    </Button>
  );
}
