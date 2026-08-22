import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MarketingLayout from "@/app/(marketing)/layout";
import LogInd from "@/app/(marketing)/log-ind/page";
import Forside from "@/app/(marketing)/page";
import { vinted } from "@/lib/copy/vinted";

const navigation = vi.hoisted(() => ({ sti: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.sti,
  useRouter: () => ({ replace: () => {}, refresh: () => {}, push: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));

function ankerFor(html: string, href: string): string {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<a(?=[^>]*href="${escaped}")[^>]*>`))?.[0] ?? "";
}

function alleTekster(vaerdi: unknown): string[] {
  if (typeof vaerdi === "string") return [vaerdi];
  if (vaerdi !== null && typeof vaerdi === "object") {
    return Object.values(vaerdi).flatMap(alleTekster);
  }
  return [];
}

describe("forsidens forventningsafstemning", () => {
  it("varsler om kreditter før signup uden at låse et kreditforhold", async () => {
    const html = renderToStaticMarkup(await Forside());

    expect(html).toContain("Du skal bruge kreditter for at lave en annonce.");
    // Ejer-ordre 2026-08-16: abonnementet er standardvejen — uden binding
    expect(html).toContain("uden binding, opsig når som helst");
    expect(html).not.toMatch(/1 kredit\s*=\s*1 færdig annonce/i);
    expect(html).not.toContain("Opret dig og lav din første annonce");
  });

  it("afgrænser løftet om to minutter til selve annoncen", async () => {
    const html = renderToStaticMarkup(await Forside());

    expect(html).toMatch(
      /Selve annoncen tager cirka 2 minutter[^.]*logget ind[^.]*kreditter/i,
    );
  });

  it("tilbyder både log ind og opret konto med adgangskode", () => {
    const html = renderToStaticMarkup(<LogInd />);

    // Traditionelt login (A-1 overstyret): e-mail + adgangskode, ikke magic link
    expect(html).toMatch(/type="password"/);
    expect(html).toContain("Log ind");
    expect(html).toContain("Opret konto");
    expect(html).not.toMatch(/magic|send mig et link/i);
  });

  it("giver billedrækken en synlig overskrift med produktkontekst", async () => {
    const html = renderToStaticMarkup(await Forside());

    expect(html).toMatch(/<h2[^>]*>Tøjet vist båret<\/h2>/);
  });

  it("forklarer hvordan resultatet bruges på Vinted uden at gentage leverancen", async () => {
    const html = renderToStaticMarkup(await Forside());

    expect(html).toContain("Sådan bruger du resultatet");
    expect(html).toMatch(/helhedsfoto[^.]*billede 1/i);
    expect(html).toMatch(/Selja får ikke adgang til din Vinted-konto/i);
    expect(html).not.toContain("Det får du");
  });

  it("bevarer gyldig listesemantik i det mørke Vinted-bånd", async () => {
    const html = renderToStaticMarkup(await Forside());

    expect(html).toMatch(/<ul class="mt-6 flex max-w-2xl[^>]*"><li>/);
  });

  it("holder sektionsoverskriften over trintitlerne i det visuelle hierarki", async () => {
    const html = renderToStaticMarkup(await Forside());
    const overskrift = html.match(/<h2[^>]*>Sådan virker det<\/h2>/)?.[0] ?? "";

    expect(overskrift).toContain("font-display");
    expect(overskrift).toContain("text-display");
  });

  it("viser redaktionelle numre med AA-egnet tekststyrke", async () => {
    const html = renderToStaticMarkup(await Forside());
    const numre = (html.match(/<span[^>]*>0[1-3]<\/span>/g) ?? []).filter(
      (nummer) => nummer.includes("text-tekst"),
    );

    // 3 trin — guides- og markedstjek-sektionerne røg af forsiden i 21/8-oprydningen
    expect(numre).toHaveLength(3);
    for (const nummer of numre) {
      expect(nummer).toContain("text-tekst/70");
      expect(nummer).not.toContain("text-tekst/50");
    }
  });

  it("begrænser tankestreger i forsidecopy", () => {
    const antal = alleTekster(vinted).join(" ").match(/—/g)?.length ?? 0;

    expect(antal).toBeLessThanOrEqual(4);
  });
});

describe("marketingnavigation", () => {
  beforeEach(() => {
    navigation.sti = "/";
  });

  it("markerer kun den aktuelle side", () => {
    navigation.sti = "/priser";
    const html = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );

    expect(ankerFor(html, "/priser")).toContain('aria-current="page"');
    expect(ankerFor(html, "/laer")).not.toContain("aria-current");
    expect(ankerFor(html, "/")).not.toContain("aria-current");
  });

  it("markerer forsiden og undersider i Lær korrekt", () => {
    navigation.sti = "/";
    const forside = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );
    expect(ankerFor(forside, "/")).toContain('aria-current="page"');

    navigation.sti = "/laer/fototeknik";
    const guide = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );
    expect(ankerFor(guide, "/laer")).toContain('aria-current="page"');
    expect(ankerFor(guide, "/")).not.toContain("aria-current");
  });

  it("giver login-knappen en synlig aktiv tilstand", () => {
    navigation.sti = "/log-ind";
    const html = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );
    const logInd = ankerFor(html, "/log-ind");

    expect(logInd).toContain('aria-current="page"');
    expect(logInd).toContain("bg-koks");
  });

  it("beholder Sådan-ankeret synligt og trykbart på mobil", () => {
    const html = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );
    const anker = ankerFor(html, "/#saadan");

    expect(anker).not.toMatch(/class="[^"]*\bhidden\b/);
    expect(anker).toContain("min-w-touch");
    expect(html).toMatch(/>Sådan<\/span>/);
  });

  it("giver de smalle tekstlinks et fuldt 44 px trykmål", () => {
    const html = renderToStaticMarkup(
      <MarketingLayout>
        <p>Indhold</p>
      </MarketingLayout>,
    );

    for (const href of ["/#saadan", "/laer", "/priser"]) {
      expect(ankerFor(html, href)).toContain("min-w-touch");
    }
  });
});
