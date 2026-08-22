"use client";

// Admin: tildel kreditter manuelt (ejer-ordre 22/8) — support, kompensation
// ved fejl, testbrugere, kampagner. Negativt tal trækker fra.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

export function TildelKreditter() {
  const [email, setEmail] = useState("");
  const [antal, setAntal] = useState("");
  const [note, setNote] = useState("");
  const [travl, setTravl] = useState(false);
  const [kvittering, setKvittering] = useState<string | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const copy = da.admin.tildel;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setKvittering(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/admin/kreditter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, antal: Number(antal), note }),
      });
      const data = (await svar.json()) as {
        antal?: number;
        email?: string;
        saldo?: number;
        fejl?: string;
      };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setKvittering(copy.ok(data.antal ?? 0, data.email ?? email, data.saldo ?? 0));
      setAntal("");
      setNote("");
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4">
      <Field
        label={copy.emailLabel}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label={copy.antalLabel}
        type="number"
        required
        value={antal}
        onChange={(e) => setAntal(e.target.value)}
      />
      <Field
        label={copy.noteLabel}
        type="text"
        required
        minLength={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        hjaelp={copy.notePladsholder}
      />
      {fejl ? (
        <p role="alert" className="text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      {kvittering ? (
        <p role="status" className="text-detalje text-gran">
          {kvittering}
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
