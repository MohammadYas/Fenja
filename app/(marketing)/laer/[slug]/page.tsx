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

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <nav>
        <Link href="/laer" className="soem-link min-h-touch content-center font-medium">
          ← {da.laer.alleGuides}
        </Link>
      </nav>
      <header className="mt-6 flex items-baseline gap-4">
        <span
          aria-hidden="true"
          className="select-none font-mono text-hero font-bold leading-none text-rav"
        >
          {String(guide.raekkefoelge).padStart(2, "0")}
        </span>
        <h1 className="font-display text-display font-bold">{guide.titel}</h1>
      </header>
      <article
        className="prose-fenja mt-8"
        // Indholdet er egne statiske markdown-filer fra repoet — ikke brugerinput
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />
    </main>
  );
}
