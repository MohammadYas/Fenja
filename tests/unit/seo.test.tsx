import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/json-ld";
import { kreditter, site } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { vinted } from "@/lib/copy/vinted";
import { hentGuides } from "@/lib/guides";
import {
  basisGraf,
  forsideGraf,
  guideGraf,
  priserGraf,
} from "@/lib/seo/jsonld";
import { byggLlmsTxt } from "@/lib/seo/llms";

const BASE = site.baseUrl;

// Hjælper: find en node af en given @type i en @graph
function iGraf(graf: { "@graph"?: unknown[] }, type: string) {
  return (graf["@graph"] ?? []).find(
    (n) => (n as { "@type"?: string })["@type"] === type,
  ) as Record<string, unknown> | undefined;
}

describe("JSON-LD: site-wide graf (organisation + website)", () => {
  const graf = basisGraf() as { "@context": string; "@graph": unknown[] };

  it("har schema.org-kontekst og begge noder", () => {
    expect(graf["@context"]).toBe("https://schema.org");
    expect(iGraf(graf, "Organization")).toBeTruthy();
    expect(iGraf(graf, "WebSite")).toBeTruthy();
  });

  it("navn er Selja og url peger på base-domænet", () => {
    const org = iGraf(graf, "Organization")!;
    expect(org.name).toBe("Selja");
    expect(org.url).toBe(`${BASE}/`);
    expect(iGraf(graf, "WebSite")!.inLanguage).toBe("da-DK");
  });
});

describe("JSON-LD: forside (web-app + how-to)", () => {
  const graf = forsideGraf() as { "@graph": unknown[] };
  const app = iGraf(graf, "WebApplication")!;
  const howto = iGraf(graf, "HowTo")!;

  it("web-app bærer de rigtige kreditpriser i DKK (ingen opdigtede tal)", () => {
    const offers = app.offers as { price: string; priceCurrency: string }[];
    expect(offers).toHaveLength(kreditter.pakker.length);
    expect(offers.map((o) => o.price)).toEqual(
      kreditter.pakker.map((p) => String(p.prisDkk)),
    );
    expect(offers.every((o) => o.priceCurrency === "DKK")).toBe(true);
  });

  it("ingen falske ratings/reviews (manifest §2.1.6)", () => {
    expect(app.aggregateRating).toBeUndefined();
    expect(app.review).toBeUndefined();
  });

  it("how-to har ét trin pr. faktisk trin i copy", () => {
    const step = howto.step as unknown[];
    expect(step).toHaveLength(vinted.saadan.trin.length);
    expect((step[0] as { name: string }).name).toBe(vinted.saadan.trin[0]!.titel);
  });
});

describe("JSON-LD: guide (artikel + brødkrummer)", () => {
  const guide = hentGuides()[0]!;
  const graf = guideGraf(guide) as { "@graph": unknown[] };

  it("artiklen matcher guiden og ligger i Lær-sektionen", () => {
    const art = iGraf(graf, "Article")!;
    expect(art.headline).toBe(guide.titel);
    expect(art.url).toBe(`${BASE}/laer/${guide.slug}`);
  });

  it("brødkrummestien er Selja → Lær → guide", () => {
    const krumme = iGraf(graf, "BreadcrumbList")!;
    const led = krumme.itemListElement as { name: string }[];
    expect(led).toHaveLength(3);
    expect(led[0]!.name).toBe("Selja");
    expect(led[2]!.name).toBe(guide.titel);
  });
});

describe("JSON-LD: priser (produkt + tilbud)", () => {
  const graf = priserGraf() as Record<string, unknown>;

  it("er et produkt med ét tilbud pr. pakke, i DKK", () => {
    expect(graf["@type"]).toBe("Product");
    const offers = graf.offers as { price: string; priceCurrency: string }[];
    expect(offers).toHaveLength(kreditter.pakker.length);
    expect(offers.every((o) => o.priceCurrency === "DKK")).toBe(true);
  });
});

describe("JsonLd-komponenten", () => {
  it("renderer et ld+json-script og escaper < så copy ikke kan bryde ud", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ navn: "a</script><b>", type: "test" }} />,
    );
    expect(html).toContain('type="application/ld+json"');
    expect(html).not.toContain("</script><b>");
    expect(html).toContain("\\u003c");
  });
});

describe("llms.txt: findbarhed for sprogmodeller", () => {
  const txt = byggLlmsTxt();

  it("starter med produktnavn og resumé", () => {
    expect(txt.startsWith("# Selja")).toBe(true);
    expect(txt).toContain(da.site.beskrivelse);
  });

  it("lister de faktiske priser og lover ikke gratis annoncer", () => {
    for (const p of kreditter.pakker) {
      expect(txt).toContain(`${p.antal} annoncer: ${p.prisDkk} kr.`);
    }
    expect(txt).toContain("Ingen gratis annoncer");
  });

  it("peger på nøglesider og alle guides med base-URL", () => {
    expect(txt).toContain(`${BASE}/priser`);
    expect(txt).toContain(`${BASE}/laer`);
    for (const g of hentGuides()) {
      expect(txt).toContain(`${BASE}/laer/${g.slug}`);
    }
  });

  it("nævner AI-mærkning (compliance) og indeholder aldrig det gamle navn", () => {
    expect(txt).toContain("EU AI-forordningen");
    expect(txt.toLowerCase()).not.toContain("fenja");
  });
});
