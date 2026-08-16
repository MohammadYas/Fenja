"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

type Fane = "login" | "signup";

export default function LogInd() {
  const router = useRouter();
  const params = useSearchParams();
  const videre = params.get("videre") ?? "/oversigt";

  const [fane, setFane] = useState<Fane>("login");
  const [email, setEmail] = useState("");
  const [kode, setKode] = useState("");
  const [er18, setEr18] = useState<boolean | null>(null);
  const [under18, setUnder18] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);

  function skiftFane(ny: Fane) {
    setFane(ny);
    setFejl(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    if (fane === "signup") {
      // 18+-gate (A-2): kun ved oprettelse
      if (er18 === null) {
        setFejl(da.logInd.alderPaakraevet);
        return;
      }
      if (!er18) {
        setUnder18(true);
        return;
      }
      if (kode.length < 8) {
        setFejl(da.logInd.fejlKortKode);
        return;
      }
    }

    setTravl(true);
    try {
      // Supabase-klienten (~53 KB gzip) hentes først her ved submit
      const { opretBrowserKlient } = await import("@/lib/supabase/client");
      const supabase = opretBrowserKlient();

      if (fane === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: kode,
        });
        if (error) {
          setFejl(da.logInd.fejlLogin);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: kode,
          options: { data: { age_confirmed: true } },
        });
        if (error || !data.user) {
          setFejl(da.logInd.fejlSignup);
          return;
        }
      }

      // Alders-flag + velkomstmail (idempotent, best-effort). Blokerer aldrig
      // adgangen — fejler kaldet, er brugeren stadig logget ind.
      try {
        await fetch("/api/auth/efter-login", { method: "POST" });
      } catch {
        // ignoreres bevidst
      }

      router.replace(videre);
      router.refresh();
    } catch {
      setFejl(da.logInd.fejlGenerel);
    } finally {
      setTravl(false);
    }
  }

  if (under18) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-kaempe font-bold">{da.logInd.titel}</h1>
        <p className="mt-4 max-w-laesbar">{da.logInd.under18}</p>
      </main>
    );
  }

  const erSignup = fane === "signup";

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-display">{da.logInd.titel}</h1>

      {/* Faner: log ind / opret konto */}
      <div
        role="tablist"
        aria-label={da.logInd.titel}
        className="mt-6 inline-flex rounded-bloed border border-kant p-1"
      >
        {(
          [
            ["login", da.logInd.loginFane],
            ["signup", da.logInd.signupFane],
          ] as const
        ).map(([vaerdi, tekst]) => (
          <button
            key={vaerdi}
            type="button"
            role="tab"
            aria-selected={fane === vaerdi}
            onClick={() => skiftFane(vaerdi)}
            className={`min-h-touch rounded-bloed px-4 text-detalje font-medium transition ${
              fane === vaerdi ? "bg-koks text-kalk" : "text-tekst/70 hover:text-koks"
            }`}
          >
            {tekst}
          </button>
        ))}
      </div>

      <p className="mt-4 max-w-laesbar text-tekst/80">
        {erSignup ? da.logInd.forklaringSignup : da.logInd.forklaringLogin}
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
        <Field
          label={da.logInd.emailLabel}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label={da.logInd.adgangskodeLabel}
          type="password"
          autoComplete={erSignup ? "new-password" : "current-password"}
          required
          minLength={8}
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          hjaelp={erSignup ? da.logInd.adgangskodeHjaelp : undefined}
        />

        {erSignup ? (
          <fieldset>
            <legend className="font-medium">{da.logInd.alderSpoergsmaal}</legend>
            <p className="text-detalje text-tekst/70">{da.logInd.alderHjaelp}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {(
                [
                  [true, da.logInd.alderJa],
                  [false, da.logInd.alderNej],
                ] as const
              ).map(([vaerdi, tekst]) => (
                <label
                  key={tekst}
                  className={`flex min-h-touch flex-1 cursor-pointer items-center gap-3 rounded-bloed border px-4 py-2.5 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-koks ${
                    er18 === vaerdi
                      ? "border-gran bg-flade"
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
        ) : null}

        {fejl ? (
          <p role="alert" className="text-detalje text-fejl">
            {fejl}
          </p>
        ) : null}

        <Button type="submit" travl={travl}>
          {erSignup ? da.logInd.opretKnap : da.logInd.logIndKnap}
        </Button>
      </form>

      {!erSignup ? (
        <p className="mt-6 text-detalje text-tekst/60">{da.logInd.glemtKode}</p>
      ) : null}
    </main>
  );
}
