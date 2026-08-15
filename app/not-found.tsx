import Link from "next/link";
import { da } from "@/lib/copy/da";

// 404 i plakat-stilen: kæmpe mono-tal i rav (samme greb som sådan-virker-det-
// tallene), ærlig besked og én vej videre. Ingen sjove metaforer — bare klarhed.
export default function IkkeFundet() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 py-16">
      <p
        aria-hidden="true"
        className="select-none font-mono text-plakat font-bold leading-none text-rav"
      >
        {da.fejlsider.ikkeFundetKode}
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-kaempe font-bold">
        {da.fejlsider.ikkeFundetTitel}
      </h1>
      <p className="mt-4 max-w-laesbar text-lead text-tekst/80">
        {da.fejlsider.ikkeFundetTekst}
      </p>
      <p className="mt-8">
        <Link
          href="/"
          className="inline-flex min-h-touch items-center rounded-bloed bg-primaer px-6 font-medium text-primaer-tekst shadow-offset-hoer transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset-hoer-loeft"
        >
          {da.fejlsider.ikkeFundetKnap}
        </Link>
      </p>
    </main>
  );
}
