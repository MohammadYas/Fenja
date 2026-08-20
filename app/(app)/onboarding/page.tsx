"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// Onboarding (ejer-ordre 2026-08-20): personen på de genererede billeder
// skal ligne sælgeren — vælg køn og hårfarve én gang, gemmes på profilen og
// bruges i alle genereringer (kan ændres her igen når som helst).
function OnboardingIndhold() {
  const router = useRouter();
  const params = useSearchParams();
  // Ejer-ordre 20/8: man kommer hertil fra banneret på oversigten og skal
  // TILBAGE dertil, ikke videre ind i wizarden. Et ?videre= kan overstyre,
  // så et fremtidigt indgangspunkt kan sende brugeren videre i sit eget flow.
  const videreRaa = params.get("videre");
  const videre =
    videreRaa?.startsWith("/") && !videreRaa.startsWith("//")
      ? videreRaa
      : "/oversigt";
  const copy = da.onboarding;
  const [koen, setKoen] = useState<string | null>(null);
  const [haar, setHaar] = useState<string | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);

  const gem = async () => {
    if (!koen) {
      setFejl(copy.fejlKoenMangler);
      return;
    }
    setTravl(true);
    setFejl(null);
    try {
      const svar = await fetch("/api/profil/generering", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ koen, haarFarve: haar ?? undefined }),
      });
      const data = (await svar.json()) as { fejl?: string };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        setTravl(false);
        return;
      }
      router.push(videre);
      router.refresh(); // banneret på oversigten skal væk med det samme
    } catch {
      setFejl(da.fejl.generel);
      setTravl(false);
    }
  };

  const chip = (aktiv: boolean) =>
    `min-h-touch rounded-bloed border px-4 py-2 text-basis transition-colors duration-150 ease-out ${
      aktiv
        ? "border-gran bg-gran text-kalk"
        : "border-kant bg-baggrund text-tekst/80 hover:border-koks/40"
    }`;

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">{copy.titel}</h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{copy.forklaring}</p>

      <section className="mt-8" aria-label={copy.koenTitel}>
        <h2 className="font-display text-lead font-semibold">{copy.koenTitel}</h2>
        <div className="mt-3 flex gap-3">
          {copy.koenValg.map((valg) => (
            <button
              key={valg.id}
              type="button"
              aria-pressed={koen === valg.id}
              onClick={() => setKoen(valg.id)}
              className={chip(koen === valg.id)}
            >
              {valg.navn}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-label={copy.haarTitel}>
        <h2 className="font-display text-lead font-semibold">{copy.haarTitel}</h2>
        <p className="mt-1 text-detalje text-tekst/70">{copy.haarHjaelp}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.haarValg.map((valg) => (
            <button
              key={valg.id}
              type="button"
              aria-pressed={haar === valg.id}
              onClick={() => setHaar(haar === valg.id ? null : valg.id)}
              className={chip(haar === valg.id)}
            >
              {valg.navn}
            </button>
          ))}
        </div>
      </section>

      {fejl ? (
        <p role="alert" className="mt-6 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}

      <Button onClick={gem} travl={travl} className="mt-8">
        {copy.gemKnap}
      </Button>
    </main>
  );
}

export default function Onboarding() {
  return (
    <Suspense
      fallback={
        <main className="py-6">
          <h1 className="font-display text-kaempe font-bold">
            {da.onboarding.titel}
          </h1>
        </main>
      }
    >
      <OnboardingIndhold />
    </Suspense>
  );
}
