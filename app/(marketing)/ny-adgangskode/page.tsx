"use client";

// Ny adgangskode (S39): brugeren lander her fra nulstillings-mailen —
// callback-ruten har allerede vekslet koden til en session, så vi kan kalde
// updateUser direkte. Uden session vises en ærlig besked i stedet for en
// formular der alligevel ville fejle.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

export default function NyAdgangskode() {
  const router = useRouter();
  const [kode, setKode] = useState("");
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const [harSession, setHarSession] = useState<boolean | null>(null);

  // Tjek sessionen med det samme (glemt-kode-fejlen 22/8): et udløbet/brugt
  // link skal give den ærlige besked STRAKS — ikke først efter man har
  // tastet en ny kode, som alligevel ikke kunne gemmes
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const { opretBrowserKlient } = await import("@/lib/supabase/client");
        const supabase = opretBrowserKlient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (aktiv) setHarSession(user != null);
      } catch {
        if (aktiv) setHarSession(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    if (kode.length < 8) {
      setFejl(da.logInd.fejlKortKode);
      return;
    }
    setTravl(true);
    try {
      const { opretBrowserKlient } = await import("@/lib/supabase/client");
      const supabase = opretBrowserKlient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFejl(da.nyAdgangskode.ingenSession);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: kode });
      if (error) {
        setFejl(da.nyAdgangskode.fejl);
        return;
      }
      router.replace("/oversigt");
      router.refresh();
    } catch {
      setFejl(da.logInd.fejlGenerel);
    } finally {
      setTravl(false);
    }
  }

  if (harSession === false) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-display">{da.nyAdgangskode.titel}</h1>
        <p className="mt-4 max-w-laesbar text-tekst/80">
          {da.nyAdgangskode.ingenSession}
        </p>
        <Link href="/log-ind" className="knap-link mt-6">
          {da.nyAdgangskode.tilLogInd}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-display">{da.nyAdgangskode.titel}</h1>
      <p className="mt-4 max-w-laesbar text-tekst/80">{da.nyAdgangskode.forklaring}</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
        <Field
          label={da.logInd.adgangskodeLabel}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          hjaelp={da.logInd.adgangskodeHjaelp}
        />
        {fejl ? (
          <p role="alert" className="text-detalje text-fejl">
            {fejl}
          </p>
        ) : null}
        <Button type="submit" travl={travl}>
          {da.nyAdgangskode.knap}
        </Button>
      </form>
    </main>
  );
}
