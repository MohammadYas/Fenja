"use client";

// Trial-flowet på klienten: upload → ventetid → resultat med lås. Mobil-først
// (61 % af trafikken): én stor knap, kamera direkte, ingen formularer.
// Klienten er kun fremvisning — ALLE værn og alle valg (stil, model,
// opløsning) ligger server-side i /api/prov.

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trial } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { psykologiskAndel } from "@/lib/fremdrift";
import {
  VISNINGS_TYPER,
  eksempelBillede,
  spejlEksempelPar,
} from "@/lib/pipeline/visninger";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          appearance?: string;
        },
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";
// Opgiv pollingen efter 4 minutter uden svar — jobbet er reelt dødt
const MAKS_VENTETID_MS = 4 * 60_000;

type Resultat = {
  billedeUrl: string | null;
  kategori: string | null;
  titel: string;
  beskrivelseSynlig: string;
  beskrivelseSkjulteTegn: number;
  soegeordSynlige: string[];
  soegeordSkjulte: number;
  prisforslagDkk: { fra: number; til: number };
  prisBegrundelse: string;
};

type Tilstand =
  | { fase: "start" }
  | { fase: "sender" }
  | { fase: "venter"; token: string; startetMs: number; forventetSekunder: number }
  | { fase: "resultat"; resultat: Resultat }
  | { fase: "blokeret"; besked: string }
  | {
      fase: "fejlet";
      besked: string;
      kanProeveIgen: boolean;
      /** Kun en FEJLET GENERERING bruger den ene "prøv igen" — ikke valideringsfejl */
      taellerRetry: boolean;
      /** Sat når resultatet FINDES men hentningen fejlede: "hent igen" i stedet
       *  for et nyt forsøg (som værnet ville blokere — kodereview 25/8) */
      hentToken?: string;
    };

