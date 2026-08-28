"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

type Fane = "login" | "signup";

// Udbyder-mærker som inline-SVG: ingen ekstra netkald, og de følger
// udbydernes egne farver/former, som deres retningslinjer kræver.
function GoogleMaerke() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function LogIndIndhold() {
  const router = useRouter();
  const params = useSearchParams();
  const videre = params.get("videre") ?? "/oversigt";
  // Sat af auth-ruterne ved udløbet/brugt mail-link (ejer 22/8) og af
  // middleware ved en afvist session: forklar ærligt i stedet for en tom
  // login-væg
  const besked = params.get("besked");
  const linkUdloebet = besked === "link-udloebet";
  const sessionUdloebet = besked === "session-udloebet";

  const [fane, setFane] = useState<Fane>("login");
  const [email, setEmail] = useState("");
  const [kode, setKode] = useState("");
  const [er18, setEr18] = useState<boolean | null>(null);
  const [under18, setUnder18] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const [bekraeftMail, setBekraeftMail] = useState(false);
  const [glemtSendt, setGlemtSendt] = useState(false);
  const [tjekker, setTjekker] = useState(false);
  const [ikkeBekraeftetEndnu, setIkkeBekraeftetEndnu] = useState(false);
  const [senderIgen, setSenderIgen] = useState(false);
  const [sendtIgen, setSendtIgen] = useState<"sendt" | "fejl" | null>(null);

  // Gensend bekræftelsesmailen (ejer 22/8: en død mail må aldrig koste en
  // kunde). Supabase svarer identisk for kendte/ukendte adresser, og
  // rate-limiter selv til én mail i minuttet — fejlen siger det ærligt.
  async function sendMailIgen(): Promise<void> {
    if (!email) return;
    setSenderIgen(true);
    setSendtIgen(null);
    try {
      const { opretBrowserKlient } = await import("@/lib/supabase/client");
      const supabase = opretBrowserKlient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?videre=${encodeURIComponent(videre)}`,
        },
      });
      setSendtIgen(error ? "fejl" : "sendt");
    } catch {
      setSendtIgen("fejl");
    } finally {
      setSenderIgen(false);
    }
  }

  // "Tjek din indbakke"-tilstanden venter selv (ejer-ordre 22/8): vi HAR
  // e-mail og kode, så et stille login-forsøg afslører, om linket i mailen
  // er fulgt — det fejler med "ikke bekræftet" indtil da og lykkes derefter.
  // Lykkes det, sendes brugeren videre. Kadencen (15 s) holder sig under
  // Supabase-rate-limitet på token-endpointet.
  const proevBekraeftet = useCallback(
    async (manuel: boolean): Promise<void> => {
      if (!email || !kode) return;
      if (manuel) {
        setTjekker(true);
        setIkkeBekraeftetEndnu(false);
      }
      try {
        const { opretBrowserKlient } = await import("@/lib/supabase/client");
        const supabase = opretBrowserKlient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: kode,
        });
        if (!error) {
          try {
            await fetch("/api/auth/efter-login", { method: "POST" });
          } catch {
            // ignoreres bevidst — brugeren er stadig logget ind
          }
          router.replace(videre);
          router.refresh();
          return;
        }
        if (manuel) setIkkeBekraeftetEndnu(true);
      } catch {
        if (manuel) setIkkeBekraeftetEndnu(true);
      } finally {
        if (manuel) setTjekker(false);
      }
    },
    [email, kode, router, videre],
  );

  useEffect(() => {
    if (!bekraeftMail) return;
    // Skift til "Tjek din indbakke" sker typisk mens man står nede ved
    // knappen — op til toppen, så beskeden faktisk kan ses (ejer-ordre 22/8)
    window.scrollTo(0, 0);
    const interval = window.setInterval(() => {
      void proevBekraeftet(false);
    }, 15_000);
    // Stop det stille tjek efter 10 minutter — knappen virker stadig
    const stop = window.setTimeout(() => window.clearInterval(interval), 600_000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [bekraeftMail, proevBekraeftet]);

  // Glemt adgangskode (S39, ublokeret 21/8 da Resend-SMTP kom på): linket i
  // mailen lander i callback-ruten, der veksler koden til en session og
  // sender brugeren videre til ny-adgangskode-siden. Svarer altid "sendt" —
  // også for ukendte adresser — så man ikke kan aflure hvem der har en konto.
  async function sendNulstilling() {
    setFejl(null);
    if (!email) {
      setFejl(da.logInd.glemt.emailFoerst);
      return;
    }
    setTravl(true);
    try {
      const { opretBrowserKlient } = await import("@/lib/supabase/client");
      const supabase = opretBrowserKlient();
      // Lander i /auth/confirm, som tager BÅDE token_hash (skabelon-linket)
      // og PKCE-?code (ConfirmationURL) — glemt-kode-fejlen 22/8
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?videre=${encodeURIComponent("/ny-adgangskode")}`,
      });
      setGlemtSendt(true);
    } catch {
      setFejl(da.logInd.fejlGenerel);
    } finally {
      setTravl(false);
    }
  }

  function skiftFane(ny: Fane) {
    setFane(ny);
    setFejl(null);
  }

  // Social login (ejer-ordre 20/8; Apple fravalgt — kræver betalt Apple
  // Developer-medlemskab). 18+-gaten (A-2) gælder også her: ved oprettelse
  // skal svaret gives FØR omdirigeringen, og det sendes med som parameter på
  // callback'et — samme selvangivne tillidsniveau som afkrydsningen.
  async function socialLogin(udbyder: "google") {
    setFejl(null);
    if (fane === "signup") {
      if (er18 === null) {
        setFejl(da.logInd.socialAlderFoerst);
        return;
      }
      if (!er18) {
        setUnder18(true);
        return;
      }
    }
    setTravl(true);
    try {
      const { opretBrowserKlient } = await import("@/lib/supabase/client");
      const supabase = opretBrowserKlient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("videre", videre);
      if (fane === "signup" && er18) callback.searchParams.set("alder", "1");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: udbyder,
        options: { redirectTo: callback.toString() },
      });
      // Lykkes kaldet, forlader browseren siden — vi når kun hertil ved fejl
      if (error) {
        setFejl(da.logInd.fejlSocial);
        setTravl(false);
      }
    } catch {
      setFejl(da.logInd.fejlSocial);
      setTravl(false);
    }
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
          // Ubekræftet konto er ikke "forkert kode" — sig det ærligt
          if (/confirm/i.test(error.message)) {
            setBekraeftMail(true);
            return;
          }
          setFejl(da.logInd.fejlLogin);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: kode,
          options: {
            data: { age_confirmed: true },
            // Bekræftelseslinket lander i callback-ruten, der veksler koden,
            // sætter alder, tildeler kreditter og sender velkomstmail
            emailRedirectTo: `${window.location.origin}/auth/callback?videre=${encodeURIComponent(videre)}`,
          },
        });
        if (error || !data.user) {
          setFejl(da.logInd.fejlSignup);
          return;
        }
        // E-mail-bekræftelse er slået TIL (sikkerhed, 21/8): ingen session før
        // linket i mailen er fulgt. Findes adressen i forvejen, sender Supabase
        // ingen mail men svarer identisk — samme besked her, så en angriber
        // ikke kan aflure hvilke adresser der har en konto.
        if (!data.session) {
          setBekraeftMail(true);
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

  if (bekraeftMail) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-kaempe font-bold">
          {da.logInd.bekraeftMail.titel}
        </h1>
        <p className="mt-4 max-w-laesbar">{da.logInd.bekraeftMail.brod(email)}</p>
        <p className="mt-2 max-w-laesbar text-detalje text-koks/70">
          {da.logInd.bekraeftMail.spam}
        </p>
        <p className="mt-4 max-w-laesbar text-detalje text-tekst/80">
          {da.logInd.bekraeftMail.autoTjek}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button travl={tjekker} onClick={() => void proevBekraeftet(true)}>
            {da.logInd.bekraeftMail.knap}
          </Button>
          <Button
            variant="sekundaer"
            travl={senderIgen}
            onClick={() => void sendMailIgen()}
          >
            {da.logInd.bekraeftMail.sendIgen}
          </Button>
        </div>
        {ikkeBekraeftetEndnu ? (
          <p role="status" className="mt-3 max-w-laesbar text-detalje text-tekst/70">
            {da.logInd.bekraeftMail.ikkeEndnu}
          </p>
        ) : null}
        {sendtIgen ? (
          <p role="status" className="mt-3 max-w-laesbar text-detalje text-tekst/70">
            {sendtIgen === "sendt"
              ? da.logInd.bekraeftMail.sendtIgen
              : da.logInd.bekraeftMail.sendIgenFejl}
          </p>
        ) : null}
      </main>
    );
  }

  const erSignup = fane === "signup";

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-display">{da.logInd.titel}</h1>

      {/* Udløbet/brugt mail-link (fx mail-scannerens forhåndsklik) eller en
          session serveren har afvist: ærlig forklaring — er kontoen allerede
          bekræftet, virker login straks */}
      {linkUdloebet || sessionUdloebet ? (
        <p
          role="status"
          className="mt-4 max-w-laesbar rounded-bloed border border-kant bg-flade p-3 text-detalje text-tekst/80"
        >
          {linkUdloebet ? da.logInd.linkUdloebet : da.logInd.sessionUdloebet}
        </p>
      ) : null}

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

      {/* Google + Apple (ejer-ordre 20/8): samme vægt som e-mail, under
          formularen så den kendte vej stadig står først */}
      <div className="mt-8 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-kant" />
        <span className="font-mono text-detalje uppercase tracking-wide text-tekst/60">
          {da.logInd.ellers}
        </span>
        <span className="h-px flex-1 bg-kant" />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Button
          variant="sekundaer"
          disabled={travl}
          onClick={() => socialLogin("google")}
        >
          <GoogleMaerke />
          {da.logInd.google}
        </Button>
      </div>

      {!erSignup ? (
        <div className="mt-6">
          {glemtSendt ? (
            <p role="status" className="text-detalje text-tekst/80">
              {da.logInd.glemt.sendt}
            </p>
          ) : (
            <button
              type="button"
              disabled={travl}
              onClick={sendNulstilling}
              className="min-h-touch cursor-pointer text-detalje text-tekst/60 underline underline-offset-2 hover:text-koks"
            >
              {da.logInd.glemt.knap}
            </button>
          )}
        </div>
      ) : null}
    </main>
  );
}

export default function LogInd() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16">
          <h1 className="font-display text-kaempe font-bold">{da.logInd.titel}</h1>
        </main>
      }
    >
      <LogIndIndhold />
    </Suspense>
  );
}
