"use client";

// Feedback-formular (ejer-ordre 21/8): bor på Konto — kategori-chips + kort
// besked. Efter afsendelse vises en stille tak i stedet for formularen.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

const KATEGORIER = ["ros", "fejl", "forslag", "andet"] as const;
type Kategori = (typeof KATEGORIER)[number];

export function FeedbackForm() {
  const [kategori, setKategori] = useState<Kategori>("forslag");
  const [besked, setBesked] = useState("");
  const [sendt, setSendt] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const copy = da.feedback;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori, besked }),
      });
      const data = (await svar.json()) as { fejl?: string };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setSendt(true);
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  if (sendt) {
    return <p role="status">{copy.tak}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={copy.kategoriLabel} className="flex flex-wrap gap-2">
        {KATEGORIER.map((valg) => (
          <button
            key={valg}
            type="button"
            role="radio"
            aria-checked={kategori === valg}
            onClick={() => setKategori(valg)}
            className={`min-h-touch cursor-pointer rounded-bloed border px-4 text-detalje font-medium transition ${
              kategori === valg
                ? "border-koks bg-koks text-kalk"
                : "border-kant text-tekst/80 hover:border-koks/50"
            }`}
          >
            {copy.kategorier[valg]}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-medium">{copy.beskedLabel}</span>
        <textarea
          required
          minLength={3}
          maxLength={2000}
          rows={4}
          value={besked}
          onChange={(e) => setBesked(e.target.value)}
          placeholder={copy.beskedPladsholder}
          className="rounded-bloed border border-kant bg-baggrund px-3 py-2 text-basis focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
        />
      </label>
      {fejl ? (
        <p role="alert" className="text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      <div>
        <Button type="submit" travl={travl}>
          {copy.knap}
        </Button>
      </div>
    </form>
  );
}
