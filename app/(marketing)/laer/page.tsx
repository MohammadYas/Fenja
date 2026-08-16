import Link from "next/link";
import { da } from "@/lib/copy/da";
import { hentGuides } from "@/lib/guides";

export const metadata = {
  title: `${da.laer.titel} · ${da.site.navn}`,
  description: da.laer.forklaring,
  alternates: { canonical: "/laer" },
};

// Lær-sektionen (F-2) som katalog-indeks (S22): nummererede rækker adskilt af
// søm-linjer — en indholdsfortegnelse, ikke en kortstak. To spalter på store
// skærme, så siden bruger bredden.
export default function Laer() {
  const guides = hentGuides();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-kaempe font-bold">
        {da.laer.titel}
      </h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{da.laer.forklaring}</p>

      <ul className="mt-10 grid gap-x-16 lg:grid-cols-2">
        {guides.map((guide, i) => (
          <li key={guide.slug} className="border-b border-kant">
            <Link
              href={`/laer/${guide.slug}`}
              className="group flex items-baseline gap-5 py-5"
            >
              <span
                aria-hidden="true"
                className="select-none font-mono text-display font-bold leading-none text-rav"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="soem-link text-titel font-medium group-hover:text-primaer">
                  {guide.titel}
                </span>
                <span className="mt-1 block max-w-laesbar text-detalje text-tekst/70">
                  {guide.beskrivelse}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
