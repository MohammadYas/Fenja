"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";
import { opretBrowserKlient } from "@/lib/supabase/client";

type Tilstand =
  | { trin: "form" }
  | { trin: "sendt"; email: string }
  | { trin: "under18" };

export default function LogInd() {
  const [tilstand, setTilstand] = useState<Tilstand>({ trin: "form" });
  const [email, setEmail] = useState("");
  const [er18, setEr18] = useState<boolean | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    // 18+-gate (A-2): under 18 afvises venligt, ingen konto oprettes
    if (er18 === null) {
      setFejl(da.logInd.alderPaakraevet);
      return;
    }
    if (!er18) {
      setTilstand({ trin: "under18" });
      return;
    }

    setTravl(true);
    const supabase = opretBrowserKlient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { age_confirmed: true },
      },
    });
    setTravl(false);
    if (error) {
      setFejl(da.logInd.fejl);
      return;
    }
    setTilstand({ trin: "sendt", email });
  }

  if (tilstand.trin === "sendt") {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-kaempe font-bold uppercase">
          {da.logInd.titel}
        </h1>
        <p className="mt-4 max-w-laesbar">{da.logInd.linkSendt(tilstand.email)}</p>
      </main>
    );
  }

  if (tilstand.trin === "under18") {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-kaempe font-bold uppercase">
          {da.logInd.titel}
        </h1>
        <p className="mt-4 max-w-laesbar">{da.logInd.under18}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-display">{da.logInd.titel}</h1>
      <p className="mt-2 max-w-laesbar text-tekst/80">{da.logInd.forklaring}</p>
      <form onSubmit={sendLink} className="mt-8 flex flex-col gap-5">
        <Field
          label={da.logInd.emailLabel}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <fieldset>
          <legend className="font-medium">{da.logInd.alderSpoergsmaal}</legend>
          <p className="text-detalje text-tekst/70">{da.logInd.alderHjaelp}</p>
          {/* Taktile valgkort (S24): native radios under motorhjelmen — kortet
              får koks-kant + hør-grund når valgt, fokusring via focus-within */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {(
              [
                [true, da.logInd.alderJa],
                [false, da.logInd.alderNej],
              ] as const
            ).map(([vaerdi, tekst]) => (
              <label
                key={tekst}
                className={`flex min-h-touch flex-1 cursor-pointer items-center gap-3 rounded-bloed border-2 px-4 py-2.5 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-koks ${
                  er18 === vaerdi
                    ? "border-koks bg-flade shadow-offset-hoer"
                    : "border-kant bg-baggrund hover:border-koks/50"
                }`}
              >
                <input
                  type="radio"
                  name="alder"
                  checked={er18 === vaerdi}
                  onChange={() => setEr18(vaerdi)}
                  className="h-5 w-5 shrink-0 accent-gran"
                />
                {tekst}
              </label>
            ))}
          </div>
        </fieldset>
        {fejl ? (
          <p role="alert" className="text-detalje text-fejl">
            {fejl}
          </p>
        ) : null}
        <Button type="submit" travl={travl}>
          {da.logInd.sendLink}
        </Button>
      </form>
    </main>
  );
}
