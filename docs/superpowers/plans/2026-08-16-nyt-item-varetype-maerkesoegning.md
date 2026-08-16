# Nyt item: varetype og mærkesøgning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Byg et nyt trin 1 på `/nyt-item`, hvor sælgeren vælger en bred modevaretype, og erstat browserens native mærkeliste med Seljas egen søgbare og tilgængelige combobox.

**Architecture:** Ét kanonisk katalog i `lib/data/varetyper.ts` deles af UI, API-validering og billedpipeline, mens den eksisterende databasekolonne `items.category` fortsat gemmer en entydig dansk kategoritekst. Mærkekatalog og rangering holdes som rene funktioner, interaktion ligger i fokuserede klientkomponenter, og pipelinen forsøger kanonisk opslag før det eksisterende keyword-fallback til gamle items.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Tailwind CSS 3, Vitest 3, React DOM server-rendering og den eksisterende Supabase-baserede item-route.

**Spec:** `docs/superpowers/specs/2026-08-16-nyt-item-varetype-maerkesoegning-design.md`

## Global Constraints

- Launch-kataloget omfatter voksen- og børnetøj, sko, tasker og accessories; bolig, elektronik, bøger, hobby og andre Vinted-kategorier må ikke tilføjes.
- `/nyt-item` forbliver én side med sektionerne `1 Hvad sælger du?`, `2 Fotos` og `3 Om varen`; der bygges ikke en wizard.
- Trin 1 må ikke vise ordene `AI` eller `kunstig intelligens`.
- Kataloget skal have præcis de 27 brede varetyper fra specen, stabile id'er og en entydig kanonisk `kategori`.
- Mærkefeltet må ikke bruge `datalist` og skal fortsat acceptere fri tekst samt det eksplicitte valg `Intet mærke`.
- Mærkesøgningen skal indeholde mindst 300 unikke modebrands, returnere højst 10 forslag og rangere eksakt match før start-match, ord-start og delmatch.
- Klienten sender `varetypeId`; serveren validerer id'et og gemmer katalogets `kategori` i det eksisterende `items.category`-felt. Der laves ingen databasemigration.
- Manglende eller ukendt varetype skal stoppe indsendelsen før upload og give HTTP 400 på API'et.
- Gamle fritekstkategorier skal fortsat virke via pipeline-fallback.
- Børne- og babyvarer skal altid bruge produktvisning uden person; sko, accessories samt undertøj og nattøj bruger også produktvisning.
- Ejerens kommende Gemini-promptbibliotek indlæses i en særskilt leverance; denne plan etablerer kun stabile promptfamilier og sikker routing.
- Kreditpriser, kreditregnskab, kontakt/admin og supplier-butik ændres ikke i denne leverance.
- Al ny brugervendt dansk tekst skal ligge i `lib/copy/da.ts`.
- Ingen ny runtime-afhængighed må tilføjes.
- Implementeringen følger red-green-refactor, og hvert task-commit må kun indeholde de filer, tasken nævner.

## File Map

- Create `lib/data/varetyper.ts` — typer, de fem grupper, de 27 varetyper og rene opslag.
- Modify `lib/data/maerker.ts` — mindst 300 brands, populære mærker, normalisering og rangeret søgning.
- Create `components/varetype-vaelger.tsx` — gruppetrin og varetypevalg med valgt tilstand og fokusmål.
- Create `components/maerke-combobox.tsx` — fri tekst, forslag, tastaturstyring og ARIA.
- Modify `app/(app)/nyt-item/page.tsx` — tre sektioner, klientvalidering og `varetypeId` i request body.
- Modify `lib/copy/da.ts` — al tekst til varetypevælger og mærke-combobox.
- Create `lib/items/nyt-item-input.ts` — ren servervalidering og mapping til kanonisk kategori.
- Modify `app/api/items/route.ts` — brug valideringsfunktionen og gem den kanoniske kategori.
- Modify `lib/pipeline/skabeloner.ts` — kanonisk promptfamilie før legacy-fallback og produkt-only prompt.
- Create `tests/unit/varetyper.test.ts` — katalogets invariants og opslag.
- Create `tests/unit/maerker.test.ts` — normalisering, rangering, populære mærker og grænser.
- Create `tests/unit/nyt-item-form.test.tsx` — sektioner, vælger, combobox-markup og tastaturindeks.
- Create `tests/unit/nyt-item-input.test.ts` — API-felters validering og kategori-mapping.
- Create `tests/unit/items-route.test.ts` — HTTP 400-kontrakten for ukendt varetype.
- Modify `tests/unit/skabeloner.test.ts` — kanoniske mappings, produkt-only sikkerhed og legacy-fallback.

---

### Task 1: Kanonisk modekatalog

**Files:**
- Create: `lib/data/varetyper.ts`
- Test: `tests/unit/varetyper.test.ts`

**Interfaces:**
- Produces: `VareGruppeId`, `PromptFamilie`, `VareGruppe`, `Varetype`, `VAREGRUPPER`, `VARETYPER`, `hentVaretype(id)`, `hentVaretyperForGruppe(gruppeId)` og `hentVaretypeFraKategori(kategori)`.
- Consumes: Ingen nye moduler; dette er den fælles kilde, som Task 3–5 importerer.

- [ ] **Step 1: Skriv den fejlende katalogtest**

Opret `tests/unit/varetyper.test.ts`:

~~~ts
import { describe, expect, it } from "vitest";
import {
  VAREGRUPPER,
  VARETYPER,
  hentVaretype,
  hentVaretypeFraKategori,
  hentVaretyperForGruppe,
  type PromptFamilie,
} from "@/lib/data/varetyper";

const PROMPTFAMILIER: readonly PromptFamilie[] = [
  "overdel",
  "underdel",
  "kjole",
  "overtoej",
  "sport-bad",
  "undertoej-nattoej",
  "sko",
  "taske",
  "accessory",
  "barn-produkt",
];

describe("varetypekatalog", () => {
  it("har fem grupper og præcis 27 brede varetyper", () => {
    expect(VAREGRUPPER.map((gruppe) => gruppe.id)).toEqual([
      "toej",
      "sko",
      "tasker",
      "accessories",
      "boern-baby",
    ]);
    expect(VARETYPER).toHaveLength(27);
  });

  it("har unikke id'er og kanoniske kategorier", () => {
    expect(new Set(VARETYPER.map((varetype) => varetype.id)).size).toBe(27);
    expect(new Set(VARETYPER.map((varetype) => varetype.kategori)).size).toBe(27);
  });

  it("refererer kun til kendte grupper og promptfamilier", () => {
    const gruppeIds = new Set(VAREGRUPPER.map((gruppe) => gruppe.id));
    for (const varetype of VARETYPER) {
      expect(gruppeIds.has(varetype.gruppeId)).toBe(true);
      expect(PROMPTFAMILIER).toContain(varetype.promptFamilie);
    }
  });

  it("returnerer gruppens egne varetyper i katalogrækkefølge", () => {
    expect(hentVaretyperForGruppe("sko").map((varetype) => varetype.label)).toEqual([
      "Sneakers",
      "Sko",
      "Støvler",
      "Sandaler",
    ]);
    expect(hentVaretyperForGruppe("ukendt")).toEqual([]);
  });

  it("giver hver af de fem grupper mindst én af sine egne varetyper", () => {
    for (const gruppe of VAREGRUPPER) {
      const varetyper = hentVaretyperForGruppe(gruppe.id);
      expect(varetyper.length).toBeGreaterThan(0);
      expect(varetyper.every((varetype) => varetype.gruppeId === gruppe.id)).toBe(
        true,
      );
    }
  });

  it("slår id og kanonisk kategori op", () => {
    expect(hentVaretype("boern-toej")).toMatchObject({
      label: "Tøj",
      kategori: "Børne- og babytøj",
      promptFamilie: "barn-produkt",
    });
    expect(hentVaretypeFraKategori(" Børne- og babytøj ")?.id).toBe("boern-toej");
    expect(hentVaretype("ukendt")).toBeUndefined();
    expect(hentVaretypeFraKategori("gammel fritekst")).toBeUndefined();
  });
});
~~~

- [ ] **Step 2: Kør katalogtesten og bekræft den forventede fejl**

