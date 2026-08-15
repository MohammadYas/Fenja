"use client";

import { da } from "@/lib/copy/da";

// Fejlgrænse for hele appen: ærlig besked uden undskyldnings-teater
// (HANDOFF §2.2.4) og en prøv-igen-knap, der bruger Next' reset.
export default function FejlSide({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 py-16">
      <h1 className="max-w-2xl font-display text-kaempe font-bold">
        {da.fejlsider.fejlTitel}
      </h1>
      <p className="mt-4 max-w-laesbar text-lead text-tekst/80">
        {da.fejlsider.fejlTekst}
      </p>
      <p className="mt-8">
        <button type="button" onClick={reset} className="knap-link">
          {da.fejlsider.fejlKnap}
        </button>
      </p>
    </main>
  );
}
