import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { da } from "@/lib/copy/da";

export const metadata = { title: `${da.suppliers.titel} · ${da.site.navn}` };

export default function SuppliersPage() {
  return (
    <main className="py-6">
      <Badge>{da.suppliers.stempel}</Badge>
      <h1 className="mt-4 font-display text-kaempe font-bold">{da.suppliers.titel}</h1>
      <p className="mt-4 max-w-laesbar text-tekst/70">{da.suppliers.sideIntro}</p>

      <section
        aria-labelledby="supplier-fokus-titel"
        className="mt-8 rounded-bloed bg-gran p-5 text-kalk"
      >
        <h2 id="supplier-fokus-titel" className="font-display text-lead font-bold">
          {da.suppliers.fokusTitel}
        </h2>
        <p className="mt-3 text-hoer">{da.suppliers.fokusTekst}</p>
      </section>

      <Card className="mt-6">
        <h2 className="font-display text-lead font-bold">{da.suppliers.indholdTitel}</h2>
        <ul className="mt-4 space-y-3">
          {da.suppliers.indhold.map((punkt) => (
            <li key={punkt} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-gran">
                —
              </span>
              <span>{punkt}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Link
        href="/oversigt"
        className="soem-link mt-8 inline-flex min-h-touch items-center font-medium"
      >
        {da.suppliers.tilbage}
      </Link>
    </main>
  );
}