Run: `npm test -- tests/unit/varetyper.test.ts`

Expected: FAIL fordi `@/lib/data/varetyper` ikke findes.

- [ ] **Step 3: Implementer hele det kanoniske katalog**

Opret `lib/data/varetyper.ts`:

~~~ts
export type VareGruppeId =
  | "toej"
  | "sko"
  | "tasker"
  | "accessories"
  | "boern-baby";

export type PromptFamilie =
  | "overdel"
  | "underdel"
  | "kjole"
  | "overtoej"
  | "sport-bad"
  | "undertoej-nattoej"
  | "sko"
  | "taske"
  | "accessory"
  | "barn-produkt";

export type VareGruppe = {
  id: VareGruppeId;
  label: string;
};

export type Varetype = {
  id: string;
  label: string;
  kategori: string;
  gruppeId: VareGruppeId;
  promptFamilie: PromptFamilie;
};

export const VAREGRUPPER = [
  { id: "toej", label: "Tøj" },
  { id: "sko", label: "Sko" },
  { id: "tasker", label: "Tasker" },
  { id: "accessories", label: "Accessories" },
  { id: "boern-baby", label: "Børn og baby" },
] as const satisfies readonly VareGruppe[];

export const VARETYPER = [
  { id: "toppe-t-shirts", label: "Toppe og T-shirts", kategori: "Toppe og T-shirts", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "skjorter-bluser", label: "Skjorter og bluser", kategori: "Skjorter og bluser", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "strik-cardigans", label: "Strik og cardigans", kategori: "Strik og cardigans", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "sweatshirts-hoodies", label: "Sweatshirts og hoodies", kategori: "Sweatshirts og hoodies", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "bukser-jeans", label: "Bukser og jeans", kategori: "Bukser og jeans", gruppeId: "toej", promptFamilie: "underdel" },
  { id: "shorts", label: "Shorts", kategori: "Shorts", gruppeId: "toej", promptFamilie: "underdel" },
  { id: "nederdele", label: "Nederdele", kategori: "Nederdele", gruppeId: "toej", promptFamilie: "kjole" },
  { id: "kjoler-heldragter", label: "Kjoler og heldragter", kategori: "Kjoler og heldragter", gruppeId: "toej", promptFamilie: "kjole" },
  { id: "jakker-blazere-veste", label: "Jakker, blazere og veste", kategori: "Jakker, blazere og veste", gruppeId: "toej", promptFamilie: "overtoej" },
  { id: "frakker-overtoej", label: "Frakker og overtøj", kategori: "Frakker og overtøj", gruppeId: "toej", promptFamilie: "overtoej" },
  { id: "sportstoej", label: "Sportstøj", kategori: "Sportstøj", gruppeId: "toej", promptFamilie: "sport-bad" },
  { id: "badetoej", label: "Badetøj", kategori: "Badetøj", gruppeId: "toej", promptFamilie: "sport-bad" },
  { id: "undertoej-nattoej", label: "Undertøj og nattøj", kategori: "Undertøj og nattøj", gruppeId: "toej", promptFamilie: "undertoej-nattoej" },
  { id: "sneakers", label: "Sneakers", kategori: "Sneakers", gruppeId: "sko", promptFamilie: "sko" },
  { id: "sko", label: "Sko", kategori: "Sko", gruppeId: "sko", promptFamilie: "sko" },
  { id: "stoevler", label: "Støvler", kategori: "Støvler", gruppeId: "sko", promptFamilie: "sko" },
  { id: "sandaler", label: "Sandaler", kategori: "Sandaler", gruppeId: "sko", promptFamilie: "sko" },
  { id: "haand-skuldertasker", label: "Hånd- og skuldertasker", kategori: "Hånd- og skuldertasker", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "rygsaekke", label: "Rygsække", kategori: "Rygsække", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "andre-tasker", label: "Andre tasker", kategori: "Andre tasker", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "baelter-toerklaeder-hovedbeklaedning", label: "Bælter, tørklæder og hovedbeklædning", kategori: "Bælter, tørklæder og hovedbeklædning", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "smykker-ure-solbriller", label: "Smykker, ure og solbriller", kategori: "Smykker, ure og solbriller", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "andre-accessories", label: "Andre accessories", kategori: "Andre accessories", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "boern-toej", label: "Tøj", kategori: "Børne- og babytøj", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-overtoej", label: "Overtøj", kategori: "Børne- og babyovertøj", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-sko", label: "Sko", kategori: "Børne- og babysko", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-accessories", label: "Accessories", kategori: "Børne- og babyaccessories", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
] as const satisfies readonly Varetype[];

export function hentVaretype(id: string | null | undefined): Varetype | undefined {
  return VARETYPER.find((varetype) => varetype.id === id);
}

export function hentVaretyperForGruppe(gruppeId: string): readonly Varetype[] {
  return VARETYPER.filter((varetype) => varetype.gruppeId === gruppeId);
}

export function hentVaretypeFraKategori(
  kategori: string | null | undefined,
): Varetype | undefined {
  const normaliseret = (kategori ?? "").trim().toLocaleLowerCase("da");
  return VARETYPER.find(
    (varetype) => varetype.kategori.toLocaleLowerCase("da") === normaliseret,
  );
}
~~~

- [ ] **Step 4: Kør katalogtesten og typecheck**

Run: `npm test -- tests/unit/varetyper.test.ts`

Expected: PASS med 5 tests.

Run: `npm run typecheck`

Expected: PASS uden TypeScript-fejl.

- [ ] **Step 5: Commit kataloget**

~~~powershell
git add lib/data/varetyper.ts tests/unit/varetyper.test.ts
git commit -m "feat: add canonical fashion item catalog"
~~~

---

### Task 2: Rangeret mærkesøgning med mindst 300 brands

**Files:**
- Modify: `lib/data/maerker.ts`
- Test: `tests/unit/maerker.test.ts`

**Interfaces:**
- Consumes: `VareGruppeId` fra `lib/data/varetyper.ts`.
- Produces: `MAERKER: readonly string[]`, `POPULAERE_MAERKER: Record<VareGruppeId, readonly string[]>`, `normaliserMaerkeSoegning(input: string): string` og `soegMaerker(query: string, gruppeId?: VareGruppeId, limit?: number): string[]`.

- [ ] **Step 1: Skriv fejlende tests for katalog, normalisering og rangering**

Opret `tests/unit/maerker.test.ts`:

~~~ts
import { describe, expect, it } from "vitest";
import {
  MAERKER,
  POPULAERE_MAERKER,
  normaliserMaerkeSoegning,
  soegMaerker,
} from "@/lib/data/maerker";
import { VAREGRUPPER } from "@/lib/data/varetyper";

describe("mærkekatalog", () => {
  it("har mindst 300 unikke, alfabetisk eksponerede mærker", () => {
    expect(MAERKER.length).toBeGreaterThanOrEqual(300);
    expect(new Set(MAERKER).size).toBe(MAERKER.length);
    expect(MAERKER).toEqual([...MAERKER].sort((a, b) => a.localeCompare(b, "da")));
  });

  it("har otte eksisterende populære mærker for hver gruppe", () => {
    for (const gruppe of VAREGRUPPER) {
      expect(POPULAERE_MAERKER[gruppe.id]).toHaveLength(8);
      for (const maerke of POPULAERE_MAERKER[gruppe.id]) {
        expect(MAERKER).toContain(maerke);
      }
    }
  });
});

describe("normaliserMaerkeSoegning", () => {
  it.each([
    ["Samsøe & Samsøe", "samsoe samsoe"],
    ["Levi's", "levis"],
    ["RÉSUMÉ", "resume"],
    ["  Marc   O’Polo ", "marc opolo"],
  ])("%s bliver %s", (input, forventet) => {
    expect(normaliserMaerkeSoegning(input)).toBe(forventet);
  });
});

describe("soegMaerker", () => {
  it("finder danske bogstaver, apostroffer og kompakt tegnsætning", () => {
    expect(soegMaerker("samsoe")).toContain("Samsøe Samsøe");
    expect(soegMaerker("levis")).toContain("Levi's");
    expect(soegMaerker("hm")).toContain("H&M");
    expect(soegMaerker("resume")).toContain("Résumé");
  });

  it("rangerer eksakt før start, ord-start og delmatch", () => {
    expect(soegMaerker("Nike")[0]).toBe("Nike");
    expect(soegMaerker("Ralph")[0]).toBe("Ralph Lauren");
    expect(soegMaerker("Lauren").indexOf("Ralph Lauren")).toBeLessThan(
      soegMaerker("Lauren").indexOf("Polo Ralph Lauren"),
    );
  });

  it("viser gruppens populære mærker ved tom søgning", () => {
    expect(soegMaerker("", "boern-baby")).toEqual(
      POPULAERE_MAERKER["boern-baby"],
    );
    expect(soegMaerker("  ", "sko")).toEqual(POPULAERE_MAERKER.sko);
  });

  it("returnerer aldrig flere end ti og kan returnere ingen", () => {
    expect(soegMaerker("a", "toej", 50).length).toBeLessThanOrEqual(10);
    expect(soegMaerker("ikke-et-rigtigt-maerke")).toEqual([]);
  });
});
~~~

- [ ] **Step 2: Kør mærketesten og bekræft de forventede fejl**

Run: `npm test -- tests/unit/maerker.test.ts`

Expected: FAIL fordi det nuværende katalog har langt under 300 mærker og ikke eksporterer søgefunktionerne.

- [ ] **Step 3: Erstat mærkedata med det kuraterede katalog**

Erstat `lib/data/maerker.ts` med nedenstående katalog. `MAERKE_NAVNE` er den komplette liste til denne leverance; runtime deduplikerer og sorterer den med dansk locale:

~~~ts
import type { VareGruppeId } from "@/lib/data/varetyper";

const MAERKE_NAVNE = [
  "A.P.C.",
  "Abercrombie & Fitch",
  "Acne Studios",
  "Adax",
  "Adidas",
  "Adolfo Dominguez",
  "Aerie",
  "Aigle",
  "Alaïa",
  "Alberta Ferretti",
  "Aldo",
  "Alexander McQueen",
  "Alexander Wang",
  "AllSaints",
  "Alo Yoga",
  "American Eagle",
  "American Vintage",
  "Ami Paris",
  "Anine Bing",
  "Anna Field",
  "Anne Klein",
  "Anthropologie",
  "Armani Exchange",
  "ARKET",
  "Asics",
  "ASOS Design",
  "Aspesi",
  "Atelier Rêve",
  "Axel Arigato",
  "Ba&sh",
  "Balenciaga",
  "Bally",
  "Banana Republic",
  "Barbour",
  "Baum und Pferdgarten",
  "Bec & Bridge",
  "Bellerose",
  "Benetton",
  "Bershka",
  "Birkenstock",
  "Björn Borg",
  "Blauer",
  "Blundstone",
  "Boden",
  "Bogner",
  "Bonpoint",
  "Boohoo",
  "Bottega Veneta",
  "Bruuns Bazaar",
  "Brunello Cucinelli",
  "Burberry",
  "By Malene Birger",
  "BZR",
  "C&A",
  "Calvin Klein",
  "Canada Goose",
  "Carhartt WIP",
  "Carolina Herrera",
  "Cartier",
  "Casio",
  "Cecilie Bahnsen",
  "Champion",
  "Chanel",
  "Chloé",
  "Christian Dior",
  "Citizens of Humanity",
  "Clarks",
  "Coach",
  "Columbia",
  "Comme des Garçons",
  "Converse",
  "Copenhagen Muse",
  "COS",
  "Costume National",
  "Crocs",
  "Damson Madder",
  "Daniel Wellington",
  "Day Birger et Mikkelsen",
  "Depeche",
  "Desigual",
  "Dickies",
  "Diesel",
  "Dior",
  "DKNY",
  "Dolce & Gabbana",
  "Dr. Martens",
  "Dries Van Noten",
  "Dsquared2",
  "Dune London",
  "Dyrberg/Kern",
  "Ecco",
  "Edited",
  "Ellesse",
  "Ellos",
  "Emporio Armani",
  "Enamel Copenhagen",
  "Envii",
  "Esprit",
  "Etro",
  "Everlane",
  "Fabletics",
  "Fabienne Chapot",
  "Faithfull the Brand",
  "Falke",
  "Fendi",
  "Filippa K",
  "Fjällräven",
  "Forever 21",
  "Forever New",
  "Fossil",
  "Free People",
  "French Connection",
  "Furla",
  "G-Star Raw",
  "Ganni",
  "Gant",
  "Gap",
  "Garcia",
  "Georg Jensen",
  "Gestuz",
  "Gina Tricot",
  "Givenchy",
  "Golden Goose",
  "Gucci",
  "Guess",
  "Gymshark",
  "H&M",
  "Han Kjøbenhavn",
  "Helly Hansen",
  "Hermès",
  "Herno",
  "Hoka",
  "Hollister",
  "Hope",
  "Hummel",
  "Hugo",
  "Hugo Boss",
  "Hvisk",
  "Ichi",
  "Ilse Jacobsen",
  "InWear",
  "Isabel Marant",
  "Ivy Copenhagen",
  "Jack & Jones",
  "Jack Wolfskin",
  "Jacob Cohën",
  "Jaded London",
  "JDY",
  "Jil Sander",
  "Jimmy Choo",
  "JJXX",
  "Joha",
  "Joseph",
  "Juicy Couture",
  "Julie Sandlau",
  "Just Female",
  "Kaffe",
  "Karl Kani",
  "Karl Lagerfeld",
  "Kappa",
  "Karen by Simonsen",
  "Kate Spade",
  "Kenzo",
  "Khaite",
  "Kiomi",
  "KnowledgeCotton Apparel",
  "Konges Sløjd",
  "Kookai",
  "Lacoste",
  "Lala Berlin",
  "Lanvin",
  "Lee",
  "Levi's",
  "Levete Room",
  "Liewood",
  "Lindex",
  "Liu Jo",
  "Loewe",
  "Longchamp",
  "Loro Piana",
  "Love Moschino",
  "Lululemon",
  "Mads Nørgaard",
  "Maanesten",
  "Maje",
  "Mamalicious",
  "Mango",
  "Marc Jacobs",
  "Marc O'Polo",
  "Maria Black",
  "MarMar Copenhagen",
  "Markberg",
  "Marni",
  "Massimo Dutti",
  "Max Mara",
  "Maya Deluxe",
  "MbyM",
  "MCM",
  "Michael Kors",
  "Mini A Ture",
  "Minimum",
  "Miss Sixty",
  "Missguided",
  "Miu Miu",
  "Molo",
  "Moncler",
  "Monki",
  "Monsoon",
  "Moose Knuckles",
  "Morgan",
  "Moschino",
  "Moss Copenhagen",
  "Mother",
  "Moves",
  "Mulberry",
  "My Essential Wardrobe",
  "NAF NAF",
  "Nanushka",
  "Napapijri",
  "Name It",
  "New Balance",
  "New Era",
  "New Look",
  "Nike",
  "Noa Noa",
  "Noisy May",
  "Norr",
  "Norse Projects",
  "Núnoo",
  "Nümph",
  "Nué Notes",
  "Object",
  "Off-White",
  "Olga Berg",
  "On Running",
  "Only",
  "Only & Sons",
  "Opus",
  "Oscar de la Renta",
  "Oysho",
  "Pandora",
  "Patagonia",
  "Paul Smith",
  "Peak Performance",
  "Pepe Jeans",
  "Pernille Corydon",
  "Pieces",
  "Pilgrim",
  "Pinko",
  "Polo Ralph Lauren",
  "Prada",
  "Primark",
  "Proenza Schouler",
  "Puma",
  "Pull&Bear",
  "Quiksilver",
  "Rabens Saloner",
  "Rains",
  "Ralph Lauren",
  "Ray-Ban",
  "Reebok",
  "Reformation",
  "Reiss",
  "Remain Birger Christensen",
  "Reserved",
  "Résumé",
  "Rick Owens",
  "Rieker",
  "Rip Curl",
  "Rodebjer",
  "Rolex",
  "Rotate",
  "Roxy",
  "Russell Athletic",
  "Saint Laurent",
  "Saks Potts",
  "Samsøe Samsøe",
  "Sand Copenhagen",
  "Sandro",
  "Saucony",
  "Scotch & Soda",
  "Selected",
  "Selected Femme",
  "Selected Homme",
  "Sézane",
  "Sif Jakobs",
  "SisterS Point",
  "Skall Studio",
  "Skechers",
  "Sofie Schnoor",
  "Sorel",
  "Soulland",
  "Spanx",
  "Stine Goya",
  "Stone Island",
  "Stradivarius",
  "Stüssy",
  "Sui Ava",
  "Superdry",
  "Supreme",
  "Svea",
  "Swatch",
  "Ted Baker",
  "Teva",
  "The Kooples",
  "The North Face",
  "Tiger of Sweden",
  "Timberland",
  "Tommy Hilfiger",
  "Tommy Jeans",
  "Topshop",
  "Tory Burch",
  "Totême",
  "Triumph",
  "Tretorn",
  "True Religion",
  "UGG",
  "Under Armour",
  "Uniqlo",
  "Urban Outfitters",
  "Vagabond",
  "Valentino",
  "Vans",
  "Vero Moda",
  "Versace",
  "VILA",
  "Vince",
  "Vivienne Westwood",
  "VRS",
  "Weekday",
  "Wheat",
  "Whistles",
  "Wood Wood",
  "Woolrich",
  "Wrangler",
  "Y.A.S",
  "Y-3",
  "Yves Saint Laurent",
  "Zadig & Voltaire",
  "Zalando Essentials",
  "Zara",
  "Zimmermann",
  "Zizzi",
] as const;

export const MAERKER: readonly string[] = [...new Set(MAERKE_NAVNE)].sort(
  (a, b) => a.localeCompare(b, "da"),
);

export const POPULAERE_MAERKER: Record<VareGruppeId, readonly string[]> = {
  toej: ["H&M", "Zara", "Ganni", "Samsøe Samsøe", "Vero Moda", "COS", "ARKET", "Only"],
  sko: ["Nike", "Adidas", "New Balance", "Vans", "Converse", "Dr. Martens", "Birkenstock", "Ecco"],
  tasker: ["Longchamp", "Michael Kors", "Ganni", "Mulberry", "Rains", "Markberg", "Núnoo", "Hvisk"],
  accessories: ["Maanesten", "Pilgrim", "Ray-Ban", "Sui Ava", "Ganni", "H&M", "Zara", "Pieces"],
  "boern-baby": ["Name It", "Wheat", "Molo", "Hummel", "MarMar Copenhagen", "Konges Sløjd", "Liewood", "Mini A Ture"],
};
~~~

- [ ] **Step 4: Tilføj normalisering og den eksplicitte rangering**

Tilføj under kataloget i `lib/data/maerker.ts`:

~~~ts
export function normaliserMaerkeSoegning(input: string): string {
  return input
    .toLocaleLowerCase("da")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/&/g, " ")
    .replace(/['’\u0060]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

type RangeretMaerke = {
  navn: string;
  score: number;
};

function matchScore(navn: string, query: string): number | null {
  const normaliseret = normaliserMaerkeSoegning(navn);
  const kompakt = normaliseret.replace(/\s/g, "");
  const kompaktQuery = query.replace(/\s/g, "");

  if (normaliseret === query || kompakt === kompaktQuery) return 0;
  if (normaliseret.startsWith(query) || kompakt.startsWith(kompaktQuery)) return 1;
  if (normaliseret.split(" ").some((ord) => ord.startsWith(query))) return 2;
  if (normaliseret.includes(query) || kompakt.includes(kompaktQuery)) return 3;
  return null;
}

export function soegMaerker(
  query: string,
  gruppeId: VareGruppeId = "toej",
  limit = 10,
): string[] {
  const maks = Math.max(0, Math.min(10, limit));
  const normaliseretQuery = normaliserMaerkeSoegning(query);
  if (!normaliseretQuery) {
    return POPULAERE_MAERKER[gruppeId].slice(0, maks);
  }

  return MAERKER
    .map((navn): RangeretMaerke | null => {
      const score = matchScore(navn, normaliseretQuery);
      return score === null ? null : { navn, score };
    })
    .filter((resultat): resultat is RangeretMaerke => resultat !== null)
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.navn.length - b.navn.length ||
        a.navn.localeCompare(b.navn, "da"),
    )
    .slice(0, maks)
    .map((resultat) => resultat.navn);
}
~~~

- [ ] **Step 5: Kør mærketesten og katalogtesten**

Run: `npm test -- tests/unit/maerker.test.ts tests/unit/varetyper.test.ts`

Expected: PASS med alle katalog-, normaliserings- og rangeringscases; særligt `samsoe`, `levis`, `hm` og `resume`.

Run: `npm run typecheck`

Expected: PASS uden TypeScript-fejl.

- [ ] **Step 6: Commit mærkesøgningen**

~~~powershell
git add lib/data/maerker.ts tests/unit/maerker.test.ts
git commit -m "feat: add ranked brand search"
~~~

---

### Task 3: Trin 1, varetypevælger og Selja-combobox

**Files:**
- Create: `components/varetype-vaelger.tsx`
- Create: `components/maerke-combobox.tsx`
- Modify: `app/(app)/nyt-item/page.tsx`
- Modify: `lib/copy/da.ts`
- Test: `tests/unit/nyt-item-form.test.tsx`

**Interfaces:**
- Consumes: `VAREGRUPPER`, `hentVaretype` og `hentVaretyperForGruppe` fra Task 1; `soegMaerker` fra Task 2; eksisterende `SektionsMarkoer`, `Field`, `Button` og `vinted.standskala`.
- Produces: `VaretypeVaelger` med props `{ value: string; onChange(id: string): void; error?: string }` og et `HTMLDivElement`-ref, `MaerkeCombobox` med props `{ value: string; onChange(value: string): void; gruppeId?: VareGruppeId; required?: boolean }` samt `flytAktivIndeks(aktiv, retning, antal)`.
- Produces request body-feltet `varetypeId` fra `/nyt-item`; `kategori` sendes ikke længere fra browseren.

- [ ] **Step 1: Skriv fejlende markup- og tastaturtests**

Opret `tests/unit/nyt-item-form.test.tsx`:

~~~tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import NytItem from "@/app/(app)/nyt-item/page";
import {
  MaerkeCombobox,
  flytAktivIndeks,
} from "@/components/maerke-combobox";
import { VaretypeVaelger } from "@/components/varetype-vaelger";
import { da } from "@/lib/copy/da";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Nyt item-flow", () => {
  it("viser de tre sektioner i den rigtige rækkefølge", () => {
    const html = renderToStaticMarkup(<NytItem />);
    const trin1 = html.indexOf(da.nytItem.varetypeTitel);
    const trin2 = html.indexOf(da.nytItem.fotoTitel);
    const trin3 = html.indexOf(da.nytItem.felterTitel);

    expect(trin1).toBeGreaterThanOrEqual(0);
    expect(trin2).toBeGreaterThan(trin1);
    expect(trin3).toBeGreaterThan(trin2);
    expect(html).not.toContain("<datalist");
    expect(html).not.toContain('list="maerker"');
    expect(html).not.toContain(">Kategori<");
  });

  it("omtaler ikke genereringsteknologien i trin 1", () => {
    const trinEtCopy =
      da.nytItem.varetypeTitel + " " + da.nytItem.varetypeHjaelp;
    expect(trinEtCopy).not.toMatch(/\bAI\b|kunstig intelligens/i);
  });
});

