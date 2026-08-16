import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";
import {
  byggDataeksport,
  eksportFilnavn,
  stierIItems,
  type RaaItem,
} from "@/lib/konto/eksport";

// GDPR art. 15/20: udtrækket skal indeholde ALT om den registrerede, være
// maskinlæsbart og forklare sig selv — og må ikke lække interne tal eller
// permanente links til den private bucket.

const BRUGER = "11111111-1111-1111-1111-111111111111";

function testItem(overrides: Partial<RaaItem> = {}): RaaItem {
  return {
    id: "item-1",
    created_at: "2026-08-10T09:00:00.000Z",
    status: "sold",
    brand: "Ganni",
    size: "M",
    condition: "God",
    category: "Striktrøje",
    defects_text: "lille hul ved venstre søm",
    purchase_price_dkk: 400,
    titel: "Ganni uldstrik · str. M",
    beskrivelse: "Blød uldstrik med lille hul ved venstre søm.",
    soegeord: ["ganni", "strik"],
    pris_fra_dkk: 200,
    pris_til_dkk: 260,
    pris_begrundelse: "Lignende Ganni-strik ligger typisk 200-260 kr.",
    leveret_at: "2026-08-10T09:03:00.000Z",
    solgt_at: "2026-08-14T18:00:00.000Z",
    sold_price_dkk: 240,
    item_photos: [
      {
        role: "full",
        original_url: `${BRUGER}/item-1/original-full.jpg`,
        cleaned_url: `${BRUGER}/item-1/renset-f1.jpg`,
      },
      { role: "label", original_url: `${BRUGER}/item-1/original-label.jpg`, cleaned_url: null },
    ],
    generations: [
      {
        kind: "onmodel",
        status: "succeeded",
        created_at: "2026-08-10T09:01:00.000Z",
        prompt_version: "lys-minimalisme@v1+overdel@v2+odense-villa@v2",
        fidelity_score: 0.82,
      },
    ],
    ...overrides,
  };
}

function eksport(items: RaaItem[] = [testItem()]) {
  return byggDataeksport({
    profil: {
      email: "saelger@example.dk",
      created_at: "2026-08-01T12:00:00.000Z",
      age_confirmed: true,
      home_anchor: "odense-villa",
    },
    items,
    kreditter: [
      {
        ts: "2026-08-01T12:05:00.000Z",
        delta: "15",
        reason: "purchase",
        source: "pack",
        expires_at: "2027-08-01T12:05:00.000Z",
        stripe_ref: "cs_test_123",
      },
      {
        ts: "2026-08-10T09:03:00.000Z",
        delta: "-1",
        reason: "delivery",
        source: null,
        expires_at: null,
        stripe_ref: null,
      },
    ],
    links: { [`${BRUGER}/item-1/original-full.jpg`]: "https://signeret/full" },
    eksporteret: "2026-08-16T20:00:00.000Z",
  });
}

describe("dataudtræk (GDPR art. 15/20)", () => {
  it("indeholder kontoen, annoncerne og hele kredithistorikken", () => {
    const fil = eksport();
    expect(fil.konto.email).toBe("saelger@example.dk");
    expect(fil.konto.aldersbekraeftet).toBe(true);
    expect(fil.konto.hjemPaaBilleder).toBe("odense-villa");
    expect(fil.annoncer).toHaveLength(1);
    expect(fil.kreditbevaegelser).toHaveLength(2);
  });

  it("tager annoncens indhold med — også fejlbeskrivelse og prisforslag", () => {
    const annonce = eksport().annoncer[0]!;
    expect(annonce.fejlbeskrivelse).toBe("lille hul ved venstre søm");
    expect(annonce.prisforslagDkk).toEqual({
      fra: 200,
      til: 260,
      begrundelse: "Lignende Ganni-strik ligger typisk 200-260 kr.",
    });
    expect(annonce.solgt).toEqual({ tidspunkt: "2026-08-14T18:00:00.000Z", prisDkk: 240 });
    expect(annonce.genereringer[0]?.promptVersion).toContain("odense-villa@v2");
  });

  it("delta læses som tal, uanset at Postgres leverer numeric som streng", () => {
    const bevaegelser = eksport().kreditbevaegelser;
    expect(bevaegelser.map((b) => b.aendring)).toEqual([-1, 15]);
  });

  it("sorterer nyeste først i både annoncer og kreditter", () => {
    const fil = eksport([
      testItem({ id: "gammel", created_at: "2026-07-01T09:00:00.000Z" }),
      testItem({ id: "ny", created_at: "2026-08-15T09:00:00.000Z" }),
    ]);
    expect(fil.annoncer.map((a) => a.id)).toEqual(["ny", "gammel"]);
    expect(fil.kreditbevaegelser[0]?.tidspunkt).toBe("2026-08-10T09:03:00.000Z");
  });

  it("leverer signerede links hvor de findes, og null hvor de mangler", () => {
    const fotos = eksport().annoncer[0]!.fotos;
    expect(fotos[0]?.link).toBe("https://signeret/full");
    expect(fotos[0]?.renset?.link).toBeNull();
    expect(fotos[1]?.link).toBeNull();
  });

  it("forklarer sig selv i filen (art. 12) og nævner de 5 års bilag", () => {
    const fil = eksport();
    expect(fil.omEksporten).toEqual(da.konto.data.omEksporten);
    expect(fil.omEksporten.join(" ")).toContain("bogføringsloven");
  });

  it("lækker ikke vores omkostning pr. generering", () => {
    expect(JSON.stringify(eksport())).not.toContain("cost");
  });

  it("stierIItems samler præcis de filer, der skal signeres", () => {
    expect(stierIItems([testItem()])).toEqual([
      `${BRUGER}/item-1/original-full.jpg`,
      `${BRUGER}/item-1/renset-f1.jpg`,
      `${BRUGER}/item-1/original-label.jpg`,
    ]);
  });

  it("tom konto giver en gyldig, tom fil", () => {
    const fil = byggDataeksport({
      profil: null,
      items: [],
      kreditter: [],
      links: {},
      eksporteret: "2026-08-16T20:00:00.000Z",
    });
    expect(fil.konto.email).toBeNull();
    expect(fil.konto.aldersbekraeftet).toBe(false);
    expect(fil.annoncer).toEqual([]);
    expect(fil.formatVersion).toBe(1);
  });

  it("filnavnet bærer datoen", () => {
    expect(eksportFilnavn("2026-08-16T20:00:00.000Z")).toBe("selja-mine-data-2026-08-16.json");
  });
});
