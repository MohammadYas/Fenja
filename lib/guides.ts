import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

// Lær-guides (F-2): markdown-filer i /content/guides med simpel frontmatter.
// Statisk indhold — læses ved build (generateStaticParams) og renderes med marked.

export type Guide = {
  slug: string;
  titel: string;
  beskrivelse: string;
  raekkefoelge: number;
  html: string;
};

const GUIDE_MAPPE = join(process.cwd(), "content/guides");

function parseFrontmatter(raa: string): { felter: Record<string, string>; krop: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raa);
  if (!match) return { felter: {}, krop: raa };
  const felter: Record<string, string> = {};
  for (const linje of match[1]!.split("\n")) {
    const kolon = linje.indexOf(":");
    if (kolon === -1) continue;
    const noegle = linje.slice(0, kolon).trim();
    const vaerdi = linje
      .slice(kolon + 1)
      .trim()
      .replace(/^"|"$/g, "");
    felter[noegle] = vaerdi;
  }
  return { felter, krop: match[2]! };
}

export function hentGuides(): Guide[] {
  return readdirSync(GUIDE_MAPPE)
    .filter((fil) => fil.endsWith(".md"))
    .map((fil) => {
      const { felter, krop } = parseFrontmatter(
        readFileSync(join(GUIDE_MAPPE, fil), "utf8"),
      );
      return {
        slug: fil.replace(/\.md$/, ""),
        titel: felter.titel ?? fil,
        beskrivelse: felter.beskrivelse ?? "",
        raekkefoelge: Number(felter.raekkefoelge ?? 99),
        html: marked.parse(krop, { async: false }),
      };
    })
    .sort((a, b) => a.raekkefoelge - b.raekkefoelge);
}

export function hentGuide(slug: string): Guide | null {
  return hentGuides().find((g) => g.slug === slug) ?? null;
}
