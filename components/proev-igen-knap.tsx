"use client";

import { da } from "@/lib/copy/da";

// Prøv igen uden at skulle finde browserens genindlæs-knap. Bruges hvor
// serveren ikke kunne nå Supabase: siden er i orden, forbindelsen var det
// ikke — så et genbesøg er hele handlingen.
export function ProevIgenKnap() {
  return (
    <button
      type="button"
      className="knap-link"
      onClick={() => window.location.reload()}
    >
      {da.fejlsider.fejlKnap}
    </button>
  );
}