describe("VaretypeVaelger", () => {
  it("viser alle fem grupper", () => {
    const html = renderToStaticMarkup(
      <VaretypeVaelger value="" onChange={() => undefined} />,
    );
    for (const label of ["Tøj", "Sko", "Tasker", "Accessories", "Børn og baby"]) {
      expect(html).toContain(label);
    }
  });
});

describe("MaerkeCombobox", () => {
  it("har Selja-markup, forslag og Intet mærke uden native datalist", () => {
    const html = renderToStaticMarkup(
      <MaerkeCombobox
        value=""
        gruppeId="toej"
        required
        onChange={() => undefined}
      />,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('role="listbox"');
    expect(html).toContain('role="option"');
    expect(html).toContain(da.nytItem.intetMaerke);
    expect(html).not.toContain("<datalist");
  });

  it("bevarer et mærke, som brugeren selv har skrevet", () => {
    const html = renderToStaticMarkup(
      <MaerkeCombobox
        value="Mit eget mærke"
        onChange={() => undefined}
      />,
    );
    expect(html).toContain('value="Mit eget mærke"');
  });

  it("flytter aktivt forslag med wrap-around", () => {
    expect(flytAktivIndeks(-1, 1, 4)).toBe(0);
    expect(flytAktivIndeks(3, 1, 4)).toBe(0);
    expect(flytAktivIndeks(0, -1, 4)).toBe(3);
    expect(flytAktivIndeks(0, 1, 0)).toBe(-1);
  });
});
~~~

- [ ] **Step 2: Kør formulartesten og bekræft importfejlene**

Run: `npm test -- tests/unit/nyt-item-form.test.tsx`

Expected: FAIL fordi `VaretypeVaelger` og `MaerkeCombobox` ikke findes.

- [ ] **Step 3: Byg varetypevælgeren som en fokuserbar klientkomponent**

Opret `components/varetype-vaelger.tsx`:

~~~tsx
"use client";

import { forwardRef, useState } from "react";
import { da } from "@/lib/copy/da";
import {
  VAREGRUPPER,
  hentVaretype,
  hentVaretyperForGruppe,
  type VareGruppeId,
} from "@/lib/data/varetyper";

type VaretypeVaelgerProps = {
  value: string;
  onChange: (id: string) => void;
  error?: string;
};

export const VaretypeVaelger = forwardRef<HTMLDivElement, VaretypeVaelgerProps>(
  function VaretypeVaelger({ value, onChange, error }, ref) {
    const valgtVaretype = hentVaretype(value);
    const [sidstValgteGruppe, setSidstValgteGruppe] =
      useState<VareGruppeId | null>(valgtVaretype?.gruppeId ?? null);
    const gruppeId = valgtVaretype?.gruppeId ?? sidstValgteGruppe;
    const varetyper = gruppeId ? hentVaretyperForGruppe(gruppeId) : [];

    function vaelgGruppe(nyGruppeId: VareGruppeId) {
      setSidstValgteGruppe(nyGruppeId);
      if (valgtVaretype?.gruppeId !== nyGruppeId) onChange("");
    }

    return (
      <div
        ref={ref}
        tabIndex={-1}
        role="group"
        aria-label={da.nytItem.varetypeTitel}
        aria-describedby={error ? "varetype-fejl" : undefined}
        className="rounded-bloed outline-none focus-visible:ring-2 focus-visible:ring-koks"
      >
        <fieldset>
          <legend className="text-basis font-medium">
            {da.nytItem.varetypeGruppeLabel}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {VAREGRUPPER.map((gruppe) => (
              <button
                key={gruppe.id}
                type="button"
                aria-pressed={gruppeId === gruppe.id}
                onClick={() => vaelgGruppe(gruppe.id)}
                className={
                  gruppeId === gruppe.id
                    ? "min-h-touch rounded-bloed border border-koks bg-koks px-4 text-basis text-hvid"
                    : "min-h-touch rounded-bloed border border-kant bg-baggrund px-4 text-basis"
                }
              >
                {gruppe.label}
              </button>
            ))}
          </div>
        </fieldset>

        {gruppeId ? (
          <fieldset className="mt-5">
            <legend className="text-basis font-medium">
              {da.nytItem.varetypeTypeLabel}
            </legend>
            <div role="radiogroup" className="mt-3 grid gap-2 sm:grid-cols-2">
              {varetyper.map((varetype) => (
                <button
                  key={varetype.id}
                  type="button"
                  role="radio"
                  aria-checked={value === varetype.id}
                  onClick={() => onChange(varetype.id)}
                  className={
                    value === varetype.id
                      ? "min-h-touch rounded-bloed border border-koks bg-koks px-4 py-3 text-left text-basis text-hvid"
                      : "min-h-touch rounded-bloed border border-kant bg-baggrund px-4 py-3 text-left text-basis"
                  }
                >
                  {varetype.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {valgtVaretype ? (
          <p aria-live="polite" className="mt-3 text-detalje text-tekst/75">
            {da.nytItem.varetypeValgt(valgtVaretype.label)}
          </p>
        ) : null}
        {error ? (
          <p id="varetype-fejl" role="alert" className="mt-3 text-detalje text-fejl">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
~~~

- [ ] **Step 4: Byg comboboxen med fri tekst, ARIA og tastaturstyring**

Opret `components/maerke-combobox.tsx`:

~~~tsx
"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { da } from "@/lib/copy/da";
import { soegMaerker } from "@/lib/data/maerker";
import type { VareGruppeId } from "@/lib/data/varetyper";

type MaerkeComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  gruppeId?: VareGruppeId;
  required?: boolean;
};

export function flytAktivIndeks(
  aktiv: number,
  retning: -1 | 1,
  antal: number,
): number {
  if (antal <= 0) return -1;
  if (aktiv < 0) return retning === 1 ? 0 : antal - 1;
  return (aktiv + retning + antal) % antal;
}

export function MaerkeCombobox({
  value,
  onChange,
  gruppeId = "toej",
  required = false,
}: MaerkeComboboxProps) {
  const inputId = useId();
  const listeId = useId();
  const [aaben, setAaben] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const resultater = soegMaerker(value, gruppeId);
  const aktivIndeks = aktiv < resultater.length ? aktiv : -1;

  function vaelg(navn: string) {
    onChange(navn);
    setAaben(false);
    setAktiv(-1);
  }

  function tastatur(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setAaben(true);
      setAktiv((indeks) =>
        flytAktivIndeks(
          indeks,
          event.key === "ArrowDown" ? 1 : -1,
          resultater.length,
        ),
      );
      return;
    }
    if (event.key === "Enter" && aaben && aktivIndeks >= 0) {
      event.preventDefault();
      vaelg(resultater[aktivIndeks]!);
      return;
    }
    if (event.key === "Escape") {
      setAaben(false);
      setAktiv(-1);
      return;
    }
    if (event.key === "Tab") setAaben(false);
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-basis font-medium">
        {da.nytItem.maerkeLabel}
      </label>
      <p id={inputId + "-hjaelp"} className="text-detalje text-tekst/70">
        {da.nytItem.maerkeHjaelp}
      </p>
      <input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aaben}
        aria-controls={listeId}
        aria-describedby={inputId + "-hjaelp"}
        aria-activedescendant={
          aaben && aktivIndeks >= 0
            ? listeId + "-option-" + aktivIndeks
            : undefined
        }
        autoComplete="off"
        required={required}
        value={value}
        placeholder={da.nytItem.maerkeSoegPlaceholder}
        onFocus={() => setAaben(true)}
        onBlur={() => setAaben(false)}
        onChange={(event) => {
          onChange(event.target.value);
          setAaben(true);
          setAktiv(-1);
        }}
        onKeyDown={tastatur}
        className="min-h-touch rounded-bloed border border-kant bg-baggrund px-3 text-basis"
      />

      <ul
        id={listeId}
        role="listbox"
        aria-label={da.nytItem.maerkeResultater}
        aria-hidden={!aaben}
        className={
          aaben
            ? "absolute top-full z-20 mt-1 max-h-64 w-full overflow-auto rounded-bloed border border-kant bg-baggrund p-1 shadow-lg"
            : "hidden"
        }
      >
        {resultater.map((navn, indeks) => (
          <li
            id={listeId + "-option-" + indeks}
            key={navn}
            role="option"
            aria-selected={indeks === aktivIndeks}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => vaelg(navn)}
            className={
              indeks === aktivIndeks
                ? "cursor-pointer rounded-stram bg-koks px-3 py-2 text-hvid"
                : "cursor-pointer rounded-stram px-3 py-2 hover:bg-hoer"
            }
          >
            {navn}
          </li>
        ))}
      </ul>

      {aaben && resultater.length === 0 ? (
        <p role="status" className="text-detalje text-tekst/70">
          {da.nytItem.maerkeIngenResultater}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => vaelg(da.nytItem.intetMaerke)}
        className="self-start text-detalje underline underline-offset-4"
      >
        {da.nytItem.intetMaerke}
      </button>
    </div>
  );
}
~~~

- [ ] **Step 5: Tilføj den præcise danske copy**

I `lib/copy/da.ts` ændres `da.nytItem` sådan:

~~~ts
nytItem: {
  titel: "Nyt item",
  forklaring:
    "Vælg hvad du sælger, tag 2–4 fotos, og få en færdig annonce på cirka 2 minutter.",
  varetypeTitel: "Hvad sælger du?",
  varetypeHjaelp:
    "Vælg først en gruppe og derefter den varetype, der passer bedst. Det giver en mere korrekt annonce.",
  varetypeGruppeLabel: "Vælg gruppe",
  varetypeTypeLabel: "Vælg varetype",
  varetypeValgt: (navn: string) => `Valgt: ${navn}`,
  fotoTitel: "Fotos",
  // Behold roller, tagFoto, skiftFoto og komprimerer; ret full.hjaelp:
  // "Hele varen på et jævnt underlag eller en bøjle. Det bliver billede 1 på Vinted."
  felterTitel: "Om varen",
  maerkeLabel: "Mærke",
  maerkeHjaelp:
    "Søg efter mærket, skriv det selv, eller vælg Intet mærke.",
  maerkeSoegPlaceholder: "Søg efter mærke",
  maerkeResultater: "Mærkeforslag",
  maerkeIngenResultater:
    "Ingen forslag — du kan stadig bruge det, du har skrevet.",
  intetMaerke: "Intet mærke",
  // Behold størrelse, stand, fejl, købspris, upload og rate-limit copy.
  fejlVaretypeMangler: "Vælg hvad du sælger i trin 1.",
  fejlFelterMangler: "Udfyld mærke, størrelse og stand.",
}
~~~

Fjern nøglerne `kategoriLabel` og `kategoriHjaelp`. Kommentarlinjerne i uddraget betyder, at de eksisterende navngivne felter bevares uændret; de er ikke ny logik eller ny tekst.

- [ ] **Step 6: Integrer trin 1 og fjern fritekstkategorien**

I `app/(app)/nyt-item/page.tsx`:

1. Fjern importen af `MAERKER`. Tilføj:

~~~tsx
import { MaerkeCombobox } from "@/components/maerke-combobox";
import { VaretypeVaelger } from "@/components/varetype-vaelger";
import { hentVaretype } from "@/lib/data/varetyper";
~~~

2. Erstat `kategori`-state med varetype-state og fokusref:

~~~tsx
const [varetypeId, setVaretypeId] = useState("");
const [varetypeFejl, setVaretypeFejl] = useState("");
const varetypeRef = useRef<HTMLDivElement>(null);
~~~

3. Valider i denne rækkefølge før `setTravl(true)` og før første upload:

~~~tsx
const varetype = hentVaretype(varetypeId);
if (!varetype) {
  setVaretypeFejl(da.nytItem.fejlVaretypeMangler);
  varetypeRef.current?.focus();
  return;
}
setVaretypeFejl("");

if (!fotos.full) {
  setFejl(da.nytItem.fejlHelhedMangler);
  return;
}
if (!maerke.trim() || !stoerrelse.trim() || !stand) {
  setFejl(da.nytItem.fejlFelterMangler);
  return;
}
~~~

4. Send `varetypeId` og fjern `kategori` fra JSON:

~~~tsx
body: JSON.stringify({
  kladdeId: kladdeId.current,
  maerke,
  stoerrelse,
  stand,
  varetypeId,
  fejlBeskrivelse: fejlTekst || undefined,
  koebsprisDkk: koebspris ? Number(koebspris) : undefined,
  fotos: uploads,
}),
~~~

5. Indsæt den nye første sektion før fotos, og renummerér de eksisterende markører:

~~~tsx
<section aria-label={da.nytItem.varetypeTitel}>
  <SektionsMarkoer nr={1} titel={da.nytItem.varetypeTitel} />
  <p className="mt-3 text-detalje text-tekst/70">
    {da.nytItem.varetypeHjaelp}
  </p>
  <div className="mt-4">
    <VaretypeVaelger
      ref={varetypeRef}
      value={varetypeId}
      error={varetypeFejl}
      onChange={(id) => {
        setVaretypeId(id);
        if (id) setVaretypeFejl("");
      }}
    />
  </div>
</section>

{/* Fotos bruger nu nr={2}. */}
{/* Om varen bruger nu nr={3}. */}
~~~

6. Erstat `Field list="maerker"` plus hele `datalist`-blokken med:

~~~tsx
<MaerkeCombobox
  value={maerke}
  gruppeId={hentVaretype(varetypeId)?.gruppeId}
  required
  onChange={setMaerke}
/>
~~~

7. Fjern hele det gamle `Field` med `kategoriLabel`. Behold størrelse, stand, fejl/slid og købspris.

- [ ] **Step 7: Kør den fokuserede UI-test og typecheck**

Run: `npm test -- tests/unit/nyt-item-form.test.tsx tests/unit/maerker.test.ts tests/unit/varetyper.test.ts`

Expected: PASS; server-renderet HTML indeholder tre trin og ARIA-roller, men ingen `datalist` eller kategori-input.

Run: `npm run typecheck`

Expected: PASS uden prop-, ref- eller copy-fejl.

- [ ] **Step 8: Commit formular-UI'et**

~~~powershell
git add components/varetype-vaelger.tsx components/maerke-combobox.tsx "app/(app)/nyt-item/page.tsx" lib/copy/da.ts tests/unit/nyt-item-form.test.tsx
git commit -m "feat: add item type first step and brand combobox"
~~~

---

### Task 4: Servervalidering og kanonisk kategori

**Files:**
- Create: `lib/items/nyt-item-input.ts`
- Modify: `app/api/items/route.ts`
- Test: `tests/unit/nyt-item-input.test.ts`
- Test: `tests/unit/items-route.test.ts`

**Interfaces:**
- Consumes: `hentVaretype(varetypeId)` fra Task 1 og `vinted.standskala`.
- Produces: `validerNytItemFelter(input): NytItemValidering`, hvor success indeholder trimmede `maerke`/`stoerrelse`, valideret `stand` og kanonisk `kategori`.
- Route-kontrakt: `POST /api/items` accepterer `varetypeId` i stedet for `kategori` og returnerer HTTP 400 med `da.nytItem.fejlVaretypeMangler` ved manglende eller ukendt id.

- [ ] **Step 1: Skriv fejlende tests for inputvalidering og HTTP 400**

Opret `tests/unit/nyt-item-input.test.ts`:

~~~ts
import { describe, expect, it } from "vitest";
import { validerNytItemFelter } from "@/lib/items/nyt-item-input";

describe("validerNytItemFelter", () => {
  it("mapper en gyldig varetype til dens kanoniske kategori og trimmer felter", () => {
    expect(
      validerNytItemFelter({
        varetypeId: "boern-toej",
        maerke: "  Name It ",
        stoerrelse: " 98 ",
        stand: "Rigtig god",
      }),
    ).toEqual({
      ok: true,
      felter: {
        maerke: "Name It",
        stoerrelse: "98",
        stand: "Rigtig god",
        kategori: "Børne- og babytøj",
      },
    });
  });

  it.each([undefined, "", "ukendt-varetype"])(
    "afviser manglende eller ukendt varetype: %s",
    (varetypeId) => {
      expect(
        validerNytItemFelter({
          varetypeId,
          maerke: "Ganni",
          stoerrelse: "M",
          stand: "God",
        }),
      ).toEqual({ ok: false, felt: "varetype" });
    },
  );

  it.each([
    { maerke: "", stoerrelse: "M", stand: "God" },
    { maerke: "Ganni", stoerrelse: "", stand: "God" },
    { maerke: "Ganni", stoerrelse: "M", stand: "Meget god" },
    { maerke: 42, stoerrelse: "M", stand: "God" },
  ])("afviser ugyldige øvrige felter: %o", (felter) => {
    expect(
      validerNytItemFelter({
        varetypeId: "kjoler-heldragter",
        ...felter,
      }),
    ).toEqual({ ok: false, felt: "felter" });
  });

  it("accepterer det eksplicitte valg Intet mærke", () => {
    expect(
      validerNytItemFelter({
        varetypeId: "andre-accessories",
        maerke: "Intet mærke",
        stoerrelse: "One size",
        stand: "Tilfredsstillende",
      }),
    ).toMatchObject({
      ok: true,
      felter: { maerke: "Intet mærke", kategori: "Andre accessories" },
    });
  });
});
~~~

Bemærk: `Meget god` er med vilje ugyldig; den aktuelle konfiguration bruger `Rigtig god`.

Opret også `tests/unit/items-route.test.ts`:

~~~ts
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { da } from "@/lib/copy/da";
import { POST } from "@/app/api/items/route";

vi.mock("@/lib/supabase/server", () => ({
  opretServerKlient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "bruger-1" } },
      }),
    },
  }),
}));

describe("POST /api/items", () => {
  it("svarer 400 ved et ukendt varetypeId", async () => {
    const request = new NextRequest("http://localhost/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kladdeId: "kladde-1",
        varetypeId: "ukendt-varetype",
        maerke: "Ganni",
        stoerrelse: "M",
        stand: "God",
        fotos: [
          {
            rolle: "full",
            sti: "bruger-1/kladde-1/full.jpg",
          },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      fejl: da.nytItem.fejlVaretypeMangler,
    });
  });
});
~~~

- [ ] **Step 2: Kør valideringstesten og bekræft importfejlen**

Run: `npm test -- tests/unit/nyt-item-input.test.ts tests/unit/items-route.test.ts`

Expected: FAIL fordi `@/lib/items/nyt-item-input` ikke findes, og routen endnu ikke bruger `varetypeId`.

- [ ] **Step 3: Implementer valideringen som en ren grænsefunktion**

Opret `lib/items/nyt-item-input.ts`:

~~~ts
import { vinted } from "@/lib/config";
import { hentVaretype } from "@/lib/data/varetyper";

export type NytItemFelterInput = {
  varetypeId?: unknown;
  maerke?: unknown;
  stoerrelse?: unknown;
  stand?: unknown;
};

export type NytItemValidering =
  | {
      ok: true;
      felter: {
        maerke: string;
        stoerrelse: string;
        stand: string;
        kategori: string;
      };
    }
  | { ok: false; felt: "varetype" | "felter" };

function trimTekst(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validerNytItemFelter(
  input: NytItemFelterInput,
): NytItemValidering {
  const varetype = hentVaretype(trimTekst(input.varetypeId));
  if (!varetype) return { ok: false, felt: "varetype" };

  const maerke = trimTekst(input.maerke);
  const stoerrelse = trimTekst(input.stoerrelse);
  const stand = trimTekst(input.stand);
  if (
    !maerke ||
    !stoerrelse ||
    !(vinted.standskala as readonly string[]).includes(stand)
  ) {
    return { ok: false, felt: "felter" };
  }

  return {
    ok: true,
    felter: {
      maerke,
      stoerrelse,
      stand,
      kategori: varetype.kategori,
    },
  };
}
~~~

- [ ] **Step 4: Lad item-routen bruge valideringsresultatet**

I `app/api/items/route.ts`:

1. Fjern `vinted` fra config-importen og tilføj:

~~~ts
import { validerNytItemFelter } from "@/lib/items/nyt-item-input";
~~~

2. Ret `NytItemKrop`, så browserkontrollerede felter valideres som `unknown`:

~~~ts
type NytItemKrop = {
  kladdeId: string;
  maerke?: unknown;
  stoerrelse?: unknown;
  stand?: unknown;
  varetypeId?: unknown;
  fejlBeskrivelse?: string;
  koebsprisDkk?: number;
  presetId?: string;
  fotos: { rolle: string; sti: string }[];
};
~~~

3. Behold helhedsfoto-tjekket og erstat de nuværende mærke-, størrelse-, kategori- og stand-tjek med:

~~~ts
const validering = validerNytItemFelter(krop);
if (!validering.ok) {
  const fejl =
    validering.felt === "varetype"
      ? da.nytItem.fejlVaretypeMangler
      : da.nytItem.fejlFelterMangler;
  return NextResponse.json({ fejl }, { status: 400 });
}
~~~

4. Brug kun de servervaliderede værdier i item-insert:

~~~ts
.insert({
  user_id: user.id,
  brand: validering.felter.maerke,
  size: validering.felter.stoerrelse,
  condition: validering.felter.stand,
  category: validering.felter.kategori,
  defects_text: krop.fejlBeskrivelse?.trim() || null,
  purchase_price_dkk: krop.koebsprisDkk ?? null,
  status: "draft",
})
~~~

Behold auth, fotoejerskab, fotoroller, preset, rate limit, saldo, ledger og pipeline-start uændret.

- [ ] **Step 5: Kør servervalidering, UI-test og typecheck**

Run: `npm test -- tests/unit/nyt-item-input.test.ts tests/unit/items-route.test.ts tests/unit/nyt-item-form.test.tsx tests/unit/varetyper.test.ts`

Expected: PASS; ukendt varetype giver både `felt: "varetype"` i helperen og HTTP 400 fra routen, mens gyldigt id giver katalogets kategori.

Run: `npm run typecheck`

Expected: PASS uden adgang til rå `krop.maerke`, `krop.stoerrelse` eller `krop.stand` i insert-koden.

- [ ] **Step 6: Commit serverkontrakten**

~~~powershell
git add lib/items/nyt-item-input.ts app/api/items/route.ts tests/unit/nyt-item-input.test.ts tests/unit/items-route.test.ts
git commit -m "feat: validate canonical item types on create"
~~~

---

### Task 5: Kanonisk prompt-routing og produkt-only sikkerhed

**Files:**
- Modify: `lib/pipeline/skabeloner.ts`
- Modify: `tests/unit/skabeloner.test.ts`

**Interfaces:**
- Consumes: `hentVaretypeFraKategori(kategori)` og `PromptFamilie` fra Task 1.
- Preserves: `vaelgSkabelon(kategori)`, `bygOnModelPromptMedSkabelon(args)`, `byggPromptVersion(args)` og legacy keyword-fallback.
- Extends: `KategoriSkabelon` med `visningsform: "person" | "produkt"` og tilføjer skabelonen `produkt`.

- [ ] **Step 1: Skriv fejlende tests for alle promptfamilier**

Udvid den første `describe("kategori-skabeloner ...")` i `tests/unit/skabeloner.test.ts` med:

~~~ts
it.each([
  ["Toppe og T-shirts", "overdel", "person"],
  ["Bukser og jeans", "bukser", "person"],
  ["Nederdele", "kjole", "person"],
  ["Frakker og overtøj", "jakke", "person"],
  ["Sportstøj", "generisk", "person"],
  ["Undertøj og nattøj", "produkt", "produkt"],
  ["Sneakers", "produkt", "produkt"],
  ["Hånd- og skuldertasker", "taske", "person"],
  ["Smykker, ure og solbriller", "produkt", "produkt"],
  ["Børne- og babytøj", "produkt", "produkt"],
])(
  "%s bruger skabelon %s med visningsform %s",
  (kategori, skabelonId, visningsform) => {
    const skabelon = vaelgSkabelon(kategori);
    expect(skabelon.id).toBe(skabelonId);
    expect(skabelon.visningsform).toBe(visningsform);
  },
);

it("bevarer keyword-fallback til ældre fritekstkategorier", () => {
  expect(vaelgSkabelon("Mom jeans str. 28").id).toBe("bukser");
  expect(vaelgSkabelon("gammel striktrøje").id).toBe("overdel");
  expect(vaelgSkabelon("babytøj str. 74").id).toBe("produkt");
});
~~~

Udvid `describe("promptbygning overholder C-2 og C-6")` med:

~~~ts
it("laver børnevarer som produkt-only uden genereret krop", () => {
  const produktPrompt = bygOnModelPromptMedSkabelon({
    preset,
    itemId: "item-barn",
    userId: "bruger-a",
    kategori: "Børne- og babytøj",
  });

  expect(produktPrompt).toContain("product-only secondhand listing image");
  expect(produktPrompt).toContain(
    "No person, child, model, mannequin, body, hands or feet",
  );
  expect(produktPrompt).not.toContain("The person is");
  expect(produktPrompt).not.toContain("anonymous person");
});

it.each([
  "Undertøj og nattøj",
  "Sneakers",
  "Bælter, tørklæder og hovedbeklædning",
])("%s bruger også produkt-only prompt", (kategori) => {
  const produktPrompt = bygOnModelPromptMedSkabelon({
    preset,
    itemId: "item-produkt",
    userId: "bruger-a",
    kategori,
  });
  expect(produktPrompt).toContain("product-only secondhand listing image");
  expect(produktPrompt).not.toContain("The person is");
});
~~~

- [ ] **Step 2: Kør skabelontesten og bekræft de nye forventede fejl**

Run: `npm test -- tests/unit/skabeloner.test.ts`

Expected: FAIL fordi `visningsform` og `produkt` ikke findes, og kanoniske sko/accessories/børnekategorier rammer `generisk`.

- [ ] **Step 3: Tilføj visningsform og produkt-skabelon**

I `lib/pipeline/skabeloner.ts` tilføjes imports:

~~~ts
import {
  hentVaretypeFraKategori,
  type PromptFamilie,
} from "@/lib/data/varetyper";
import type { Preset } from "./presets";
~~~

Udvid typen:

~~~ts
export type KategoriSkabelon = {
  id: string;
  version: number;
  navn: string;
  noegleord: readonly string[];
  visningsform: "person" | "produkt";
  visninger: readonly string[];
  fokus: string;
};
~~~

Tilføj `visningsform: "person"` til de eksisterende `kjole`, `bukser`, `jakke`, `overdel`, `taske` og `generisk`. Indsæt denne skabelon før `generisk`:

~~~ts
{
  id: "produkt",
  version: 1,
  navn: "Produkt uden person",
  noegleord: [
    "børnetøj",
    "babytøj",
    "børnesko",
    "babysko",
    "undertøj",
    "nattøj",
    "lingeri",
    "sneaker",
    "støvle",
    "sandal",
    "sko",
    "accessory",
    "accessories",
    "smykke",
    "solbrille",
    "bælte",
    "tørklæde",
    "hovedbeklædning",
  ],
  visningsform: "produkt",
  visninger: [
    "the item laid flat on a clean, lightly textured neutral surface, photographed from directly above",
    "the item placed naturally on a simple surface near a window, photographed at a slight angle",
  ],
  fokus:
    "Preserve the item's exact shape, proportions, material, colour, construction, hardware, print, logo placement and every visible sign of wear; invent, remove or improve nothing.",
},
~~~

- [ ] **Step 4: Slå kanonisk kategori op før legacy-keywords**

Tilføj mapping og et lokalt opslag ved `GENERISK_SKABELON_ID`:

~~~ts
export const GENERISK_SKABELON_ID = "generisk";

const SKABELON_ID_PR_PROMPTFAMILIE: Record<PromptFamilie, string> = {
  overdel: "overdel",
  underdel: "bukser",
  kjole: "kjole",
  overtoej: "jakke",
  "sport-bad": "generisk",
  "undertoej-nattoej": "produkt",
  sko: "produkt",
  taske: "taske",
  accessory: "produkt",
  "barn-produkt": "produkt",
};

function hentSkabelon(id: string): KategoriSkabelon {
  return KATEGORI_SKABELONER.find((skabelon) => skabelon.id === id)!;
}
~~~

Erstat `vaelgSkabelon` med:

~~~ts
export function vaelgSkabelon(
  kategori: string | null | undefined,
): KategoriSkabelon {
  const kanoniskVaretype = hentVaretypeFraKategori(kategori);
  if (kanoniskVaretype) {
    return hentSkabelon(
      SKABELON_ID_PR_PROMPTFAMILIE[kanoniskVaretype.promptFamilie],
    );
  }

  const tekst = (kategori ?? "").toLocaleLowerCase("da");
  const legacyMatch = KATEGORI_SKABELONER.find(
    (skabelon) =>
      skabelon.id !== GENERISK_SKABELON_ID &&
      skabelon.noegleord.some((ord) => tekst.includes(ord)),
  );
  return legacyMatch ?? hentSkabelon(GENERISK_SKABELON_ID);
}
~~~

Dette bevarer de eksisterende tekstmatches og gør samtidig gamle børne-, sko-, undertøjs- og accessorytekster produkt-only.

- [ ] **Step 5: Del promptbygningen i person- og produktgren**

Tilføj ved de eksisterende promptkonstanter:

~~~ts
const PRODUKT_REFERENCE_INSTRUKS =
  "Create a product-only secondhand listing image using EXACTLY the item from " +
  "the reference image — preserve its colour, material, construction, print, " +
  "logos, proportions, visible wear and every detail precisely; invent, remove " +
  "or improve nothing.";

const PRODUKT_FOTOSTIL =
  "Photo style: an authentic casual smartphone product photo taken at home for " +
  "a secondhand listing — not a professional photoshoot, not editorial and not " +
  "staged; use natural mixed light, realistic shadows, mild phone sensor noise " +
  "and slightly imperfect framing.";

const PRODUKT_NEGATIV_LISTE =
  "No person, child, model, mannequin, body, hands or feet. Avoid: invented " +
  "props, extra accessories, changed logos or text, CGI appearance, artificial " +
  "backgrounds and studio lighting.";
~~~

Efter beregning af `skabelon` og `sted` i `bygOnModelPromptMedSkabelon` indsættes denne tidlige produktgren:

~~~ts
if (skabelon.visningsform === "produkt") {
  return [
    PRODUKT_REFERENCE_INSTRUKS,
    "Presentation: " + vaelgVisning(skabelon, args.itemId) + ".",
    "Location: " + sted + ".",
    skabelon.fokus,
    PRODUKT_FOTOSTIL,
    PRODUKT_NEGATIV_LISTE,
  ].join(" ");
}
~~~

Behold den eksisterende person-prompt efter grenen. `byggPromptVersion` skal fortsat kalde `vaelgSkabelon`, så `produkt@v1` automatisk registreres for de nye produkt-only familier.

- [ ] **Step 6: Kør skabelontestene og hele unit-suiten**

Run: `npm test -- tests/unit/skabeloner.test.ts tests/unit/varetyper.test.ts`

Expected: PASS; kanoniske kategorier rammer den forventede skabelon, gamle `Mom jeans` bruger fallback, og børneprompten indeholder ingen personinstruks.

Run: `npm test`

Expected: PASS for hele Vitest-suiten uden regressioner i pipeline-, route-, marketing- eller kredittests.

- [ ] **Step 7: Kør alle statiske produktionskontroller**

Run: `npm run typecheck`

Expected: exitkode 0.

Run: `npm run lint`

Expected: exitkode 0 uden nye warnings.

Run: `npm run build`

Expected: exitkode 0, og Next.js producerer `/nyt-item` samt `/api/items` uden prerender- eller typefejl.

Run: `git diff --check`

Expected: ingen whitespace-fejl.

- [ ] **Step 8: Foretag den målrettede browserkontrol**

Start kun en ny dev-server, hvis `http://127.0.0.1:3100` ikke allerede svarer. Åbn `http://127.0.0.1:3100/nyt-item` i den eksisterende app-browser eller Chrome-session og kontroller:

1. Trin 1 står før Fotos og hedder `Hvad sælger du?`.
2. Alle fem grupper kan vælges, og deres brede varetyper vises.
3. Det valgte item bliver stående visuelt.
4. Mærkefeltet viser Seljas egen dropdown; `samsoe` finder `Samsøe Samsøe`.
5. Piletaster, Enter, Escape og Tab fungerer, og `Intet mærke` kan vælges.
6. Der vises intet native Windows-`datalist`.
7. Forsøg på indsendelse uden varetype viser fejlen ved trin 1 og starter ingen upload.
8. Mobilbredde på cirka 390 px giver ingen vandret scroll.

- [ ] **Step 9: Commit pipeline-routing**

~~~powershell
git add lib/pipeline/skabeloner.ts tests/unit/skabeloner.test.ts
git commit -m "feat: map item types to safe image prompts"
~~~

- [ ] **Step 10: Slutkontrol af leverancens commitgrænse**

Run: `git status --short`

Expected: kun brugerens eksisterende `.impeccable/live/` må stå som untracked; ingen implementeringsfiler må være ustagede.

Run: `git log --oneline -5`

Expected: de fem task-commits står øverst i rækkefølgen katalog, mærkesøgning, UI, server og pipeline.
