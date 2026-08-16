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
          status: "draft",
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
