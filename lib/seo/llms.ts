// llms.txt (llmstxt.org-konventionen): en kort, faktuel beskrivelse af Selja
// til sprogmodeller — hvad produktet er, hvordan det virker, hvad det koster,
// og hvor de vigtigste sider ligger. Alt afledt af den faktiske config + copy,
// så filen aldrig kan komme til at love noget produktet ikke gør (fx gratis
// annoncer). Serveres på /llms.txt af app/llms.txt/route.ts.

import { abonnementer, kreditter, site } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { vinted } from "@/lib/copy/vinted";
import { hentGuides } from "@/lib/guides";

export function byggLlmsTxt(): string {
  const base = site.baseUrl;
  const trin = vinted.saadan.trin
    .map((t, i) => `${i + 1}. ${t.titel}: ${t.tekst}`)
    .join("\n");
  const vintedBrug = vinted.brugPaaVinted.punkter
    .map((punkt) => `- ${punkt}`)
    .join("\n");
  const priser = [
    ...abonnementer.tiers.map(
      (t) =>
        `- ${da.priserSide.abonnement.navne[t.id]}: ${t.annoncerPrMd} looks/md. — ${t.prisDkkPrMd} kr./md. eller ${t.prisDkkPrAar} kr./år`,
    ),
    ...kreditter.pakker.map(
      (p) =>
        `- Engangskøb "${da.kreditter.pakkeNavne[p.id] ?? p.id}": ${p.antal} kreditter for ${p.prisDkk} kr. (uden abonnement)`,
    ),
    `- Top-up (kun for abonnenter med tom saldo): ${kreditter.topUp.antal} looks for ${kreditter.topUp.prisDkk} kr.`,
  ].join("\n");
  const guides = hentGuides()
    .map((g) => `- [${g.titel}](${base}/laer/${g.slug}): ${g.beskrivelse}`)
    .join("\n");

  return `# ${da.site.navn}

> ${da.site.beskrivelse}

${da.site.navn} er en dansk, mobil-først web-app til private Vinted-sælgere. Man uploader 2-4 mobilfotos af et stykke tøj og får rensede salgsbilleder, en visualisering af tøjet båret i nordisk æstetik, og en færdig annoncetekst med prisforslag — klar til copy-paste på Vinted. Navnet er oldnordisk for "at sælge".

## Sådan virker det
${trin}

## ${vinted.brugPaaVinted.titel}
${vintedBrug}

## Priser
Abonnement er standardvejen — 1 kredit = 1 færdig annonce, kvoten fyldes hver måned, ubrugt kvote følger med. Uden binding. Løber man tør, findes en lille top-up. Kreditter gælder 12 måneder fra køb. Alle priser er med moms.
${priser}

## Ærlighed og compliance
- Ægte foto først: du lægger dit eget foto af tøjet som billede 1 på Vinted.
- Visualiseringer er AI-genererede og altid mærket (EU AI-forordningen art. 50) — de er et supplement, aldrig billede 1.
- Fejl og slid fremhæves i annonceteksten, aldrig skjult.
- Billeder bruges kun til din egen leverance: ingen træning, ingen deling.

## Guides (Lær)
${guides}

## Vigtige sider
- Forside: ${base}/
- Priser: ${base}/priser
- Lær (guides): ${base}/laer
- Log ind: ${base}/log-ind
- Vilkår: ${base}/vilkaar
- Privatliv: ${base}/privatliv

## Til virksomheder
${da.site.navn} Studio laver UGC-videoannoncer og annoncebilleder for danske virksomheder: ${base}/studio
`;
}