export function ProvKlient({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [tilstand, setTilstand] = useState<Tilstand>({ fase: "start" });
  const [procent, setProcent] = useState(0);
  const filInput = useRef<HTMLInputElement>(null);
  const turnstileBoks = useRef<HTMLDivElement>(null);
  const captchaToken = useRef<string | null>(null);
  // Ejer-beslutning: én manuel "prøv igen" efter en fejlet kørsel — fejlede
  // låser ikke IP'en, men klienten skal heller ikke invitere til at hamre løs
  const harProevetIgen = useRef(false);

  // Usynlig Turnstile: widget'en renderes ved load og afleverer tokenet i
  // baggrunden, så selve upload-klikket aldrig venter på captchaen
  useEffect(() => {
    if (!turnstileSiteKey) return;
    const renderWidget = () => {
      if (!turnstileBoks.current || !window.turnstile) return;
      window.turnstile.render(turnstileBoks.current, {
        sitekey: turnstileSiteKey,
        appearance: "interaction-only",
        callback: (token) => {
          captchaToken.current = token;
        },
        "error-callback": () => {
          captchaToken.current = null;
        },
      });
    };
    if (window.turnstile) {
      renderWidget();
      return;
    }
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  // Resultatet FINDES på serveren, når vi når hertil — et enkelt netværks-
  // glitch må aldrig sende brugeren i "prøv igen" (som værnet ville blokere,
  // fordi trialen ER completed). Derfor: 3 forsøg, og fejler alle, en
  // "hent igen"-knap der genkalder hentningen — aldrig et nyt POST.
  const hentResultat = useCallback(async (token: string) => {
    for (let forsoeg = 0; forsoeg < 3; forsoeg++) {
      try {
        const svar = await fetch(`/api/prov/resultat?token=${token}`);
        if (svar.ok) {
          setTilstand({ fase: "resultat", resultat: (await svar.json()) as Resultat });
          return;
        }
      } catch {
        // net-bump — næste forsøg
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    setTilstand({
      fase: "fejlet",
      besked: da.prov.fejlHentResultat,
      kanProeveIgen: false,
      taellerRetry: false,
      hentToken: token,
    });
  }, []);

  // Polling + fremdriftskurve mens genereringen kører
  useEffect(() => {
    if (tilstand.fase !== "venter") return;
    const { token, startetMs, forventetSekunder } = tilstand;
    const fremdrift = setInterval(() => {
      setProcent(Math.round(psykologiskAndel(startetMs, Date.now(), forventetSekunder) * 100));
    }, 1000);
    const poll = setInterval(() => {
      void (async () => {
        if (Date.now() - startetMs > MAKS_VENTETID_MS) {
          setTilstand({
            fase: "fejlet",
            besked: da.prov.fejlGenerering,
            kanProeveIgen: !harProevetIgen.current,
            taellerRetry: true,
          });
          return;
        }
        try {
          const svar = await fetch(`/api/prov/status?token=${token}`);
          if (!svar.ok) return; // midlertidigt netværksbump — pollen fortsætter
          const data = (await svar.json()) as { status: string };
          if (data.status === "completed") await hentResultat(token);
          if (data.status === "failed") {
            setTilstand({
              fase: "fejlet",
              besked: da.prov.fejlGenerering,
              kanProeveIgen: !harProevetIgen.current,
              taellerRetry: true,
            });
          }
        } catch {
          // stille — næste poll prøver igen
        }
      })();
    }, 4000);
    return () => {
      clearInterval(fremdrift);
      clearInterval(poll);
    };
  }, [tilstand, hentResultat]);

  async function sendFoto(fil: File) {
    setTilstand({ fase: "sender" });
    try {
      const form = new FormData();
      form.set("foto", fil);
      if (captchaToken.current) form.set("captcha", captchaToken.current);
      form.set(
        "skaerm",
        `${window.screen.width}x${window.screen.height}x${window.devicePixelRatio}`,
      );
      const svar = await fetch("/api/prov", { method: "POST", body: form });
      const data = (await svar.json()) as {
        token?: string;
        forventetSekunder?: number;
        fejl?: string;
        aarsag?: string;
      };
      if (!svar.ok) {
        // Blokeringer (lukket/budget/allerede brugt) er endelige — validerings-
        // og captcha-fejl kan rettes med et nyt forsøg (frisk token ved retry)
        if (data.aarsag && data.aarsag !== "captcha") {
          setTilstand({ fase: "blokeret", besked: data.fejl ?? da.prov.fejlLukket });
        } else {
          setTilstand({
            fase: "fejlet",
            besked: data.fejl ?? da.prov.fejlGenerering,
            kanProeveIgen: true,
            taellerRetry: false,
          });
        }
        return;
      }
      setTilstand({
        fase: "venter",
        token: data.token!,
        startetMs: Date.now(),
        forventetSekunder: data.forventetSekunder ?? 90,
      });
      setProcent(0);
    } catch {
      setTilstand({
        fase: "fejlet",
        besked: da.prov.fejlGenerering,
        kanProeveIgen: true,
        taellerRetry: false,
      });
    }
  }

  return (
    <div>
      <div ref={turnstileBoks} />

      {tilstand.fase === "start" || tilstand.fase === "sender" ? (
        <div className="flex flex-col gap-3">
          <input
            ref={filInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            hidden
            onChange={(e) => {
              const fil = e.target.files?.[0];
              if (fil) void sendFoto(fil);
              e.target.value = "";
            }}
          />
          <Button
            className="w-full py-5 text-lead"
            travl={tilstand.fase === "sender"}
            onClick={() => filInput.current?.click()}
          >
            {da.prov.uploadKnap}
          </Button>
          <p className="text-detalje text-tekst/60">{da.prov.uploadHjaelp}</p>
        </div>
      ) : null}

      {tilstand.fase === "venter" ? (
        <div aria-live="polite">
          <p className="text-titel font-medium">{da.prov.laverBillede}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-bloed bg-flade">
            <div
              className="h-full bg-primaer transition-all duration-1000"
              style={{ width: `${procent}%` }}
            />
          </div>
          <p className="mt-3 text-detalje text-tekst/70">
            {da.prov.laverBilledeDetalje(tilstand.forventetSekunder)}
          </p>
        </div>
      ) : null}

      {tilstand.fase === "resultat" ? (
        <ResultatVisning resultat={tilstand.resultat} />
      ) : null}

      {tilstand.fase === "blokeret" ? (
        <div className="rounded-bloed border border-kant bg-flade p-5">
          <p className="max-w-laesbar">{tilstand.besked}</p>
          <Link href="/log-ind" className="knap-link mt-5">
            {da.prov.blokeretCta}
          </Link>
        </div>
      ) : null}

      {tilstand.fase === "fejlet" ? (
        <div className="rounded-bloed border border-kant bg-flade p-5">
          <p role="alert" className="max-w-laesbar">
            {tilstand.besked}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {tilstand.hentToken ? (
              <Button
                variant="sekundaer"
                onClick={() => void hentResultat(tilstand.hentToken!)}
              >
                {da.prov.hentIgenKnap}
              </Button>
            ) : null}
            {tilstand.kanProeveIgen ? (
              <Button
                variant="sekundaer"
                onClick={() => {
                  if (tilstand.taellerRetry) harProevetIgen.current = true;
                  window.turnstile?.reset();
                  captchaToken.current = null;
                  setTilstand({ fase: "start" });
                }}
              >
                {da.prov.proevIgenKnap}
              </Button>
            ) : null}
            <Link href="/log-ind" className="soem-link text-primaer">
              {da.prov.blokeretCta}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultatVisning({ resultat }: { resultat: Resultat }) {
  // Låste stilarter: spejlet i BEGGE køn (ejer-ordre 25/8) + bøjle og
  // nærbillede — statiske katalogeksempler, intet endpoint at trigge
  const kategori = resultat.kategori ?? "";
  const spejlPar = spejlEksempelPar(kategori);
  const laasteStilarter = [
    { id: "spejl-dame", navn: da.prov.stilSpejlDame, billede: spejlPar.dame },
    { id: "spejl-herre", navn: da.prov.stilSpejlHerre, billede: spejlPar.herre },
    ...VISNINGS_TYPER.filter((v) => v.id !== trial.visningId && v.id !== "spejl").map(
      (v) => ({ id: v.id, navn: v.navn, billede: eksempelBillede(v.id, kategori) }),
    ),
  ];
  // Pladsholder-linjer for de skjulte 40 % — selve teksten er ALDRIG sendt
  // til klienten, så sløringen her er ren grafik, ikke skjult indhold
  const skjulteLinjer = Math.max(2, Math.min(6, Math.ceil(resultat.beskrivelseSkjulteTegn / 45)));

  return (
    <div aria-live="polite">
      <h2 className="font-display text-titel font-bold">{da.prov.resultatRubrik}</h2>

      {resultat.billedeUrl ? (
        <div className="mt-4 overflow-hidden rounded-bloed border border-kant">
          {/* Signeret, kortlivet URL — next/image kan ikke optimere den */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultat.billedeUrl} alt={resultat.titel} className="w-full" />
        </div>
      ) : null}
      <p className="mt-2 text-detalje text-tekst/60">{da.prov.vandmaerkeNote}</p>

      {/* Prisforslaget — wow-øjeblikket, vises fuldt ud */}
      <div className="mt-6 rounded-bloed border border-kant bg-flade p-5">
        <p className="text-detalje text-tekst/70">{da.prov.prisRubrik}</p>
        <p className="mt-1 font-mono text-display font-bold">
          {da.prov.pris(resultat.prisforslagDkk.fra, resultat.prisforslagDkk.til)}
        </p>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
          {resultat.prisBegrundelse}
        </p>
      </div>

      {/* Annonceteksten: 60 % synlig, resten som sløret grafik + lås */}
      <div className="mt-6">
        <p className="text-titel font-medium">{resultat.titel}</p>
        <p className="mt-2 max-w-laesbar whitespace-pre-wrap text-tekst/90">
          {resultat.beskrivelseSynlig}
          {resultat.beskrivelseSkjulteTegn > 0 ? " …" : ""}
        </p>
        {resultat.beskrivelseSkjulteTegn > 0 ? (
          <div className="relative mt-2" aria-hidden="true">
            <div className="flex flex-col gap-2 blur-[6px] select-none">
              {Array.from({ length: skjulteLinjer }, (_, i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-tekst/20"
                  style={{ width: `${90 - (i % 3) * 14}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-bloed bg-baggrund/90 px-3 py-1 text-detalje font-medium">
                🔒 {da.prov.beskrivelseSkjult}
              </span>
            </div>
          </div>
        ) : null}
        {resultat.soegeordSynlige.length > 0 ? (
          <p className="mt-3 text-detalje text-tekst/70">
            {resultat.soegeordSynlige.join(" · ")}
            {resultat.soegeordSkjulte > 0
              ? ` · ${da.prov.soegeordFlere(resultat.soegeordSkjulte)}`
              : ""}
          </p>
        ) : null}
      </div>

      {/* Låste stilarter (ejer-krav 25/8): REN visuel upsell — thumbnails er
          statiske katalogeksempler, og der findes intet endpoint at trigge */}
      <div className="mt-8">
        <p className="text-titel font-medium">{da.prov.laasteStilarter}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {laasteStilarter.map((stil) => (
            <Link
              key={stil.id}
              href="/log-ind"
              className="group relative overflow-hidden rounded-bloed border border-kant"
            >
              <Image
                src={stil.billede}
                alt={stil.navn}
                width={300}
                height={400}
                className="aspect-[3/4] w-full object-cover opacity-60"
              />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-koks/40 p-1 text-center">
                <span aria-hidden="true">🔒</span>
                <span className="text-detalje font-medium text-kalk">{stil.navn}</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-detalje text-tekst/60">{da.prov.laasLabel}</p>
      </div>

      {/* CTA: resultatet claimes automatisk ved signup via trial-cookien */}
      <div className="mt-8 rounded-bloed border border-primaer bg-flade p-5">
        <p className="text-titel font-medium">{da.prov.ctaRubrik}</p>
        <p className="mt-2 max-w-laesbar text-tekst/80">{da.prov.ctaFordele}</p>
        <Link href="/log-ind?videre=/oversigt" className="knap-link mt-4">
          {da.prov.cta}
        </Link>
        <p className="mt-3 text-detalje text-tekst/70">{da.prov.ctaNote}</p>
      </div>
    </div>
  );
}
