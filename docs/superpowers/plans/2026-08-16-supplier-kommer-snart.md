# Suppliers · Kommer snart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vis en tydelig supplier-teaser på alle Oversigt-tilstande og en autentificeret `/suppliers`-side, uden at åbne katalog, priser eller betaling før Vinted-lanceringen.

**Architecture:** Supplier-copy samles i den eksisterende danske copy-kontrakt. Et fokuseret server-renderet teaser-kort genbruges på Oversigt, mens den nye side ligger under den allerede login-beskyttede `(app)`-layoutgruppe; ingen database, API-ruter, klienttilstand eller Stripe-kode tilføjes.

**Tech Stack:** Next.js 15 App Router, React 19 Server Components, TypeScript, Tailwind CSS, Vitest og `react-dom/server`.

**Spec:** `docs/superpowers/specs/2026-08-16-supplier-butik-design.md`

## Global Constraints

- Første launch viser kun `Kommer snart`; der kan ikke købes supplier-links.
- `/suppliers` kræver login via det eksisterende `app/(app)/layout.tsx`.
- Oversigt-kortet skal vises både med nul items og med en udfyldt itemliste.
- Kortets titel er `Suppliers`, stemplet er `Kommer snart`, og CTA'en er `Læs mere` til `/suppliers`.
- Siden må ikke vise supplier-kort, priser, falske eksempler, nedtælling, venteliste eller købsmulighed.
- Siden skal forklare manuelt undersøgte links, kommende engangskøb adskilt fra billedkreditter og Vinted-værktøjet som aktuelt fokus.
- Der tilføjes ingen supplier-tabeller, migrationer, API-ruter, Stripe-flow eller nyt punkt i bundnavigationen.
- Billedkredit-, item- og eksisterende Stripe-flow skal forblive uændret.
- Al ny brugervendt tekst placeres i `lib/copy/da.ts`.
- Følg `DESIGN.md` v6: sentence case, højst én mørk blok på en side, 1 px kanter, ingen skygger og ingen nye animationer.

---

### Task 1: Supplier-teaser og informationsside

**Files:**
- Create: `app/(app)/suppliers/supplier-kommer-snart-kort.tsx`
- Create: `app/(app)/suppliers/page.tsx`
- Modify: `app/(app)/oversigt/page.tsx`
- Modify: `lib/copy/da.ts`
- Test: `tests/unit/suppliers-coming-soon.test.tsx`

**Interfaces:**
- Consumes: `da.suppliers`, `Badge`, `Link`, den eksisterende login-beskyttelse i `app/(app)/layout.tsx` og Oversigts eksisterende Supabase-query.
- Produces: `SupplierKommerSnartKort(): JSX.Element`, `SuppliersPage(): JSX.Element` som default export og `da.suppliers` med felterne `titel`, `stempel`, `kortTekst`, `laesMere`, `sideIntro`, `fokusTitel`, `fokusTekst`, `indholdTitel`, `indhold` og `tilbage`.

- [ ] **Step 1: Skriv den fejlende adfærdstest**

Opret `tests/unit/suppliers-coming-soon.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Oversigt from "@/app/(app)/oversigt/page";
import SuppliersPage from "@/app/(app)/suppliers/page";

const database = vi.hoisted(() => ({ items: [] as Record<string, unknown>[] }));

vi.mock("@/lib/supabase/server", () => ({
  opretServerKlient: async () => ({
    from: () => ({
      select: () => ({
        order: async () => ({ data: database.items }),
      }),
    }),
  }),
}));

async function renderOversigt(items: Record<string, unknown>[]): Promise<string> {
  database.items = items;
  return renderToStaticMarkup(await Oversigt());
}

describe("supplier-teaser ved Vinted-launch", () => {
  it.each([
    ["tom", []],
    [
      "med items",
      [
        {
          id: "item-1",
          brand: "Ganni",
          titel: "Ganni-kjole",
          category: "Kjoler",
          status: "active",
          sold_price_dkk: null,
          leveret_at: "2026-08-16T10:00:00.000Z",
          solgt_at: null,
          created_at: "2026-08-16T09:00:00.000Z",
          generations: [],
        },
      ],
    ],
  ])("viser Suppliers · Kommer snart på en %s Oversigt", async (_navn, items) => {
    const html = await renderOversigt(items as Record<string, unknown>[]);

    expect(html).toContain("Suppliers");
    expect(html).toContain("Kommer snart");
    expect(html).toContain('href="/suppliers"');
    expect(html).toContain("Læs mere");
  });

  it("forklarer den kommende butik uden at åbne salget", () => {
    const html = renderToStaticMarkup(<SuppliersPage />);

    expect(html).toContain("Vinted først");
    expect(html).toMatch(/manuelt undersøgt/i);
    expect(html).toMatch(/engangskøb/i);
    expect(html).toMatch(/billedkreditter/i);
    expect(html).toContain('href="/oversigt"');
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
    expect(html).not.toMatch(/\d+[.,]?\d*\s*kr\.?/i);
    expect(html).not.toMatch(/href="\/suppliers\/[^\"]+"/);
    expect(html).not.toMatch(/venteliste|nedtælling|checkout/i);
  });
});
```

