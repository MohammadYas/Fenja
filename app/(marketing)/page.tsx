import { da } from "@/lib/copy/da";

// Midlertidig side så scaffoldet bygger. Den rigtige landing page er S13
// og bygges efter DESIGN.md med ægte before/after som hero (F-1).
export default function Forside() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">{da.site.navn}</h1>
      <p className="mt-4">{da.site.beskrivelse}</p>
    </main>
  );
}
