// Dataudtræk til den registrerede (GDPR art. 15 indsigt + art. 20 dataportabilitet).
// Ren funktion: rækkerne hentes i ruten (RLS som brugeren selv), formes her og
// testes uden database. Formatet er JSON — maskinlæsbart som art. 20 kræver —
// men nøgler og forklaringer er på dansk, så filen også kan læses af et menneske
// (art. 12: kortfattet og letforståeligt).
//
// Bevidst UDE af filen: vores omkostning pr. generering (forretningsdata, ikke
// persondata) og selve billedfilerne. Fotos leveres som midlertidigt signerede
// links — bucket'en er privat, og et permanent link ville være et hul i NFR-6.

import { da } from "@/lib/copy/da";

export type RaaProfil = {
  email: string | null;
  created_at: string | null;
  age_confirmed: boolean | null;
  home_anchor: string | null;
};

export type RaaFoto = {
  role: string;
  original_url: string;
  cleaned_url: string | null;
};

export type RaaGenerering = {
  kind: string;
  status: string;
  created_at: string;
  prompt_version: string | null;
  fidelity_score: number | null;
};

export type RaaItem = {
  id: string;
  created_at: string;
  status: string;
  brand: string | null;
  size: string | null;
  condition: string | null;
  category: string | null;
  defects_text: string | null;
  purchase_price_dkk: number | null;
  titel: string | null;
  beskrivelse: string | null;
  soegeord: string[] | null;
  pris_fra_dkk: number | null;
  pris_til_dkk: number | null;
  pris_begrundelse: string | null;
  leveret_at: string | null;
  solgt_at: string | null;
  sold_price_dkk: number | null;
  item_photos: RaaFoto[] | null;
  generations: RaaGenerering[] | null;
};

export type RaaKredit = {
  ts: string;
  delta: number | string;
  reason: string;
  source: string | null;
  expires_at: string | null;
  stripe_ref: string | null;
};

export type EksportFoto = {
  rolle: string;
  fil: string;
  /** Midlertidigt signeret link; null hvis signeringen fejlede */
  link: string | null;
  renset: { fil: string; link: string | null } | null;
};

export type EksportAnnonce = {
  id: string;
  oprettet: string;
  status: string;
  maerke: string | null;
  stoerrelse: string | null;
  stand: string | null;
  kategori: string | null;
  fejlbeskrivelse: string | null;
  koebsprisDkk: number | null;
  titel: string | null;
  beskrivelse: string | null;
  soegeord: string[];
  prisforslagDkk: { fra: number | null; til: number | null; begrundelse: string | null } | null;
  leveret: string | null;
  solgt: { tidspunkt: string; prisDkk: number | null } | null;
  fotos: EksportFoto[];
  genereringer: {
    type: string;
    status: string;
    tidspunkt: string;
    promptVersion: string | null;
    troskabsScore: number | null;
  }[];
};

export type Dataeksport = {
  formatVersion: 1;
  eksporteret: string;
  omEksporten: string[];
  konto: {
    email: string | null;
    oprettet: string | null;
    aldersbekraeftet: boolean;
    hjemPaaBilleder: string | null;
  };
  annoncer: EksportAnnonce[];
  kreditbevaegelser: {
    tidspunkt: string;
    aendring: number;
    aarsag: string;
    kilde: string | null;
    udloeber: string | null;
    stripeReference: string | null;
  }[];
};

export type EksportInput = {
  profil: RaaProfil | null;
  items: RaaItem[];
  kreditter: RaaKredit[];
  /** storage-sti → signeret link (null når signeringen fejlede) */
  links: Record<string, string | null>;
  /** ISO-tidspunkt; sendes ind, så funktionen er ren og testbar */
  eksporteret: string;
};

function foto(raa: RaaFoto, links: EksportInput["links"]): EksportFoto {
  return {
    rolle: raa.role,
    fil: raa.original_url,
    link: links[raa.original_url] ?? null,
    renset: raa.cleaned_url
      ? { fil: raa.cleaned_url, link: links[raa.cleaned_url] ?? null }
      : null,
  };
}

function annonce(raa: RaaItem, links: EksportInput["links"]): EksportAnnonce {
  const harPrisforslag =
    raa.pris_fra_dkk !== null || raa.pris_til_dkk !== null || raa.pris_begrundelse !== null;
  return {
    id: raa.id,
    oprettet: raa.created_at,
    status: raa.status,
    maerke: raa.brand,
    stoerrelse: raa.size,
    stand: raa.condition,
    kategori: raa.category,
    fejlbeskrivelse: raa.defects_text,
    koebsprisDkk: raa.purchase_price_dkk,
    titel: raa.titel,
    beskrivelse: raa.beskrivelse,
    soegeord: raa.soegeord ?? [],
    prisforslagDkk: harPrisforslag
      ? {
          fra: raa.pris_fra_dkk,
          til: raa.pris_til_dkk,
          begrundelse: raa.pris_begrundelse,
        }
      : null,
    leveret: raa.leveret_at,
    solgt: raa.solgt_at ? { tidspunkt: raa.solgt_at, prisDkk: raa.sold_price_dkk } : null,
    fotos: (raa.item_photos ?? []).map((f) => foto(f, links)),
    genereringer: (raa.generations ?? []).map((g) => ({
      type: g.kind,
      status: g.status,
      tidspunkt: g.created_at,
      promptVersion: g.prompt_version,
      troskabsScore: g.fidelity_score === null ? null : Number(g.fidelity_score),
    })),
  };
}

/** Alle storage-stier i et sæt items — ruten signerer præcis dem, intet andet */
export function stierIItems(items: RaaItem[]): string[] {
  const stier = new Set<string>();
  for (const item of items) {
    for (const f of item.item_photos ?? []) {
      stier.add(f.original_url);
      if (f.cleaned_url) stier.add(f.cleaned_url);
    }
  }
  return [...stier];
}

export function byggDataeksport(input: EksportInput): Dataeksport {
  return {
    formatVersion: 1,
    eksporteret: input.eksporteret,
    omEksporten: [...da.konto.data.omEksporten],
    konto: {
      email: input.profil?.email ?? null,
      oprettet: input.profil?.created_at ?? null,
      aldersbekraeftet: input.profil?.age_confirmed === true,
      hjemPaaBilleder: input.profil?.home_anchor ?? null,
    },
    // Nyeste først — samme rækkefølge som brugeren kender fra oversigten
    annoncer: [...input.items]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((i) => annonce(i, input.links)),
    kreditbevaegelser: [...input.kreditter]
      .sort((a, b) => b.ts.localeCompare(a.ts))
      .map((k) => ({
        tidspunkt: k.ts,
        aendring: Number(k.delta),
        aarsag: k.reason,
        kilde: k.source,
        udloeber: k.expires_at,
        stripeReference: k.stripe_ref,
      })),
  };
}

/** Filnavn med dato, så flere udtræk kan ligge side om side i mappen */
export function eksportFilnavn(eksporteret: string): string {
  return `selja-mine-data-${eksporteret.slice(0, 10)}.json`;
}
