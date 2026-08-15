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
      <article
        className="prose-fenja"
        // Indholdet er egne statiske markdown-filer fra repoet — ikke brugerinput
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />
    </main>
  );
}