- [ ] **Step 2: Kør testen og bekræft, at den fejler af den rigtige grund**

Run: `npm test -- tests/unit/suppliers-coming-soon.test.tsx`

Expected: FAIL fordi `@/app/(app)/suppliers/page` endnu ikke findes. Ingen produktionskode må være ændret før denne røde test.

- [ ] **Step 3: Tilføj den samlede danske supplier-copy**

Tilføj dette top-level felt i `da` i `lib/copy/da.ts`, umiddelbart efter `oversigt`:

```ts
  suppliers: {
    titel: "Suppliers",
    stempel: "Kommer snart",
    kortTekst:
      "Kuraterede supplier-links kommer efter lanceringen af Seljas Vinted-værktøj.",
    laesMere: "Læs mere",
    sideIntro:
      "Vi bygger en lille butik med kuraterede supplier-links. Den åbner først, når Vinted-værktøjet er godt lanceret.",
    fokusTitel: "Vinted først",
    fokusTekst:
      "Lige nu bruger vi kræfterne på at gøre dine Vinted-annoncer hurtigere og bedre. Supplier-butikken åbner som næste del af Selja.",
    indholdTitel: "Det får du, når vi åbner",
    indhold: [
      "Et direkte supplier-link, som er manuelt undersøgt af Selja.",
      "Klare oplysninger om kategori, land, minimumsbestilling og levering, før du vælger.",
      "Et engangskøb i danske kroner, helt adskilt fra dine billedkreditter.",
    ],
    tilbage: "Tilbage til Oversigt",
  },
```

- [ ] **Step 4: Implementér teaser-kortet**

Opret `app/(app)/suppliers/supplier-kommer-snart-kort.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { da } from "@/lib/copy/da";

export function SupplierKommerSnartKort() {
  return (
    <section
      aria-labelledby="supplier-teaser-titel"
      className="mt-6 rounded-bloed border border-kant bg-flade p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="supplier-teaser-titel" className="font-display text-lead font-bold">
          {da.suppliers.titel}
        </h2>
        <Badge>{da.suppliers.stempel}</Badge>
      </div>
      <p className="mt-3 max-w-laesbar text-tekst/70">{da.suppliers.kortTekst}</p>
      <Link href="/suppliers" className="soem-link mt-4 inline-flex min-h-touch items-center font-medium">
        {da.suppliers.laesMere}
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: Implementér den autentificerede informationsside**

Opret `app/(app)/suppliers/page.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { da } from "@/lib/copy/da";

export const metadata = { title: `${da.suppliers.titel} · ${da.site.navn}` };

