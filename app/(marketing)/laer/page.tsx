import Link from "next/link";
import { da } from "@/lib/copy/da";
import { hentGuides } from "@/lib/guides";

export const metadata = {
  title: `${da.laer.titel} · ${da.site.navn}`,
  description: da.laer.forklaring,
};

// Lær-sektionen (F-2): gratis guides — akkvisition og retention, ikke produktet.
export default function Laer() {
  const guides = hentGuides();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-kaempe font-bold uppercase">
        {da.laer.titel}
      </h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{da.laer.forklaring}</p>
      {/* Guide-kort med offset-skygge og nummererede rav-tal (REDESIGN §3.6) */}
      <ul className="mt-10 flex flex-col gap-5">
        {guides.map((guide, i) => (
          <li key={guide.slug}>
            <div className="kort-taktil flex items-start gap-4 p-4">
              <span
                aria-hidden="true"
                className="select-none font-mono text-hero font-bold leading-none text-rav"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="text-titel font-medium">
                  <Link href={`/laer/${guide.slug}`} className="soem-link">
                    {guide.titel}
                  </Link>
                </h2>
                <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
                  {guide.beskrivelse}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
