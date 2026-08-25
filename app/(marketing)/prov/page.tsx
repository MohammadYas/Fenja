import { da } from "@/lib/copy/da";
import { ProvKlient } from "./prov-klient";

// Gratis prøve uden konto (ejer-ordre 25/8): mobil-først — én stor upload-
// knap, ingen formularer, ingen e-mail. Linkes fra forsiden og TikTok-bio.
// Alle værn er server-side (/api/prov); siden her er kun skallen.
export const metadata = {
  title: `${da.prov.titel} · ${da.site.navn}`,
  description: da.prov.metaBeskrivelse,
  alternates: { canonical: "/prov" },
};

export default function Prov() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 md:py-16">
      <h1 className="font-display text-display font-bold">{da.prov.rubrik}</h1>
      <p className="mt-4 max-w-laesbar text-lead text-tekst/80">{da.prov.lead}</p>
      <div className="mt-8">
        <ProvKlient turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null} />
      </div>
    </main>
  );
}
