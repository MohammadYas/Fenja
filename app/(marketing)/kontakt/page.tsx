import { KontaktForm } from "@/components/kontakt-form";
import { da } from "@/lib/copy/da";

// Offentlig kontaktside (ejer-ordre 21/8 nat) — ingen login krævet.
export const metadata = {
  title: `${da.kontaktSide.titel} · ${da.site.navn}`,
  description: da.kontaktSide.metaBeskrivelse,
  alternates: { canonical: "/kontakt" },
};

export default function Kontakt() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-display font-bold">{da.kontaktSide.titel}</h1>
      <p className="mt-4 max-w-laesbar text-tekst/80">{da.kontaktSide.forklaring}</p>
      <div className="mt-8">
        <KontaktForm />
      </div>
    </main>
  );
}