export default function SuppliersPage() {
  return (
    <main className="py-6">
      <Badge>{da.suppliers.stempel}</Badge>
      <h1 className="mt-4 font-display text-kaempe font-bold">{da.suppliers.titel}</h1>
      <p className="mt-4 max-w-laesbar text-tekst/70">{da.suppliers.sideIntro}</p>

      <section aria-labelledby="supplier-fokus-titel" className="mt-8 rounded-bloed bg-gran p-5 text-kalk">
        <h2 id="supplier-fokus-titel" className="font-display text-lead font-bold">
          {da.suppliers.fokusTitel}
        </h2>
        <p className="mt-3 text-hoer">{da.suppliers.fokusTekst}</p>
      </section>

      <Card className="mt-6">
        <h2 className="font-display text-lead font-bold">{da.suppliers.indholdTitel}</h2>
        <ul className="mt-4 space-y-3">
          {da.suppliers.indhold.map((punkt) => (
            <li key={punkt} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-gran">—</span>
              <span>{punkt}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Link href="/oversigt" className="soem-link mt-8 inline-flex min-h-touch items-center font-medium">
        {da.suppliers.tilbage}
      </Link>
    </main>
  );
}
```

Siden er allerede autentificeret, fordi filen ligger under `app/(app)` og arver `app/(app)/layout.tsx`. Tilføj ikke separat auth-query eller redirect.

- [ ] **Step 6: Integrér kortet én gang i Oversigts fælles struktur**

I `app/(app)/oversigt/page.tsx`:

1. Importér `SupplierKommerSnartKort` fra `../suppliers/supplier-kommer-snart-kort`.
2. Fjern den tidlige `if (items.length === 0) return ...`-gren.
3. Behold ét fælles `<main>` og ét fælles `<h1>`, placer `<SupplierKommerSnartKort />` umiddelbart efter `<h1>`, og render derefter enten tomtilstanden eller statistik + `ItemListe`:

```tsx
      <SupplierKommerSnartKort />

      {items.length === 0 ? (
        <div className="mt-6 rounded-bloed bg-gran p-6 text-kalk">
          <p className="max-w-laesbar">{da.oversigt.tom}</p>
          <Link href="/nyt-item" className="knap-link knap-link-lys mt-6 px-5">
            {da.oversigt.foersteKnap}
          </Link>
        </div>
      ) : (
        <>
          {solgte.length > 0 ? (
            <section
              className="mt-6 rounded-bloed bg-gran p-5 text-kalk"
              aria-label={da.oversigt.statistikTitel}
            >
              <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
                {da.oversigt.statistikTitel}
              </p>
              <p className="mt-3 font-mono text-kaempe font-bold leading-none">
                <Taeller til={samletVaerdi} /> kr.
              </p>
              <p className="mt-3 text-detalje text-hoer">
                {da.oversigt.solgtMedSelja} · {da.oversigt.solgteAntal(solgte.length)}
                {snitLiggetid != null ? ` · ${da.oversigt.liggetid(snitLiggetid)}` : null}
              </p>
            </section>
          ) : null}

          <ItemListe
            items={items.map((item) => ({
              id: item.id,
              titel: item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
              status: item.status,
              soldPrisDkk: item.sold_price_dkk,
              paaVej:
                item.status === "draft" &&
                (item.generations ?? []).some(
                  (generation) =>
                    generation.status === "queued" || generation.status === "running",
                ),
            }))}
          />
        </>
      )}
```

Fjern den gamle duplikerede statistik- og `ItemListe`-blok, så hver del kun findes én gang. Flyt ikke supplier-kortet ind i betingelsen.

- [ ] **Step 7: Kør den fokuserede test og bekræft grøn**

Run: `npm test -- tests/unit/suppliers-coming-soon.test.tsx`

Expected: PASS med 3 tests: tom Oversigt, udfyldt Oversigt og den lukkede informationsside.

- [ ] **Step 8: Kør den fulde kvalitetspakke**

Run: `npm test`

Expected: alle tests PASS.

Run: `npm run typecheck`

Expected: exit code 0 uden TypeScript-fejl.

Run: `npm run lint`

Expected: exit code 0 uden ESLint-fejl eller warnings.

Run: `npm run build`

Expected: exit code 0, og Next.js-routeoversigten indeholder `/suppliers`.

- [ ] **Step 9: Kontrollér scope og commit**

Run: `git diff --check`

Expected: ingen output.

Run: `git status --short`

Expected: kun de fem filer fra denne task er ændrede/oprettede; den eksisterende untrackede `.impeccable/live/` må ikke stages eller ændres.

```bash
git add -- "app/(app)/suppliers/supplier-kommer-snart-kort.tsx" "app/(app)/suppliers/page.tsx" "app/(app)/oversigt/page.tsx" "lib/copy/da.ts" "tests/unit/suppliers-coming-soon.test.tsx"
git commit -m "feat: tease upcoming supplier store"
```
