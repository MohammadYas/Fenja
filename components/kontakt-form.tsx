"use client";

// Kontaktformular (ejer-ordre 21/8 nat): bruges på /kontakt (offentlig) og
// på Konto. Honeypot-feltet er skjult for mennesker; bots udfylder det og
// bliver stille kasseret i API-ruten.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

export function KontaktForm({
  startNavn = "",
  startEmail = "",
}: {
  startNavn?: string;
  startEmail?: string;
}) {
  const [navn, setNavn] = useState(startNavn);
  const [email, setEmail] = useState(startEmail);
  const [besked, setBesked] = useState("");
  const [hjemmeside, setHjemmeside] = useState("");
  const [sendt, setSendt] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const copy = da.kontaktSide;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navn, email, besked, hjemmeside }),
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
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Field
        label={copy.navnLabel}
        type="text"
        autoComplete="name"
        required
        maxLength={120}
        value={navn}
        onChange={(e) => setNavn(e.target.value)}
      />
      <Field
        label={copy.emailLabel}
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* Honeypot: skjult for mennesker (og skærmlæsere), lokkende for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Hjemmeside
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hjemmeside}
            onChange={(e) => setHjemmeside(e.target.value)}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-medium">{copy.beskedLabel}</span>
        <textarea
          required
          minLength={3}
          maxLength={4000}
          rows={5}
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
