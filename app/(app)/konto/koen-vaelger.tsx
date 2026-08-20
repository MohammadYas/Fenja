"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// Ejer-ordre 2026-08-20: køn skal kunne ændres på Konto — bag en "Ændre køn"-
// knap og med en bekræftelse, så et fejlklik aldrig skifter personen på alle
// kommende billeder. Skriver til samme rute som onboardingen.
type KoenVaelgerProps = {
  /** Nuværende valg fra profilen; null når onboardingen ikke er kørt */
  koen: string | null;
  haarFarve: string | null;
};

type Tilstand = "lukket" | "vaelger" | "bekraefter";

export function KoenVaelger({ koen, haarFarve }: KoenVaelgerProps) {
  const router = useRouter();
  const [gemtKoen, setGemtKoen] = useState(koen);
  const [gemtHaar, setGemtHaar] = useState(haarFarve);
  const [tilstand, setTilstand] = useState<Tilstand>("lukket");
  const [valgKoen, setValgKoen] = useState(koen ?? "");
  const [valgHaar, setValgHaar] = useState(haarFarve ?? "");
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [gemt, setGemt] = useState(false);

  const navnFor = (id: string | null) =>
    da.onboarding.koenValg.find((k) => k.id === id)?.navn ?? null;
  const haarNavnFor = (id: string | null) =>
    da.onboarding.haarValg.find((h) => h.id === id)?.navn ?? null;

  const nuKoenNavn = navnFor(gemtKoen);
  const nuHaarNavn = haarNavnFor(gemtHaar);
  const aendret = valgKoen !== (gemtKoen ?? "") || valgHaar !== (gemtHaar ?? "");

  function aabn() {
    setValgKoen(gemtKoen ?? "");
    setValgHaar(gemtHaar ?? "");
    setFejl(null);
    setGemt(false);
    setTilstand("vaelger");
  }

  function annuller() {
    setTilstand("lukket");
    setFejl(null);
  }

  async function bekraeftGem() {
    setTravl(true);
    setFejl(null);
    try {
      const svar = await fetch("/api/profil/generering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          koen: valgKoen,
          haarFarve: valgHaar === "" ? null : valgHaar,
        }),
      });
      const data = (await svar.json().catch(() => ({}))) as {
        fejl?: string;
        koen?: string;
        haarFarve?: string | null;
      };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.konto.koen.fejl);
        setTilstand("vaelger");
        return;
      }
      // Vis det serveren FAKTISK gemte — ikke det vi håbede på (ejer-rapport
      // 20/8: der stod "Gemt", men profilen var uændret)
      setGemtKoen(data.koen ?? valgKoen);
      setGemtHaar(data.haarFarve ?? null);
      setTilstand("lukket");
      setGemt(true);
      router.refresh();
    } catch {
      setFejl(da.konto.koen.fejl);
      setTilstand("vaelger");
    } finally {
      setTravl(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <p className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
        {nuKoenNavn
          ? da.konto.koen.nuvaerende(nuKoenNavn, nuHaarNavn)
          : da.konto.koen.ingenValgt}
      </p>

      {tilstand === "lukket" ? (
        <div className="flex items-center gap-3">
          <Button variant="sekundaer" onClick={aabn}>
            {da.konto.koen.aendreKnap}
          </Button>
          {gemt ? (
            <span role="status" className="text-detalje text-primaer">
              {da.konto.koen.gemt}
            </span>
          ) : null}
        </div>
      ) : null}

      {tilstand === "vaelger" ? (
        <div className="flex flex-col gap-4 rounded-bloed border border-kant p-4">
          <fieldset
            className="flex flex-col gap-2"
            aria-label={da.onboarding.koenTitel}
          >
            <legend className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
              {da.onboarding.koenTitel}
            </legend>
            {da.onboarding.koenValg.map((k) => (
              <label
                key={k.id}
                className="flex min-h-touch cursor-pointer items-center gap-3 text-basis"
              >
                <input
                  type="radio"
                  name="koen"
                  value={k.id}
                  checked={valgKoen === k.id}
                  onChange={() => setValgKoen(k.id)}
                  className="h-5 w-5 shrink-0 accent-primaer"
                />
                <span className="text-tekst">{k.navn}</span>
              </label>
            ))}
          </fieldset>

          <fieldset
            className="flex flex-col gap-2"
            aria-label={da.onboarding.haarTitel}
          >
            <legend className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
              {da.onboarding.haarTitel}
            </legend>
            <div className="flex flex-wrap gap-2">
              {da.onboarding.haarValg.map((h) => (
                <label
                  key={h.id}
                  className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-bloed border px-3 text-detalje ${
                    valgHaar === h.id ? "border-koks bg-flade" : "border-kant"
                  }`}
                >
                  <input
                    type="radio"
                    name="haar"
                    value={h.id}
                    checked={valgHaar === h.id}
                    onChange={() => setValgHaar(h.id)}
                    className="h-4 w-4 shrink-0 accent-primaer"
                  />
                  <span className="text-tekst">{h.navn}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="sekundaer"
              disabled={valgKoen === "" || !aendret}
              onClick={() => setTilstand("bekraefter")}
            >
              {da.konto.koen.gemKnap}
            </Button>
            <Button variant="stille" onClick={annuller}>
              {da.konto.koen.annuller}
            </Button>
          </div>
          {fejl ? (
            <p role="alert" className="text-detalje text-fejl">
              {fejl}
            </p>
          ) : null}
        </div>
      ) : null}

      {tilstand === "bekraefter" ? (
        <div className="flex flex-col gap-3 rounded-bloed border border-kant bg-flade p-4">
          <p className="max-w-laesbar">
            {da.konto.koen.bekraeftTekst(navnFor(valgKoen) ?? valgKoen)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button travl={travl} onClick={bekraeftGem}>
              {da.konto.koen.bekraeftKnap}
            </Button>
            <Button variant="stille" onClick={() => setTilstand("vaelger")}>
              {da.konto.koen.annuller}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
