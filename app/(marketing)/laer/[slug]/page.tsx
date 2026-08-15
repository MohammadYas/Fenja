import Link from "next/link";
import { notFound } from "next/navigation";
import { da } from "@/lib/copy/da";
import { hentGuide, hentGuides } from "@/lib/guides";

export function generateStaticParams() {
  return hentGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = hentGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.titel} · ${da.site.navn}`,
    description: guide.beskrivelse,
  };
}

export default async function GuideSide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = hentGuide(slug);
  if (!guide) notFound();

  // Forrige/næste efter katalognummeret (U2) — så man kan læse serien igennem
  const guides = hentGuides();
  const indeks = guides.findIndex((g) => g.slug === slug);
  const forrige = indeks > 0 ? guides[indeks - 1]! : null;
  const naeste = indeks < guides.length - 1 ? guides[indeks + 1]! : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <nav>
        <Link href="/laer" className="soem-link inline-flex min-h-touch items-center font-medium">
          ← {da.laer.alleGuides}
        </Link>
      </nav>
      <header className="mt-6 flex items-baseline gap-4">
        <span
          aria-hidden="true"
          className="select-none font-mono text-display font-bold leading-none text-rav"
        >
          {String(guide.raekkefoelge).padStart(2, "0")}
        </span>
        <h1 className="font-display text-display font-bold">{guide.titel}</h1>
      </header>
      <article className="mt-8">
        {guide.blokke.map((blok, i) =>
          blok.type === "rubrik" ? (
            <h2 key={i} className="mt-8 text-titel font-medium">
              {blok.tekst}
            </h2>
          ) : blok.type === "afsnit" ? (
            <p key={i} className="mt-3 max-w-laesbar">
              {blok.tekst}
            </p>
          ) : blok.ordnet ? (
            <ol key={i} className="mt-3 flex max-w-laesbar list-decimal flex-col gap-1.5 pl-5">
              {blok.punkter.map((punkt) => (
                <li key={punkt}>{punkt}</li>
              ))}
            </ol>
          ) : (
            <ul key={i} className="mt-3 flex max-w-laesbar list-disc flex-col gap-1.5 pl-5">
              {blok.punkter.map((punkt) => (
                <li key={punkt}>{punkt}</li>
              ))}
            </ul>
          ),
        )}
      </article>
      {forrige || naeste ? (
        <nav className="mt-12 border-t border-kant pt-6" aria-label={da.laer.titel}>
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            {forrige ? (
              <Link href={`/laer/${forrige.slug}`} className="group max-w-xs">
                <span className="font-mono text-detalje font-bold tracking-wide text-tekst/60">
                  ← {da.laer.forrigeGuide}
                </span>
                <span className="soem-link mt-1 block font-medium group-hover:text-gran">
                  {forrige.titel}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {naeste ? (
              <Link href={`/laer/${naeste.slug}`} className="group max-w-xs sm:text-right">
                <span className="font-mono text-detalje font-bold tracking-wide text-tekst/60">
                  {da.laer.naesteGuide} →
                </span>
                <span className="soem-link mt-1 block font-medium group-hover:text-gran">
                  {naeste.titel}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
      <script
        type="application/ld+json"
        // Egen statisk frontmatter fra repoet — ikke brugerinput
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.titel,
            description: guide.beskrivelse,
            inLanguage: "da",
            author: { "@type": "Organization", name: da.site.navn },
          }),
        }}
      />
    </main>
  );
}
