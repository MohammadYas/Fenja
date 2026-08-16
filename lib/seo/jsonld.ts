// Struktureret data (schema.org / JSON-LD) — så søgemaskiner OG sprogmodeller
// kan forstå hvad Selja er, hvordan det virker og hvad det koster. ALLE felter
// er afledt af den faktiske config + copy (SELJA_DOMAIN, priser, guides, trin)
// — aldrig opdigtede tal, ratings eller reviews (manifest §2.1.6).

import { abonnementer, site } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { vinted } from "@/lib/copy/vinted";
import type { Guide } from "@/lib/guides";

const BASE = site.baseUrl;
const NAVN = da.site.navn;

// Stabile @id'er, så noder kan referere hinanden på tværs af sider
const ORG_ID = `${BASE}/#organisation`;
const WEBSITE_ID = `${BASE}/#website`;

const SCHEMA = "https://schema.org";

type Json = Record<string, unknown>;

export function organisationNode(): Json {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: NAVN,
    url: `${BASE}/`,
    description: da.site.beskrivelse,
    logo: `${BASE}/icon.svg`,
  };
}

export function webSiteNode(): Json {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: NAVN,
    url: `${BASE}/`,
    inLanguage: "da-DK",
    description: da.site.beskrivelse,
    publisher: { "@id": ORG_ID },
  };
}

/** Site-wide graf (organisation + website) — sættes i marketing-layoutet. */
export function basisGraf(): Json {
  return { "@context": SCHEMA, "@graph": [organisationNode(), webSiteNode()] };
}

function webApplicationNode(): Json {
  return {
    "@type": "WebApplication",
    name: NAVN,
    url: `${BASE}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "da-DK",
    description: vinted.meta.beskrivelse,
    provider: { "@id": ORG_ID },
    // Rigtige abonnementspriser (dansk B2C, DKK) — abonnement er standardvejen
    offers: abonnementOffers(),
  };
}

function hvordanVirkerNode(): Json {
  return {
    "@type": "HowTo",
    name: vinted.saadan.titel,
    inLanguage: "da-DK",
    description: da.site.beskrivelse,
    step: vinted.saadan.trin.map((trin, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: trin.titel,
      text: trin.tekst,
    })),
  };
}

/** Forsidens graf: produktet (som web-app med priser) + trin-for-trin how-to. */
export function forsideGraf(): Json {
  return { "@context": SCHEMA, "@graph": [webApplicationNode(), hvordanVirkerNode()] };
}

function broedkrummer(punkter: { navn: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: punkter.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.navn,
      item: p.url,
    })),
  };
}

/** Guide-graf: artikel + brødkrummesti (Selja → Lær → guide). */
export function guideGraf(guide: Guide): Json {
  const url = `${BASE}/laer/${guide.slug}`;
  return {
    "@context": SCHEMA,
    "@graph": [
      {
        "@type": "Article",
        headline: guide.titel,
        description: guide.beskrivelse,
        inLanguage: "da-DK",
        url,
        mainEntityOfPage: url,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: {
          "@type": "CollectionPage",
          name: da.laer.titel,
          url: `${BASE}/laer`,
        },
      },
      broedkrummer([
        { navn: NAVN, url: `${BASE}/` },
        { navn: da.laer.titel, url: `${BASE}/laer` },
        { navn: guide.titel, url },
      ]),
    ],
  };
}

// Abonnementerne som tilbud (md. + år pr. tier) — afledt af config + copy
function abonnementOffers(): Json[] {
  return abonnementer.tiers.flatMap((tier) => {
    const navn = da.priserSide.abonnement.navne[tier.id];
    return [
      {
        "@type": "Offer",
        name: `${NAVN} ${navn} — ${da.priserSide.abonnement.periodeMd.toLowerCase()}`,
        price: String(tier.prisDkkPrMd),
        priceCurrency: "DKK",
        availability: "https://schema.org/InStock",
        url: `${BASE}/priser`,
      },
      {
        "@type": "Offer",
        name: `${NAVN} ${navn} — ${da.priserSide.abonnement.periodeAar.toLowerCase()}`,
        price: String(tier.prisDkkPrAar),
        priceCurrency: "DKK",
        availability: "https://schema.org/InStock",
        url: `${BASE}/priser`,
      },
    ];
  });
}

/** Priser: abonnementerne som ét produkt med et tilbud pr. tier og periode. */
export function priserGraf(): Json {
  return {
    "@context": SCHEMA,
    "@type": "Product",
    name: `${NAVN} — abonnement`,
    description: da.priserSide.lead,
    brand: { "@id": ORG_ID },
    offers: abonnementOffers(),
  };
}
