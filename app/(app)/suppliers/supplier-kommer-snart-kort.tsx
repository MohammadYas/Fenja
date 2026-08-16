import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { da } from "@/lib/copy/da";

export function SupplierKommerSnartKort() {
  return (
    <section
      aria-labelledby="supplier-teaser-titel"
      className="mt-6 rounded-bloed border border-kant bg-flade p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="supplier-teaser-titel" className="font-display text-lead font-bold">
          {da.suppliers.titel}
        </h2>
        <Badge>{da.suppliers.stempel}</Badge>
      </div>
      <p className="mt-3 max-w-laesbar text-tekst/70">{da.suppliers.kortTekst}</p>
      <Link
        href="/suppliers"
        className="soem-link mt-4 inline-flex min-h-touch items-center font-medium"
      >
        {da.suppliers.laesMere}
      </Link>
    </section>
  );
}
