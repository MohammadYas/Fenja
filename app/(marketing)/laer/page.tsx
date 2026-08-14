import Link from "next/link";
import { Card } from "@/components/ui/card";
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
      <h1 className="font-display text-display">{da.laer.titel}</h1>
      <p className="mt-2 max-w-laesbar text-tekst/80">{da.laer.forklaring}</p>
      <ul className="mt-8 flex flex-col gap-4">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Card>
              <h2 className="text-titel font-medium">
                <Link
                  href={`/laer/${guide.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {guide.titel}
                </Link>
              </h2>
              <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
                {guide.beskrivelse}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
